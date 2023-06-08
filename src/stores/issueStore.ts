import { atom } from "nanostores";

import { Issue, Project } from "@prisma/client";
import { projectStore } from "./projectStore";

class IssueStore {
  // --- services

  activeIssue = atom<Issue | null | "new">(null);

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
      // update query param
      const url = new URL(window.location.href);
      url.searchParams.set("issue", getIssueId(issue));
      window.history.pushState({}, "", url.toString());
    }
  };
}

export const getIssueId = (issue: Issue) => {
  const project = projectStore.projects.get().find((p) => p.id == issue.projectId);
  if (!project) return issue.id;
  return `${project.shortcode}-${issue.number}`;
};

declare global {
  interface Window {
    issueStore: IssueStore;
  }
}

export const issueStore = new IssueStore();
if (typeof window !== "undefined") window.issueStore = issueStore;
