import useShortcut, { ctrlOrMeta } from "@/components/hooks/useShortcut";
import Button from "@/components/ui/Button";
import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";

export default function NewIssueButton() {
  const newIssue = async () => {
    issueStore.newIssue();
  };

  useShortcut(["i"], newIssue);

  const activeIssue = useStore(issueStore.activeIssue);
  return (
    <Button
      onClick={newIssue}
      disabled={!!activeIssue && !activeIssue.id}
      data-tooltip-content={`Open new issue panel (${ctrlOrMeta}I)`}
      data-tooltip-id="tooltip"
    >
      New Issue
    </Button>
  );
}
