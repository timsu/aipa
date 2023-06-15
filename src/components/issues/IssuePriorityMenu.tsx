import PopoverMenu, { PopoverSelectOption } from "@/components/ui/PopoverMenu";
import { classNames } from "@/lib/utils";
import { issueStore } from "@/stores/issueStore";
import { IssueState, Priority, priorityColors, priorityLabels, stateLabels } from "@/types";
import {
  CheckIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { Issue } from "@prisma/client";
import { useState } from "react";
import { usePopper } from "react-popper";

const priorities = [
  Priority.HIGHEST,
  Priority.HIGH,
  Priority.MEDIUM,
  Priority.LOW,
  Priority.LOWEST,
];

export const priorityIcons = {
  [Priority.HIGHEST]: <ChevronDoubleUpIcon className="w-4 h-4" />,
  [Priority.HIGH]: <ChevronUpIcon className="w-4 h-4" />,
  [Priority.MEDIUM]: "",
  [Priority.LOW]: <ChevronDownIcon className="w-4 h-4" />,
  [Priority.LOWEST]: <ChevronDoubleDownIcon className="w-4 h-4" />,
};

export default function IssuePriorityMenu({
  issue,
  buttonClass,
}: {
  issue: Issue;
  buttonClass: string;
}) {
  const click = (prio: number) => {
    issueStore.updateIssue(issue, { priority: prio });
  };

  const coloredLabel = (
    <div
      className={classNames("flex items-center gap-1", priorityColors[issue.priority as Priority])}
    >
      {priorityIcons[issue.priority as Priority]}
      {priorityLabels[issue.priority as Priority]}
    </div>
  );

  return (
    <PopoverMenu buttonClass={buttonClass} buttonLabel={coloredLabel}>
      <div className="px-2 py-2">Set Priority:</div>
      {priorities.map((prio) => (
        <PopoverSelectOption
          key={prio}
          selected={issue.priority == prio}
          onClick={() => click(prio)}
          className={issue.priority == prio ? "" : priorityColors[prio]}
        >
          {priorityLabels[prio]}
        </PopoverSelectOption>
      ))}
    </PopoverMenu>
  );
}
