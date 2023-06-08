import { Session } from "next-auth";

import prisma from "@/server/prisma";
import { Issue } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper, streamingApiWrapper } from "@/server/apiWrapper";
import { getProject } from ".";
import { IssueState } from "@/types";
import { ablySendIssueMessage, ablySendIssueUpdate } from "@/server/ably";

export default streamingApiWrapper(async function handler(
  req: NextApiRequest,
  session: Session,
  res: NextApiResponse
) {
  const { id, project_id } = req.query;
  const { state, type } = req.body;

  const project = await getProject(project_id as string, session);
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
      await validateCreateIssue(issue, state, res);
      return;
    }
  }

  throw new ApiError(400, "Not implemented yet");
});

async function validateCreateIssue(issue: Issue, nextState: IssueState, res: NextApiResponse) {
  res.write(JSON.stringify({ role: "assistant", content: "Validating..." }));

  // validate title and body
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const validationResult = "FAIL\nYour issue does not contain sufficient description.";
  const message = validationResult.substring(validationResult.indexOf("\n") + 1).trim();

  if (message) {
    res.write(JSON.stringify({ role: "assistant", content: message }));
  }

  // if PASS
  if (validationResult.startsWith("PASS")) {
    const updates = { state: nextState };
    const updatedIssue = await prisma.issue.update({
      where: {
        id: issue.id,
      },
      data: updates,
    });
    ablySendIssueUpdate(issue.id, updates);
    res.write(JSON.stringify({ success: true }));
  } else {
    // if FAIL
    res.write(JSON.stringify({ success: false }));
  }

  res.end();
}
