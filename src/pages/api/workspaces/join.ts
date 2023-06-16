import { Session } from "next-auth";

import prisma from "@/server/prisma";

import type { NextApiRequest } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { WorkspaceRole } from "@/types";

export default authApiWrapper<void>(async function handler(req: NextApiRequest, session: Session) {
  const { slug, email } = req.body;

  const invite = await prisma.workspaceInvite.findFirst({
    where: {
      slug,
      email,
      deletedAt: null,
    },
    include: {
      workspace: true,
    },
  });
  if (!invite) throw new ApiError(404, "Invalid invite");
  if (invite.joinedAt) throw new ApiError(400, "Invite already used");

  const updateWorkspaceUser = async () => {
    const existing = await prisma.workspaceUser.findFirst({
      where: {
        workspaceId: invite.workspaceId,
        userId: session.user.id,
      },
    });

    if (existing) {
      await prisma.workspaceUser.update({
        where: {
          userId_workspaceId: {
            userId: session.user.id,
            workspaceId: invite.workspaceId,
          },
        },
        data: {
          role: invite.role,
          deletedAt: null,
        },
      });
    } else {
      await prisma.workspaceUser.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: session.user.id,
          role: WorkspaceRole.MEMBER,
        },
      });
    }
  };

  await Promise.all([
    prisma.workspaceInvite.update({
      where: {
        id: invite.id,
      },
      data: {
        joinedAt: new Date(),
      },
    }),

    updateWorkspaceUser(),

    prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        activeWorkspace: invite.workspaceId,
      },
    }),
  ]);
});
