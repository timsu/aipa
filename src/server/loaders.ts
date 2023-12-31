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

export const allWorkspaces = async (userId: string) => {
  return await prisma.workspace.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
  });
};

export const allWorkspaceIds = async (userId: string) => {
  return (
    await prisma.workspace.findMany({
      select: {
        id: true,
      },
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
    })
  ).map((w) => w.id);
};

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

  const workspaces = await allWorkspaces(userId);

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
            email: true,
            welcomedAt: true,
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

  const users: User[] = people.map((p) => ({
    id: p.id,
    name: p.name || p.email,
    image: p.image,
  }));

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
    people: serialize(users),
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

export const getProject = async (projectId: string, session: Session) => {
  if (!projectId) return null;

  const workspaces = await allWorkspaceIds(session.user.id);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: {
        in: workspaces,
      },
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
  });

  return project;
};

export const getIssue = async (projectId: string, issueId: string, session: Session) => {
  if (!projectId || !issueId) return null;

  const project = await getProject(projectId, session);
  if (!project) return null;

  const idAsNumber = parseInt(issueId);
  const criteria =
    isNaN(idAsNumber) || idAsNumber.toString() != issueId
      ? { id: issueId }
      : { number: idAsNumber };

  const item = await prisma.issue.findFirst({
    where: {
      projectId,
      ...criteria,
    },
  });

  return item;
};
