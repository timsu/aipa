import { Session } from "next-auth";

import prisma from "@/server/prisma";
import { ProjectValidation, Workspace, WorkspaceUser } from "@prisma/client";
import jwt from "jsonwebtoken";

import type { NextApiRequest } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { getProject } from "@/server/loaders";
import { User, WorkspaceRole } from "@/types";
import emails from "@/emails/emails";
import { titleCase } from "@/lib/utils";
import { sendInviteEmail } from "./index";

export default authApiWrapper<void>(async function handler(req: NextApiRequest, session: Session) {
  const { id } = req.query;
  const { email } = req.body;

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

  const invite = await prisma.workspaceInvite.findFirst({
    where: { email, workspaceId: id as string, deletedAt: null },
  });
  if (!invite) {
    throw new ApiError(400, "No inviet found");
  }

  await sendInviteEmail(email, invite.slug, session, canAccess.workspace);
});
