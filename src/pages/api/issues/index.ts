import { getServerSession, Session } from "next-auth";

import prisma from "@/server/prisma";
import { tracker } from "@/server/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma, { Issue, Project, Workspace } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { IssueState, ProjectVisibility } from "@/types";
import { allProjectsForWorkspace, getProject } from "@/server/loaders";

export default authApiWrapper<Issue[] | Issue>(function handler(
  req: NextApiRequest,
  session: Session
) {
  if (req.method == "POST") {
    return create(session, req);
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
        deletedAt: null,
        OR: [
          { assigneeId: session.user.id, resolvedAt: null },
          {
            creatorId: session.user.id,
            state: IssueState.DRAFT,
          },
        ],
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });
  } else if (filter == "project") {
    const projectId = req.query.projectId as string;
    // return active issues for this project
    issues = await prisma.issue.findMany({
      where: {
        projectId,
        resolvedAt: null,
        deletedAt: null,
        state: {
          not: IssueState.DRAFT,
        },
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });
  } else if (filter == "all") {
    // return all visible issues for this user
    const workspaceId = req.query.workspaceId as string;

    const projects = await prisma.project.findMany({
      select: {
        id: true,
      },
      ...allProjectsForWorkspace(workspaceId, session),
    });

    issues = await prisma.issue.findMany({
      where: {
        resolvedAt: null,
        deletedAt: null,
        state: {
          not: IssueState.DRAFT,
        },
        projectId: {
          in: projects.map((p) => p.id),
        },
      },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });
  } else if (filter == "something-new") {
    // return new suggested issues for user
    const workspaceId = req.query.workspaceId as string;

    const projects = await prisma.project.findMany({
      select: {
        id: true,
      },
      ...allProjectsForWorkspace(workspaceId, session),
    });

    issues = await prisma.issue.findMany({
      where: {
        assigneeId: null,
        resolvedAt: null,
        deletedAt: null,
        state: {
          in: [IssueState.BACKLOG, IssueState.TODO],
        },
        projectId: {
          in: projects.map((p) => p.id),
        },
      },
      orderBy: [{ state: "desc" }, { priority: "desc" }, { updatedAt: "desc" }],
      take: 6,
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
      identifier: `${project.shortcode}-${number + 1}`,
      type,
      state,
      creatorId: session.dbUser.id,
      projectId,
    },
  });

  return result;
}
