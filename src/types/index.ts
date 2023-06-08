import { Project, Workspace } from "@prisma/client";

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
