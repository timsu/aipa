import IssueCard from "@/components/issues/IssueCard";
import { classNames } from "@/lib/utils";
import { dashboardStore } from "@/stores/dashboardStore";
import { issueStore } from "@/stores/issueStore";
import { IssueState, stateLabels } from "@/types";
import { useStore } from "@nanostores/react";
import { Issue } from "@prisma/client";
import { useEffect, useRef } from "react";

const states = [
  IssueState.DRAFT,
  IssueState.REVIEW,
  IssueState.IN_PROGRESS,
  IssueState.TODO,
  IssueState.BACKLOG,
];

export default function IssueList({ emptyView }: { emptyView: JSX.Element }) {
  const activeIssue = useStore(issueStore.activeIssue);
  const groupedIssues = useStore(issueStore.groupedIssues);

  useEffect(() => {
    const sortedIssues: Issue[] = [];
    for (const state of states) {
      if (!groupedIssues[state]) continue;
      sortedIssues.push(...groupedIssues[state]);
    }
    const onKeyListener = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if ((target as HTMLElement).contentEditable == "true") return;

      if (e.key == "ArrowUp" || e.key == "ArrowDown") {
        const delta = e.key == "ArrowUp" ? -1 : 1;
        e.preventDefault();
        const currentIssueId = issueStore.activeIssue.get()?.id;
        const index = sortedIssues.findIndex((i) => i.id === currentIssueId);
        if (index != -1) {
          const issue = sortedIssues[Math.max(Math.min(index + delta, sortedIssues.length - 1), 0)];
          if (issue?.id != currentIssueId) issueStore.setActiveIssue(issue);
        } else {
          issueStore.setActiveIssue(sortedIssues[0]);
        }
      }
    };
    window.addEventListener("keydown", onKeyListener);
    return () => window.removeEventListener("keydown", onKeyListener);
  }, [groupedIssues]);

  if (!Object.keys(groupedIssues).length) return emptyView;

  return (
    <>
      {states.map((state) => {
        if (!groupedIssues[state]) return null;
        return (
          <div key={state} className="mb-4 pb-4 sm:mb-8 sm:pb-8 border-b last:border-none">
            <div className="flex items-center">
              <h2 className="font-bold text-lg">
                {state == IssueState.DRAFT ? "Drafts" : stateLabels[state]} (
                {groupedIssues[state].length})
              </h2>
            </div>
            <div
              className={classNames(
                "my-2 -mx-4 grid grid-cols-1 gap-1 sm:gap-6",
                activeIssue ? "" : "sm:grid-cols-2 xl:grid-cols-3"
              )}
            >
              {groupedIssues[state].map((issue) => {
                return (
                  <IssueCard
                    issue={issue}
                    key={issue.id}
                    onClick={(issue) => issueStore.setActiveIssue(issue)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
