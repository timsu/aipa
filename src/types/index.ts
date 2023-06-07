import { Question } from "@prisma/client";

export type Model = "3.5" | "4";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export enum QuestionType {
  SHORT_ANSWER = "short-answer",
  LONG_ANSWER = "long-answer",
  RADIO_BUTTONS = "radio-buttons",
  CHECKBOXES = "checkboxes",
  UPLOAD = "upload",
  TEXT = "text",
  SIGNATURE = "signature",
}

export enum UploadType {
  IMAGES = "images",
  DOCS = "docs",
  SPREADSHEETS = "spreadsheets",
  ANYTHING = "anything",
}

export enum FillRole {
  OWNER = "owner",
  DELEGATE = "delegate",
}

export enum QuestionMode {
  COMPOSE,
  PREVIEW,
  ANSWER,
}

export type Signature = {
  name: string;
  ua: string;
};

export type QuestionMeta = {
  freeText?: string;
};

export const questionMeta = (q: Question) => (q?.meta || {}) as QuestionMeta;

export type User = { name?: string; email: string };

export type UserMeta = {
  from?: string; // send from email
};

export const userMeta = (u: { meta: any } | undefined) => (u?.meta || {}) as UserMeta;

export type FormOptions = {
  comments?: boolean;
  dueDate?: DueDate;
  customDate?: string | null;
};

export const formOptions = (f: { options: any } | undefined) => (f?.options || {}) as FormOptions;

export enum DueDate {
  NONE = "",
  ONE_WEEK = "1w",
  TWO_WEEKS = "2w",
  ONE_MONTH = "1m",
  CUSTOM = "custom",
}
