import prisma, { serialize } from "@/server/prisma";
import { Session } from "next-auth";

export const loadWorkspaceData = async (session: Session) => {
  const userId = session.user.id;

  const workspaces = await prisma.workspace.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
  });

  const activeWorkspaceId = session.dbUser.activeWorkspace;
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const projects = activeWorkspace
    ? await prisma.project.findMany({
        where: {
          workspace: {
            id: activeWorkspace.id,
          },
          archivedAt: null,
          deletedAt: null,
        },
      })
    : [];

  return {
    workspaces: serialize(workspaces),
    activeWorkspace: activeWorkspace?.id,
    projects: serialize(projects),
  };
};
