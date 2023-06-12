import IssueCard from "@/components/issues/IssueCard";
import { classNames } from "@/lib/utils";
import { dashboardStore } from "@/stores/dashboardStore";
import { issueStore } from "@/stores/issueStore";
import { IssueState, stateLabels } from "@/types";
import { useStore } from "@nanostores/react";

export default function IssueList({ emptyView }: { emptyView: JSX.Element }) {
  const activeIssue = useStore(issueStore.activeIssue);
  const groupedIssues = useStore(issueStore.groupedIssues);

  const states = [
    IssueState.DRAFT,
    IssueState.REVIEW,
    IssueState.IN_PROGRESS,
    IssueState.TODO,
    IssueState.BACKLOG,
  ];

  if (!Object.keys(groupedIssues).length) return emptyView;

  return (
    <>
      {states.map((state) => {
        if (!groupedIssues[state]) return null;
        return (
          <div key={state} className="mb-8 pb-8 border-b last:border-none">
            <div className="flex items-center">
              <h2 className="font-bold text-lg">
                {state == IssueState.DRAFT ? "Drafts" : stateLabels[state]} (
                {groupedIssues[state].length})
              </h2>
            </div>
            <div
              className={classNames(
                "my-2 -mx-4 grid grid-cols-1 gap-6",
                activeIssue ? "" : "sm:grid-cols-2"
              )}
            >
              {groupedIssues[state].map((issue) => (
                <IssueCard
                  issue={issue}
                  key={issue.id}
                  onClick={(issue) => issueStore.setActiveIssue(issue)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
