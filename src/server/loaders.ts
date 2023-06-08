import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";
import prisma, { serialize } from "@/server/prisma";
import { Project, Workspace } from "@prisma/client";
import { GetServerSidePropsContext, Redirect } from "next";
import { Session } from "next-auth";

type WorkspaceData = {
  session: Session;
  workspaces: Workspace[];
  activeWorkspace: string | null;
  projects: Project[];
  redirect: { redirect: Redirect } | null;
};

export const loadWorkspaceData = async (
  context: GetServerSidePropsContext
): Promise<WorkspaceData> => {
  const session = await sessionOrRedirect(context);
  if (isRedirect(session))
    return {
      session: {} as Session,
      workspaces: [],
      activeWorkspace: null,
      projects: [],
      redirect: session,
    };

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

  const redirect =
    workspaces.length == 0
      ? context.resolvedUrl.includes("/workspaces/new")
        ? null
        : {
            redirect: {
              destination: "/workspaces/new",
              permanent: false,
            },
          }
      : projects.length == 0
      ? context.resolvedUrl.includes("/projects/new")
        ? null
        : {
            redirect: {
              destination: "/projects/new",
              permanent: false,
            },
          }
      : null;

  return {
    session,
    workspaces: serialize(workspaces),
    activeWorkspace: activeWorkspace?.id || null,
    projects: serialize(projects),
    redirect,
  };
};
