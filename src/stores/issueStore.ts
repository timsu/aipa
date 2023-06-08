import { atom } from "nanostores";

import { Issue, Project } from "@prisma/client";
import { projectStore } from "./projectStore";
import { IssueMessage } from "@/types";

class IssueStore {
  // --- services

  activeIssue = atom<Issue | null | "new">(null);

  messages = atom<IssueMessage[]>([]);

  // --- actions

  newIssue = () => {
    this.activeIssue.set("new");
  };

  closeIssuePanel = () => {
    this.activeIssue.set(null);

    // update query param
    const url = new URL(window.location.href);
    url.searchParams.delete("issue");
    window.history.pushState({}, "", url.toString());
  };

  setActiveIssue = (issue: Issue) => {
    const current = this.activeIssue.get();
    if (current && typeof current == "object" && issue.id == current.id) this.closeIssuePanel();
    else {
      this.activeIssue.set(issue);
      this.messages.set([]);

      // update query param
      const url = new URL(window.location.href);
      url.searchParams.set("issue", issue.identifier);
      window.history.pushState({}, "", url.toString());
    }
  };
}

declare global {
  interface Window {
    issueStore: IssueStore;
  }
}

export const issueStore = new IssueStore();
if (typeof window !== "undefined") window.issueStore = issueStore;
