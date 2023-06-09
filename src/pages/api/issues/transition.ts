import { Session } from "next-auth";

import prisma from "@/server/prisma";
import { Issue } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper, streamWrite, streamingApiWrapper } from "@/server/apiWrapper";
import { getProject } from ".";
import { IssueState } from "@/types";
import { ablySendIssueMessage, ablySendIssueUpdate } from "@/server/ably";
import { textContent } from "@/components/editor/Doc";
import { chatCompletion } from "@/server/openai";
import { logger } from "@/lib/logger";

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
  streamWrite(res, { role: "assistant", content: "Validating..." });

  // validate title and body
  const systemMessage = `You are a friendly project manager assistant. Help make sure no bad tickets get added to our issue tracker. Please return the output as JSON. e.g.
{ "result": "PASS", "message": "Issue looks good!" }
{ "result": "FAIL", "message": "The title is too short to be useful" }
{ "result": "FAIL", "message": "Please add a bit more description about how this bug gets triggered" }

Only return result = PASS or FAIL`;

  const body = textContent(issue.description as any);

  const prompt = `Please validate the following issue. Our rules:

- issues must have good spelling and grammar
- for stories, description must tell what the user should experience
- for bugs, basic repro steps should be included, or "no repro" should be indicated
  
Type: ${issue.type}
Title: ${issue.title}
Body: ${body}`;

  const gptOutput = await chatCompletion(prompt, "3.5", systemMessage);
  logger.info(gptOutput);
  const gptParsed = JSON.parse(gptOutput);

  const passFail = gptParsed.result;
  const message = gptParsed.message;

  if (message) {
    streamWrite(res, { role: "assistant", content: message });
  }

  // if PASS
  if (passFail.startsWith("PASS")) {
    const updates = { state: nextState };
    const newIssue = await prisma.issue.update({
      where: {
        id: issue.id,
      },
      data: updates,
    });
    ablySendIssueUpdate(issue.id, updates);
    streamWrite(res, { success: true });
  } else {
    // if FAIL
    streamWrite(res, { success: false });
  }

  res.end();
}
