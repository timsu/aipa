import { Session } from "next-auth";

import prisma from "@/server/prisma";
import { Issue } from "@prisma/client";

import type { NextApiRequest } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { getProject } from ".";
import { IssueState } from "@/types";

export default authApiWrapper<Issue>(async function handler(req: NextApiRequest, session: Session) {
  const { id, projectId } = req.query;
  const { state, type } = req.body;

  const project = await getProject(projectId as string, session);
  if (!project) throw new ApiError(404, "Project not found");

  const issue = await prisma.issue.findFirst({
    where: {
      id: id as string,
      projectId: project.id,
    },
  });
  if (!issue) throw new ApiError(404, "Issue not found");

  if (state && type) throw new ApiError(400, "Cannot set both state and type");

  if (state) {
    if (issue.state == IssueState.DRAFT) {
    }
  }

  return issue;
});
