import { Project, Workspace } from "@prisma/client";

export const PRODUCT = "Teamstory";

export type Model = "3.5" | "4";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type User = { id: string; name: string | null; image?: string | null; role?: string | null };

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
  BLOCKED = "blocked",
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
  [IssueState.BLOCKED]: "Blocked",
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

export enum Priority {
  LOWEST = -2,
  LOW = -1,
  MEDIUM = 0,
  HIGH = 1,
  HIGHEST = 2,
}

export const priorityColors = {
  [Priority.HIGHEST]: "text-red-500",
  [Priority.HIGH]: "text-orange-500",
  [Priority.MEDIUM]: "",
  [Priority.LOW]: "text-blue-500",
  [Priority.LOWEST]: "text-purple-500",
};

export const priorityLabels = {
  [Priority.HIGHEST]: "Highest",
  [Priority.HIGH]: "High",
  [Priority.MEDIUM]: "Medium",
  [Priority.LOW]: "Low",
  [Priority.LOWEST]: "Lowest",
};

export enum WorkspaceRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}
