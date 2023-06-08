import { atom } from "nanostores";

import { Issue, Project } from "@prisma/client";

class IssueStore {
  // --- services

  activeIssue = atom<Issue | null | "new">(null);

  // --- actions

  newIssue = () => {
    this.activeIssue.set("new");
  };

  closeIssuePanel = () => {
    this.activeIssue.set(null);
  };

  setActiveIssue = (issue: Issue) => {
    const current = this.activeIssue.get();
    if (current && typeof current == "object" && issue.id == current.id) this.closeIssuePanel();
    else this.activeIssue.set(issue);
  };
}

declare global {
  interface Window {
    issueStore: IssueStore;
  }
}

export const issueStore = new IssueStore();
if (typeof window !== "undefined") window.issueStore = issueStore;
