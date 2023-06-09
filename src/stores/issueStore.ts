import { atom, map } from "nanostores";

import { Issue, Project } from "@prisma/client";
import { projectStore } from "./projectStore";
import { IssueMessage, IssueState } from "@/types";
import API from "@/client/api";
import type { Types as Ably } from "ably";
import { uiStore } from "./uiStore";

type IssueMap = { [type: string]: Issue[] };

class IssueStore {
  // --- services

  activeIssue = atom<Issue | null>(null);

  messages = atom<IssueMessage[]>([]);

  subscription: { id: string; channel: Ably.RealtimeChannelCallbacks } | undefined;

  issues = atom<Issue[]>([]);

  groupedIssues = map<IssueMap>({});

  // --- actions

  loadIssues = async (issues: Issue[]) => {
    this.issues.set(issues);
    this.splitIssues(issues);

    const params = new URLSearchParams(window.location.search);
    const issueQuery = params.get("issue");
    if (issueQuery) {
      const issue = issues.find((issue) => issue.identifier === issueQuery);
      if (issue) {
        this.setActiveIssue(issue);
      }
    }
  };

  splitIssues = (issues: Issue[]) => {
    const map: IssueMap = {};
    issues.forEach((issue) => {
      const state = issue.state.trim();
      if (!map[state]) {
        map[state] = [];
      }
      map[state].push(issue);
    });
    this.groupedIssues.set(map);
  };

  newIssue = () => {
    this.activeIssue.set({} as Issue);
  };

  subscribeToIssue = (issue: Issue | null) => {
    if (this.subscription) {
      if (this.subscription.id === issue?.id) return;
      this.subscription.channel.unsubscribe();
      this.subscription = undefined;
    }
    if (!issue) return;

    uiStore.onConnected((realtime) => {
      const channel = realtime.channels.get("issue:" + issue.id);
      this.subscription = { id: issue.id, channel };

      channel.subscribe("message", (message) => {
        const comment = {
          createdAt: new Date(),
          ...message.data,
        };
        this.messages.set([...this.messages.get(), comment]);
      });

      channel.subscribe("update", (message) => {
        const updates = message.data;
        const activeIssue = this.activeIssue.get();
        if (activeIssue && activeIssue.id === issue.id) {
          this.activeIssue.set({ ...activeIssue, ...updates });
        }
      });
    });
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
