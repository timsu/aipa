import { getServerSession, Session } from "next-auth";

import prisma from "@/server/prisma";
import { tracker } from "@/server/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma, { Issue, Project, Workspace } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { IssueState } from "@/types";
import { getProject } from ".";
import { ablySendIssueUpdate } from "@/server/ably";

export default authApiWrapper<Issue>(async function handler(req: NextApiRequest, session: Session) {
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
    ablySendIssueUpdate(id, updates);
  }

  return result || item;
});
