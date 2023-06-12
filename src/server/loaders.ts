import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";
import prisma, { serialize } from "@/server/prisma";
import { ProjectVisibility, User, WorkspaceProps } from "@/types";
import { Project, Workspace } from "@prisma/client";
import { GetServerSidePropsContext, Redirect } from "next";
import { Session } from "next-auth";

type WorkspaceData = {
  session: Session;
  redirect: { redirect: Redirect } | null;
} & WorkspaceProps;

export const loadWorkspaceData = async (
  context: GetServerSidePropsContext
): Promise<WorkspaceData> => {
  const session = await sessionOrRedirect(context);
  if (isRedirect(session))
    return {
      userId: "",
      session: {} as Session,
      workspaces: [],
      activeWorkspace: null,
      projects: [],
      people: [],
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

  const [projects, people] = activeWorkspace
    ? await Promise.all([
        prisma.project.findMany(allProjectsForWorkspace(activeWorkspace.id, session)),
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            image: true,
          },
          where: {
            workspaces: {
              some: {
                workspaceId: activeWorkspace.id,
                deletedAt: null,
              },
            },
          },
        }),
      ])
    : [[], []];

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
    userId,
    workspaces: serialize(workspaces),
    activeWorkspace: activeWorkspace?.id || null,
    projects: serialize(projects),
    people: serialize(people),
    redirect,
  };
};

export const allProjectsForWorkspace = (workspaceId: string, session: Session) => {
  return {
    where: {
      workspace: {
        id: workspaceId,
      },
      archivedAt: null,
      deletedAt: null,
      OR: [
        {
          users: {
            some: {
              userId: session.user.id,
            },
          },
        },
        {
          visibility: ProjectVisibility.ALL,
        },
      ],
    },
  };
};
