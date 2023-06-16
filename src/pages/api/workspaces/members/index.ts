import { Session } from "next-auth";

import prisma from "@/server/prisma";
import { ProjectValidation, Workspace } from "@prisma/client";
import jwt from "jsonwebtoken";

import type { NextApiRequest } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { getProject } from "@/server/loaders";
import { User } from "@/types";
import emails from "@/emails/emails";
import { titleCase } from "@/lib/utils";
import { addMember } from "./post";
import { getMembers } from "./get";
import { removeMember } from "@/pages/api/workspaces/members/delete";

export default authApiWrapper<User[] | User | void>(async function handler(
  req: NextApiRequest,
  session: Session
) {
  const { id } = req.query;

  const canAccess = await prisma.workspaceUser.findFirst({
    where: {
      workspaceId: id as string,
      userId: session.user.id,
      deletedAt: null,
    },
    include: {
      workspace: true,
    },
  });
  if (!canAccess) throw new ApiError(404, "Workspace not found");

  if (req.method == "GET") {
    return await getMembers(canAccess.workspace);
  }

  if (req.method == "DELETE") {
    return await removeMember(canAccess, req.body);
  }

  return await addMember(session, canAccess, req.body);
});

export const stripName = (e: string) => e.replace(/^.+<(.+)>$/, "$1");

export async function sendInviteEmail(
  email: string,
  slug: string,
  session: Session,
  workspace: Workspace
) {
  const data = {
    email,
    inviter: session.dbUser.name,
  };

  const path = `/join/${slug}` + new URLSearchParams(data).toString();
  await emails.sendInvite(email, session.dbUser.name, session.dbUser.email, workspace.name, path);
}
