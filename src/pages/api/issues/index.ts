import { getServerSession, Session } from "next-auth";

import prisma from "@/server/prisma";
import { tracker } from "@/server/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma, { Issue, Project, Workspace } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { IssueState } from "@/types";

export default authApiWrapper<Issue[] | Issue>(function handler(
  req: NextApiRequest,
  session: Session
) {
  if (req.method == "POST") {
    return create(session, req);
  } else if (req.method == "PUT") {
    return update(session, req);
  } else {
    return list(session, req);
  }
});

async function list(session: Session, req: NextApiRequest): Promise<Issue[]> {
  const filter = req.query.filter as string;

  let issues: Issue[] = [];
  if (filter == "mystuff") {
    // return all un-resolved issues assigned to me + drafts
    issues = await prisma.issue.findMany({
      where: {
        OR: [
          { assigneeId: session.user.id, resolvedAt: null },
          {
            creatorId: session.user.id,
            state: IssueState.DRAFT,
          },
        ],
      },
    });
  } else if (filter == "project") {
    const projectId = req.query.projectId as string;
    // return active issues for this project
    issues = await prisma.issue.findMany({
      where: {
        projectId,
        resolvedAt: null,
        state: {
          not: IssueState.DRAFT,
        },
      },
    });
  } else {
    throw new ApiError(400, "Unimplemented");
  }

  return issues.map((i) => ({
    ...i,
    type: i.type.trim(),
    state: i.state.trim(),
  }));
}

async function create(session: Session, req: NextApiRequest): Promise<Issue> {
  tracker.logEvent(session.user.email, "issue-create");

  // we only allow users to create draft issues
  const { title, type, description, state } = req.body;
  const projectId = req.query.project_id as string;

  if (state != IssueState.DRAFT) {
    throw new ApiError(400, "Only draft issues can be created via API");
  }

  const project = await getProject(projectId, session);
  if (!project) throw new ApiError(404, "Project not found");

  const number = await prisma.issue.count({
    where: {
      projectId,
    },
  });

  const result = await prisma.issue.create({
    data: {
      title: title.trim(),
      description,
      number: number + 1,
      type,
      state,
      creatorId: session.dbUser.id,
      projectId,
    },
  });

  return result;
}

async function update(session: Session, req: NextApiRequest): Promise<Issue> {
  tracker.logEvent(session.user.email, "issue-edit", { keys: Object.keys(req.body) });

  const { id, ...updates } = req.body;
  const projectId = req.query.project_id as string;

  const project = await getProject(projectId, session);
  if (!project) throw new ApiError(404, "Project not found");

  if (updates.state || updates.type) {
    throw new ApiError(400, "Use the /issues/transition endpoint to change issue state / type");
  }

  const item = await prisma.issue.findFirst({
    where: {
      id: req.body.id,
      projectId,
    },
  });
  if (!item) throw new ApiError(404, "Not found");

  let result = null;
  if (Object.keys(updates).length > 0) {
    result = await prisma.issue.update({
      where: {
        id: item.id,
      },
      data: updates,
    });
  }

  return result || item;
}

export const getProject = async (projectId: string, session: Session) => {
  if (!projectId) return null;

  const workspaces = await prisma.workspace.findMany({
    where: {
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId: {
        in: workspaces.map((w) => w.id),
      },
      OR: [
        {
          users: {
            some: {
              userId: session.user.id,
            },
          },
        },
        {
          visibility: 0,
        },
      ],
    },
  });

  return project;
};
