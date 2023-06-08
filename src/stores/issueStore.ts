import { atom } from "nanostores";

import { Issue, Project } from "@prisma/client";
import { projectStore } from "./projectStore";
import { IssueMessage, IssueState } from "@/types";
import API from "@/client/api";

class IssueStore {
  // --- services

  activeIssue = atom<Issue | null>(null);

  messages = atom<IssueMessage[]>([]);

  // --- actions

  newIssue = () => {
    this.activeIssue.set({} as Issue);
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
    if (isIssue(current) && issue.id == current.id) this.closeIssuePanel();
    else {
      this.activeIssue.set(issue);
      this.messages.set([]);

      // update query param
      const url = new URL(window.location.href);
      url.searchParams.set("issue", issue.identifier);
      window.history.pushState({}, "", url.toString());
    }
  };

  transitionIssue = async (issue: Issue, state: IssueState) => {
    const current = this.activeIssue.get();
    if (isIssue(current) && issue.id != current.id) this.setActiveIssue(issue);
    this.messages.set([]);

    let success = false;
    await API.transitionIssue(issue, { state }, (data: any) => {
      console.log("got data", data);
      const messages = this.messages.get();
      if (isIssueMessage(data)) {
        messages.push(data);
        this.messages.set([...messages]);
      } else if (data.success !== undefined) success = data.success;
    });

    return success;
  };
}

export const isIssue = (issue: Issue | null | "new"): issue is Issue => {
  return issue !== null && typeof issue == "object";
};

export const isIssueMessage = (message: IssueMessage | string | any): message is IssueMessage => {
  return message !== null && typeof message == "object" && !!message.content;
};

declare global {
  interface Window {
    issueStore: IssueStore;
  }
}

export const issueStore = new IssueStore();
if (typeof window !== "undefined") window.issueStore = issueStore;
