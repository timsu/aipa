import { atom, map } from "nanostores";

import { Issue, IssueComment, Project } from "@prisma/client";
import { projectStore } from "./projectStore";
import { UIMessage } from "@/types";
import API from "@/client/api";

class MessageStore {
  // --- services

  issue: Issue | null = null;

  messages = atom<UIMessage[]>([]);

  // --- actions

  init = async (issue: Issue) => {
    this.issue = issue;
    this.messages.set([]);
  };

  clear = () => {
    this.issue = null;
    this.messages.set([]);
  };

  loadMessages = async (issue: Issue) => {
    const project = projectStore.projects.get().find((p) => p.id === issue.projectId);
    if (!project) return;
    const messages = await API.issueMessages.list(project, "issueId=" + issue.id);
    const issueMessages = messages.map(mapIssueMessage);

    this.messages.set(issueMessages);
  };

  addMessage = (message: UIMessage) => {
    this.messages.set([...this.messages.get(), message]);
  };

  postMessage = async (role: "user" | "assistant", content: string) => {
    if (!this.issue) return;
    const project = projectStore.projects.get().find((p) => p.id === this.issue!.projectId);
    if (!project) return;

    const newMessage = { content, role, createdAt: new Date() } as UIMessage;
    this.addMessage(newMessage);

    const message = await API.issueMessages.create(project, {
      issueId: this.issue.id,
      type: role,
      message: content,
    });

    this.messages.set(
      this.messages.get().map((m) => (m === newMessage ? mapIssueMessage(message) : m))
    );
  };

  removeTransientMessages = () => {
    this.messages.set(this.messages.get().filter((message) => message.id));
  };
}

export const mapIssueMessage = (message: IssueComment): UIMessage =>
  ({
    id: message.id,
    createdAt: new Date(message.createdAt),
    content: message.message,
    role: message.type,
    userId: message.userId,
  } as UIMessage);

export const isUIMessage = (message: UIMessage | string | any): message is UIMessage => {
  return message !== null && typeof message == "object" && !!message.content;
};

declare global {
  interface Window {
    messageStore: MessageStore;
  }
}

export const messageStore = new MessageStore();
if (typeof window !== "undefined") window.messageStore = messageStore;
