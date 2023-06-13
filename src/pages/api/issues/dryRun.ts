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
import { IssueUpdates, validateCreateIssue } from "@/pages/api/issues/transition";

export default streamingApiWrapper(async function handler(
  req: NextApiRequest,
  session: Session,
  res: NextApiResponse
) {
  const { state, type, issue, history, rules } = req.body;

  if (state && type) throw new ApiError(400, "Cannot set both state and type");

  if (!issue || !rules) throw new ApiError(400, "You must specify issue and rules");

  if (state) {
    if (state == issue.state) {
      streamWrite(res, { role: "assistant", content: "Nothing to do." });
      return;
    }

    if (issue.state == IssueState.DRAFT) {
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

async function applyUpdates(issue: Issue, updates: IssueUpdates, res: NextApiResponse) {
  const updatedIssue = { ...issue, ...updates };
  streamWrite(res, { success: true, issue: serialize(updatedIssue) });
}
