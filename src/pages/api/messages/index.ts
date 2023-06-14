import { getServerSession, Session } from "next-auth";

import prisma from "@/server/prisma";
import { tracker } from "@/server/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma, { IssueComment, Workspace } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { getIssue } from "@/server/loaders";

export default authApiWrapper<IssueComment[] | IssueComment>(function handler(
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

async function list(session: Session, req: NextApiRequest): Promise<IssueComment[]> {
  const { issueId, project_id } = req.query;

  console.log("FIND", req.query, issueId);
  const item = await getIssue(project_id as string, issueId as string, session);
  if (!item) return [];

  const items = await prisma.issueComment.findMany({
    where: {
      issueId: item.id,
    },
  });

  return items;
}

async function create(session: Session, req: NextApiRequest): Promise<IssueComment> {
  tracker.logEvent(session.user.email, "comment-create");

  const { project_id } = req.query;
  const { issueId, ...rest } = req.body;

  const issue = await getIssue(project_id as string, issueId, session);
  if (!issue) throw new ApiError(404, "Issue not found");

  const result = await prisma.issueComment.create({
    data: {
      issueId,
      userId: session.user.id,
      ...rest,
    },
  });

  return result;
}

async function update(session: Session, req: NextApiRequest): Promise<IssueComment> {
  tracker.logEvent(session.user.email, "comment-update");

  const { id, ...rest } = req.body;

  const comment = await prisma.issueComment.findUnique({
    where: {
      id,
    },
  });
  if (!comment || comment.userId !== session.user.id) throw new ApiError(404, "Comment not found");

  const result = await prisma.issueComment.update({
    where: {
      id,
    },
    data: {
      ...rest,
    },
  });

  return result;
}
