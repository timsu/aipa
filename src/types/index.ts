import { Project, Workspace } from "@prisma/client";

export const PRODUCT = "Pomme";

export type Model = "3.5" | "4";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type User = { name?: string; email: string };

export type UserMeta = {
  from?: string; // send from email
};

export const userMeta = (u: { meta: any } | undefined) => (u?.meta || {}) as UserMeta;

export type Member = {
  id: string;
  name: string;
  image?: string;
};

export type WorkspaceProps = {
  activeWorkspace: string;
  workspaces: Workspace[];
  projects: Project[];
};

export type SuccessResponse = {
  success: boolean;
};

export type ErrorResponse = {
  error: {
    message: string;
  };
};

export enum ProjectVisibility {
  ALL = 0, // project appears in everyone's list by default
  MEMBERS = 1, // project only appears in members' lists but is joinable
  PRIVATE = 2, // project only appears in members' lists and is not joinable
}

export enum IssueState {
  DRAFT = "draft",
  BACKLOG = "backlog",
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  REVIEW = "review",
  DONE = "done",
  WONT_FIX = "wont_fix",
}

export enum IssueType {
  STORY = "story",
  TASK = "task",
  BUG = "bug",
  EXPRIMENT = "experiment",
}
