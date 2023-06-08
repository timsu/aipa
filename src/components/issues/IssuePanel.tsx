import { issueStore } from "@/stores/issueStore";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import NewIssue from "./NewIssue";
import { IssueState } from "@/types";

export default function IssuePanel() {
  const issue = useStore(issueStore.activeIssue);

  if (!issue) return null;

  return (
    <div className="border-l flex-1 py-4 px-4">
      {!issue.id ? (
        <NewIssue />
      ) : issue.state == IssueState.DRAFT ? (
        <NewIssue draftIssue={issue} />
      ) : (
        <div>Issue</div>
      )}
    </div>
  );
}
