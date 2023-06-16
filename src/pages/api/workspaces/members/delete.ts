import prisma from "@/server/prisma";
import { Workspace, WorkspaceInvite, WorkspaceUser } from "@prisma/client";
import { ApiError } from "@/server/apiWrapper";
import { WorkspaceRole } from "@/types";
import { stripName } from ".";

export async function removeMember(deleter: WorkspaceUser & { workspace: Workspace }, body: any) {
  const isAdmin = deleter.role == WorkspaceRole.ADMIN;
  const workspace = deleter.workspace;

  const { email: inputEmail, userId } = body;
  const email = stripName(inputEmail).toLowerCase();

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (existingUser) {
    const existingWorkspaceUser = await prisma.workspaceUser.findFirst({
      where: { userId: existingUser.id, workspaceId: workspace.id, deletedAt: null },
    });
    if (existingWorkspaceUser) {
      if (existingWorkspaceUser.role == WorkspaceRole.ADMIN && !isAdmin)
        throw new ApiError(403, "Forbidden");
      await prisma.workspaceUser.update({
        where: { userId_workspaceId: { userId: existingUser.id, workspaceId: workspace.id } },
        data: { deletedAt: new Date() },
      });
      return;
    }
  }

  const existingInvite: WorkspaceInvite | null = await prisma.workspaceInvite.findFirst({
    where: { email, workspaceId: workspace.id, deletedAt: null },
  });

  if (!existingInvite) throw new ApiError(404, "Not found");
  if (existingInvite.role == WorkspaceRole.ADMIN && !isAdmin) throw new ApiError(403, "Forbidden");

  await prisma.workspaceInvite.update({
    where: { id: existingInvite.id },
    data: { deletedAt: new Date() },
  });
}
