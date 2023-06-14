import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";
import NewIssue from "./NewIssue";
import { IssueState } from "@/types";
import ViewIssue from "./ViewIssue";

export default function IssuePanel() {
  const issue = useStore(issueStore.activeIssue);

  if (!issue) return null;

  return (
    <div className="fixed sm:relative sm:block bg-white border-l flex-1 py-4 px-4 h-full overflow-auto">
      {!issue.id || issue.state == IssueState.DRAFT ? (
        <NewIssue draftIssue={issue} />
      ) : (
        <ViewIssue issue={issue} />
      )}
    </div>
  );
}
