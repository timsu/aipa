import { issueStore } from "@/stores/issueStore";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import NewIssue from "./NewIssue";

export default function IssuePanel() {
  const issue = useStore(issueStore.activeIssue);

  return (
    <div className="border-l flex-1 py-4 px-4">
      {issue == "new" ? <NewIssue /> : <div>Issue</div>}
    </div>
  );
}
