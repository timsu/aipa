import { Session } from "next-auth";
import prisma from "@/server/prisma";
import { Workspace, WorkspaceInvite, WorkspaceUser } from "@prisma/client";
import { ApiError } from "@/server/apiWrapper";
import { WorkspaceRole } from "@/types";
import { generateUniqueRandomString } from "@/lib/utils";
import { stripName, sendInviteEmail } from ".";

export async function addMember(
  session: Session,
  creator: WorkspaceUser & { workspace: Workspace },
  body: any
) {
  const isAdmin = creator.role == WorkspaceRole.ADMIN;
  const workspace = creator.workspace;

  const { email: inputEmail, role } = body;
  if (!isAdmin && role == WorkspaceRole.ADMIN) throw new ApiError(403, "Forbidden");

  const email = stripName(inputEmail).toLowerCase();
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (
    existingUser &&
    (await prisma.workspaceUser.findFirst({
      where: { userId: existingUser.id, workspaceId: workspace.id, deletedAt: null },
    }))
  ) {
    throw new ApiError(400, "User already added");
  }

  let invite: WorkspaceInvite | null = await prisma.workspaceInvite.findFirst({
    where: { email, workspaceId: workspace.id, deletedAt: null },
  });

  if (!invite) {
    const slug = await generateUniqueRandomString(20, async (slug) => {
      return (await prisma.workspaceInvite.findUnique({ where: { slug } })) == null;
    });

    invite = await prisma.workspaceInvite.create({
      data: {
        slug,
        email,
        workspaceId: workspace.id,
        role,
        userId: existingUser?.id,
        creatorId: creator.userId,
      },
    });
  }

  sendInviteEmail(email, invite.slug, session, workspace);

  return {
    id: existingUser?.id || "",
    name: existingUser?.name || email,
    role: role,
    pending: true,
    slug: invite.slug,
  };
}
