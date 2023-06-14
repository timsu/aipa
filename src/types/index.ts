import { Project, Workspace } from "@prisma/client";

export const PRODUCT = "Pomme";

export type Model = "3.5" | "4";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type User = { id: string; name: string | null; image?: string | null };

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
  userId: string;
  activeWorkspace: string | null;
  workspaces: Workspace[];
  projects: Project[];
  people: User[];
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
  SUGGESTIONS = "suggestions",
}

export const stateLabels: { [state: string]: string } = {
  [IssueState.DRAFT]: "Draft",
  [IssueState.BACKLOG]: "Backlog",
  [IssueState.TODO]: "Todo",
  [IssueState.IN_PROGRESS]: "In Progress",
  [IssueState.REVIEW]: "In Review",
  [IssueState.DONE]: "Done",
  [IssueState.WONT_FIX]: "Won't Fix",
  [IssueState.SUGGESTIONS]: "Suggestions",
};

export enum IssueType {
  STORY = "story",
  TASK = "task",
  BUG = "bug",
  EXPRIMENT = "experiment",
}

// message that can be displayed in the UI. does not have to come from backend
export type UIMessage = {
  id?: string;
  createdAt: Date;
  role: "user" | "assistant" | "system";
  userId?: string;
  content: string;
};

export enum ValidationRules {
  DESCRIPTION = "description",
  CREATE = "create",
  WIP = "wip",
  ASSIGN = "assign",
  TRANSITION = "tran",
}

export type ValidationRuleset = {
  [key: string]: string;
};
