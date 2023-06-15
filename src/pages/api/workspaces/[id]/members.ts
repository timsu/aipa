import { Session } from "next-auth";

import prisma from "@/server/prisma";
import { ProjectValidation, WorkspaceUser } from "@prisma/client";
import jwt from "jsonwebtoken";

import type { NextApiRequest } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { getProject } from "@/server/loaders";
import { WorkspaceRole } from "@/types";
import emails from "@/emails/emails";
import { titleCase } from "@/lib/utils";

export default authApiWrapper<WorkspaceUser[] | WorkspaceUser>(async function handler(
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

  const isAdmin = canAccess.role == WorkspaceRole.ADMIN;

  if (req.method == "GET") {
    return await prisma.workspaceUser.findMany({
      where: {
        workspaceId: id as string,
        deletedAt: null,
      },
    });
  }

  const { email, role } = req.body;
  if (!isAdmin && role == WorkspaceRole.ADMIN) throw new ApiError(403, "Forbidden");

  const existingUser = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  const actualEmail = stripName(email).toLowerCase();
  const user =
    existingUser ||
    (await prisma.user.create({
      data: {
        name: titleCase(actualEmail.split("@")[0]),
        email: actualEmail,
      },
    }));

  if (
    await prisma.workspaceUser.findFirst({
      where: { userId: user.id, workspaceId: id as string, deletedAt: null },
    })
  ) {
    throw new ApiError(400, "User already added");
  }

  const workspaceUser = await prisma.workspaceUser.upsert({
    where: {
      userId_workspaceId: {
        workspaceId: id as string,
        userId: user.id,
      },
    },
    update: {
      role,
      deletedAt: null,
    },
    create: {
      role,
      workspaceId: id as string,
      userId: user.id,
    },
  });

  // generate token to sign in automatically
  const secret = process.env.NEXTAUTH_SECRET!;
  const token = jwt.sign({ email: actualEmail }, secret, { expiresIn: "1w" });
  const data = {
    email: actualEmail,
    token,
    inviter: session.dbUser.name,
    workspaceId: id as string,
  };

  const path = new URLSearchParams(data).toString();
  await emails.sendInvite(
    email,
    session.dbUser.name,
    session.dbUser.email,
    canAccess.workspace.name,
    path
  );

  return workspaceUser;
});

const stripName = (e: string) => e.replace(/^.+<(.+)>$/, "$1");
