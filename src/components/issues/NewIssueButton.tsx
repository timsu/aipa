import Button from "@/components/ui/Button";
import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";

export default function NewIssueButton() {
  const newIssue = async () => {
    issueStore.newIssue();
  };

  const activeIssue = useStore(issueStore.activeIssue);
  return (
    <Button onClick={newIssue} disabled={!!activeIssue && !activeIssue.id}>
      New Issue
    </Button>
  );
}
