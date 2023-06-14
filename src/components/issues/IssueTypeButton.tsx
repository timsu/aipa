import { IssueType } from "@/types";
import { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import IssueTypeIcon from "./IssueTypeIcon";
import { classNames } from "@/lib/utils";

const issueTypes = {
  [IssueType.STORY]: {
    label: "Story",
  },
  [IssueType.BUG]: { label: "Bug" },
  [IssueType.TASK]: {
    label: "Task",
  },
  [IssueType.EXPRIMENT]: {
    label: "Experiment",
  },
};

export const ISSUE_TYPES = Object.keys(issueTypes) as IssueType[];

type Props = { type: IssueType; selected?: boolean } & HTMLAttributes<HTMLButtonElement>;

export function IssueTypeButton({ type, selected, ...rest }: Props) {
  return (
    <button
      key={type}
      data-tooltip-content={issueTypes[type]?.label}
      data-tooltip-id="tooltip"
      {...rest}
      className={twMerge(
        "text-sm flex gap-1 items-center hover:bg-blue-200 text-gray-700 rounded-md p-1 xl:px-2 border",
        selected ? "bg-blue-100 border-blue-500" : "bg-gray-100 border-gray-500",
        rest.className
      )}
    >
      <IssueTypeIcon type={type} />
      <span className={classNames(selected ? "" : "hidden lg:inline")}>
        {issueTypes[type]?.label}
      </span>
    </button>
  );
}
