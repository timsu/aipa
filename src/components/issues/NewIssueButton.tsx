import useShortcut, { ctrlOrMeta } from "@/components/hooks/useShortcut";
import Button from "@/components/ui/Button";
import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";

export default function NewIssueButton() {
  const [tooltip, setTooltip] = useState("");
  useEffect(() => {
    // ctrlOrMeta not available in SSR
    setTooltip(`Open new issue panel (${ctrlOrMeta}I)`);
  }, []);

  const newIssue = async () => {
    issueStore.newIssue();
  };

  useShortcut(["i"], newIssue);
  const activeIssue = useStore(issueStore.activeIssue);

  return (
    <Button
      onClick={newIssue}
      disabled={!!activeIssue && !activeIssue.id}
      data-tooltip-content={tooltip}
      data-tooltip-id="tooltip"
    >
      New Issue
    </Button>
  );
}
