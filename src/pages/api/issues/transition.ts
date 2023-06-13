import { Session } from "next-auth";

import prisma, { serialize } from "@/server/prisma";
import { Issue } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper, streamWrite, streamingApiWrapper } from "@/server/apiWrapper";
import { getProject } from "@/server/loaders";
import { ChatMessage, IssueState, ValidationRules, ValidationRuleset, stateLabels } from "@/types";
import { ablySendIssueMessage, ablySendIssueUpdate } from "@/server/ably";
import { textContent } from "@/components/editor/Doc";
import { chatCompletion, chatWithHistory } from "@/server/openai";
import { logger } from "@/lib/logger";

export default streamingApiWrapper(async function handler(
  req: NextApiRequest,
  session: Session,
  res: NextApiResponse
) {
  const { id, project_id } = req.query;
  const { state, type, override, history } = req.body;

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

  const validations = await prisma.projectValidation.findFirst({
    where: {
      projectId: project.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const rules: ValidationRuleset = (validations?.rules as any) || {};

  if (state) {
    if (state == issue.state) {
      streamWrite(res, { role: "assistant", content: "Nothing to do." });
      return;
    }

    if (override) {
      streamWrite(res, { role: "assistant", content: `State changed to ${stateLabels[state]}.` });
      await applyUpdates(issue, { state }, res);
    } else if (issue.state == IssueState.DRAFT) {
      const result = await validateCreateIssue(issue, session, res, rules, history);
      if (!result) return;
      const updates = { state };
      await applyUpdates(issue, updates, res);
    } else {
      const updates: IssueUpdates = { state };
      if (
        !issue.assigneeId &&
        state != IssueState.BACKLOG &&
        state != IssueState.TODO &&
        state != IssueState.WONT_FIX
      )
        updates.assigneeId = session.user.id;
      if (state == IssueState.DONE || state == IssueState.WONT_FIX) updates.resolvedAt = new Date();
      streamWrite(res, { role: "assistant", content: `State changed to ${stateLabels[state]}.` });
      await applyUpdates(issue, updates, res);
    }

    return;
  }

  throw new ApiError(400, "Not implemented yet");
});

export async function validateCreateIssue(
  issue: Issue,
  session: Session,
  res: NextApiResponse,
  rules: ValidationRuleset,
  history: ChatMessage[] = []
): Promise<boolean> {
  const generalRule = rules[ValidationRules.CREATE];
  const typeRule = rules[ValidationRules.CREATE + "-" + issue.type];

  if (!generalRule && !typeRule) {
    return true;
  }

  streamWrite(res, { role: "assistant", content: "Validating..." });

  // validate title and body
  const systemMessage = `You are a friendly project manager assistant. Help make sure no bad tickets get added to our issue tracker (given the rules we specify). Please return the output as JSON. e.g.
"Users should be able to add contact details on the main page" -> { "result": "PASS", "message": "Issue looks good!" }
"Do stuff" -> { "result": "FAIL", "message": "The title is not clear enough. How about this: xxx" }
"Fonts get tiny" -> { "result": "FAIL", "message": "Please add a bit more description about how this bug gets triggered. For example: xxx" }

The message should contain suggestions for how to fix the issue, e.g. suggested improvements to description or title.
Only valid results are PASS or FAIL`;

  const body = textContent(issue.description as any);

  const prompt = `Please validate the following issue to be created. Our rules:
${generalRule ? "For all issues: " + generalRule : ""}
${typeRule ? "For " + issue.type + ": " + typeRule : ""}
  
Type: ${issue.type}
Title: ${issue.title}
Body: ${body}
Creator: ${session.dbUser.name}

Your JSON response:`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemMessage },
    ...history,
    { role: "user", content: prompt },
  ];

  let gptOutput = await chatWithHistory(messages, "3.5");
  logger.info(gptOutput);

  let gptParsed: { result: string; message: string };
  if (!gptOutput.startsWith("{")) {
    if (gptOutput.toLowerCase().includes("pass") || gptOutput.includes("is valid")) {
      gptParsed = { result: "PASS", message: gptOutput };
    } else {
      gptParsed = { result: "FAIL", message: gptOutput };
    }
  } else {
    gptParsed = JSON.parse(gptOutput);
  }

  const passFail = gptParsed.result;
  const message = gptParsed.message;

  if (message) {
    streamWrite(res, { role: "assistant", content: message });
  }

  // if PASS
  if (passFail.startsWith("PASS")) {
    return true;
  } else {
    // if FAIL
    streamWrite(res, { success: false });
    return false;
  }
}

export type IssueUpdates = { state?: IssueState; assigneeId?: string; resolvedAt?: Date };

async function applyUpdates(issue: Issue, updates: IssueUpdates, res: NextApiResponse) {
  // assign it to you
  const newIssue = await prisma.issue.update({
    where: {
      id: issue.id,
    },
    data: updates,
  });
  ablySendIssueUpdate(issue.id, updates);
  streamWrite(res, { success: true, issue: serialize(newIssue) });
}
