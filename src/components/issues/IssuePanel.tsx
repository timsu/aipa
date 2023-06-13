import { issueStore } from "@/stores/issueStore";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import NewIssue from "./NewIssue";
import { IssueState } from "@/types";
import ViewIssue from "./ViewIssue";
import EditIssue from "./EditIssue";

export default function IssuePanel() {
  const issue = useStore(issueStore.activeIssue);
  const editing = useStore(issueStore.editingIssue);

  if (!issue) return null;

  return (
    <div className="border-l flex-1 py-4 px-4">
      {!issue.id || issue.state == IssueState.DRAFT ? (
        <NewIssue draftIssue={issue} />
      ) : editing ? (
        <EditIssue issue={issue} />
      ) : (
        <ViewIssue issue={issue} />
      )}
    </div>
  );
}
