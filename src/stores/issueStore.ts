import { atom, map } from "nanostores";

import { Issue, Project } from "@prisma/client";
import { projectStore } from "./projectStore";
import { ChatMessage, IssueState, ValidationRuleset } from "@/types";
import API from "@/client/api";
import type { Types as Ably } from "ably";
import { uiStore } from "./uiStore";
import { logger } from "@/lib/logger";
import { textContent } from "@/components/editor/Doc";
import { isUIMessage, messageStore } from "@/stores/messageStore";

type IssueMap = { [type: string]: Issue[] };

export type ActiveIssue = Issue & { dryRun?: (issue: Issue) => Promise<void> };

class IssueStore {
  // --- services

  activeIssue = atom<ActiveIssue | null>(null);

  subscription: { id: string; channel: Ably.RealtimeChannelCallbacks } | undefined;

  issues = atom<Issue[]>([]);

  groupedIssues = map<IssueMap>({});

  createAnother = atom<boolean>(false);

  // --- actions

  init = async () => {
    this.issues.set([]);
    this.groupedIssues.set({});
  };

  loadIssues = async (issues: Issue[]) => {
    this.issues.set(issues);
    this.splitIssues(issues);

    const params = new URLSearchParams(window.location.search);
    const issueQuery = params.get("issue");
    if (issueQuery && !this.activeIssue.get()) {
      const issue = issues.find((issue) => issue.identifier === issueQuery);
      if (issue) {
        this.setActiveIssue(issue);
      } else {
        const [proj, number] = issueQuery.split("-");
        const project = projectStore.projects.get().find((p) => p.shortcode === proj);
        if (project) {
          API.issues
            .get(project.id, number)
            .then((issue) => {
              this.setActiveIssue(issue);
            })
            .catch((error) => {
              logger.info("no issue found with id", issueQuery);
            });
        }
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
    this.closeIssuePanel(true);
    this.activeIssue.set({} as Issue);
  };

  dryRunIssue = (props: Partial<Issue>, onDryRun: (issue: Issue) => Promise<void>) => {
    this.closeIssuePanel();
    this.activeIssue.set({ ...props, dryRun: onDryRun } as ActiveIssue);
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
        messageStore.addMessage(comment);
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

  closeIssuePanel = (skipNull?: boolean) => {
    if (!skipNull) this.activeIssue.set(null);
    messageStore.clear();
    this.chatHistory = [];

    // update query param
    const url = new URL(window.location.href);
    url.searchParams.delete("issue");
    window.history.pushState({}, "", url.toString());
  };

  setActiveIssue = (issue: Issue) => {
    if (!issue) return this.closeIssuePanel();

    const current = this.activeIssue.get();
    if (isIssue(current) && issue.id == current.id) this.closeIssuePanel();
    else {
      this.activeIssue.set(issue);
      messageStore.init(issue);
      this.chatHistory = [];

      // update query param
      const url = new URL(window.location.href);
      url.searchParams.set("issue", issue.identifier);
      window.history.pushState({}, "", url.toString());

      if (issue.projectId) projectStore.setActiveProject(issue.projectId);
    }
  };

  chatHistory: ChatMessage[] = [];

  transitionIssue = async (
    issue: Issue,
    state: IssueState,
    override?: boolean,
    dryRun?: ValidationRuleset
  ) => {
    const current = this.activeIssue.get();
    if (isIssue(current) && issue.id != current.id) this.setActiveIssue(issue);

    messageStore.removeTransientMessages();

    let success = false;
    this.chatHistory.push({
      role: "user",
      content: `Update issue state to ${state}: ${issue.title}\n${
        (issue.description && textContent(issue.description as any)) || "(no description)"
      }`,
    });

    const onData = (data: any) => {
      console.log("message", data);
      if (isUIMessage(data)) {
        messageStore.addMessage(data);
        if (data.content != "Validating...") {
          this.chatHistory.push({
            role: "assistant",
            content: data.content,
          });
        }
      } else if (data.success !== undefined) {
        logger.info("transitionIssue", data);
        success = data.success;
        if (data.issue) this.issueUpdated(data.issue);
      }
    };

    if (dryRun) {
      await API.dryRun(
        issue,
        { state, history: this.chatHistory, override, rules: dryRun },
        onData
      );
    } else {
      await API.transitionIssue(issue, { state, history: this.chatHistory, override }, onData);
    }

    return success;
  };

  updateIssue = async (issue: Issue, updates: Partial<Issue>) => {
    const newIssue = await API.issues.update(issue.projectId!, issue.id, updates);
    this.issueUpdated(newIssue);
  };

  reloadIssue = async (issue: Issue) => {
    const newIssue = await API.issues.get(issue.projectId!, issue.id);
    this.issueUpdated(newIssue);
  };

  issueUpdated = (issue: Issue) => {
    let issues = this.issues.get();
    const index = issues.findIndex((i) => i.id === issue.id);
    if (index > -1) {
      issues[index] = issue;
      if (issue.deletedAt) {
        issues = issues.filter((i) => i.id !== issue.id);
      }
    } else issues.push(issue);

    this.issues.set([...issues]);
    this.splitIssues(issues);

    if (this.activeIssue.get()?.id === issue.id) {
      const activeIssue = this.activeIssue.get();
      this.activeIssue.set({ ...activeIssue, ...issue });
    }
  };

  deleteIssue = async (issue: Issue) => {
    issue.deletedAt = new Date();
    this.issueUpdated(issue);
    await API.issues.update(issue.projectId!, issue.id, { deletedAt: new Date() });
    issueStore.closeIssuePanel();
  };
}

export const isIssue = (issue: Issue | null | "new"): issue is Issue => {
  return issue !== null && typeof issue == "object";
};

declare global {
  interface Window {
    issueStore: IssueStore;
  }
}

export const issueStore = new IssueStore();
if (typeof window !== "undefined") window.issueStore = issueStore;
