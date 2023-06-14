import API from "@/client/api";
import IssueList, { IssueGrid } from "@/components/issues/IssueList";
import MessageBubble from "@/components/messages/MessageBubble";
import Button from "@/components/ui/Button";
import { logger } from "@/lib/logger";
import { issueStore } from "@/stores/issueStore";
import { IssueState } from "@/types";
import { Issue } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

enum State {
  IDLE,
  LOADING,
  LOADED,
  EMPTY,
}

export default function SomethingNew() {
  const [state, setState] = useState(State.IDLE);

  const start = async () => {
    setState(State.LOADING);
    try {
      const res = await API.listIssues({ filter: "something-new" });
      res.forEach((issue: Issue) => (issue.state = IssueState.SUGGESTIONS));
      issueStore.loadIssues([...issueStore.issues.get(), ...res]);
      setState(res.length ? State.LOADED : State.EMPTY);
    } catch (e) {
      logger.error(e);
      toast.error("Something went wrong. Please try again later.");
      setState(State.IDLE);
    }
  };

  if (state == State.IDLE)
    return (
      <Button
        data-tooltip-content="Get suggestions on what to do next"
        data-tooltip-id="tooltip"
        onClick={start}
      >
        Work on something new
      </Button>
    );

  if (state == State.LOADING)
    return <MessageBubble>Loading things for you to work on...</MessageBubble>;

  if (state == State.EMPTY)
    return (
      <MessageBubble>
        I didn&apos;t find anything. Check the <Link href="/issues">issues</Link> page for all
        issues.
      </MessageBubble>
    );

  return <MessageBubble>I&apos;ve added some things you can work on above ☝️</MessageBubble>;
}
