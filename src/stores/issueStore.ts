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
}

declare global {
  interface Window {
    issueStore: IssueStore;
  }
}

export const issueStore = new IssueStore();
if (typeof window !== "undefined") window.issueStore = issueStore;
