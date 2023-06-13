import PopoverMenu, { PopoverSelectOption } from "@/components/ui/PopoverMenu";
import { classNames } from "@/lib/utils";
import { issueStore } from "@/stores/issueStore";
import { IssueState, stateLabels } from "@/types";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Issue } from "@prisma/client";
import { useState } from "react";
import { usePopper } from "react-popper";

const states = [
  IssueState.DRAFT,
  IssueState.BACKLOG,
  IssueState.TODO,
  IssueState.IN_PROGRESS,
  IssueState.REVIEW,
  IssueState.DONE,
  IssueState.WONT_FIX,
];

export default function IssueStateMenu({
  issue,
  buttonClass,
}: {
  issue: Issue;
  buttonClass: string;
}) {
  const transition = (state: IssueState) => {
    issueStore.transitionIssue(issue, state);
  };

  return (
    <PopoverMenu buttonClass={buttonClass} buttonLabel={stateLabels[issue.state]}>
      <div className="px-2 py-2">Transition to:</div>
      {states.map((state) => (
        <PopoverSelectOption
          key={state}
          selected={issue.state == state}
          onClick={() => transition(state)}
        >
          {stateLabels[state]}
        </PopoverSelectOption>
      ))}
    </PopoverMenu>
  );
}
