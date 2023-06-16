import prisma from "@/server/prisma";
import { Workspace } from "@prisma/client";

export async function getMembers(workspace: Workspace) {
  const users = await prisma.workspaceUser.findMany({
    where: {
      workspaceId: workspace.id,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          welcomedAt: true,
        },
      },
    },
  });

  const invites = await prisma.workspaceInvite.findMany({
    where: {
      workspaceId: workspace.id,
      deletedAt: null,
      joinedAt: null,
    },
  });

  return users
    .map((wu) => ({
      id: wu.userId,
      name: wu.user.name || wu.user.email,
      role: wu.role,
    }))
    .concat(
      invites.map((invite) => ({
        id: invite.id,
        name: invite.email,
        role: invite.role,
        pending: true,
      }))
    );
}
