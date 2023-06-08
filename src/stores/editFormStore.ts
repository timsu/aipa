import { atom, map } from "nanostores";

import API from "@/client/api";
import { clearDebounce } from "@/lib/debounce";
import { logger } from "@/lib/logger";
import { QuestionType } from "@/types";
import Prisma, { Question } from "@prisma/client";
import { Editor } from "@tiptap/core";
import { editorStore, textContent } from "@/stores/editorStore";
import { toast } from "react-toastify";
import { JSONContent } from "@tiptap/react";

const SAVE_INTERVAL = 5000;

class EditFormStore {
  // --- services

  form = atom<Prisma.Form | undefined>();

  questions = map<{ [id: string]: Prisma.Question }>({});

  rootQuestions = atom<Prisma.Question[]>([]);

  editor: Editor | null = null;

  selectedQuestionId = atom<string | undefined>(undefined);

  dirty = atom<boolean>(false);

  // --- actions

  load = (form: Prisma.Form, questions: Prisma.Question[]) => {
    this.form.set(form);
    const questionMap = questions.reduce((acc, q) => ({ ...acc, [q.id]: q }), {});
    this.questions.set(questionMap);

    const rootQuestions = questions.filter((q) => !q.parentId).sort((a, b) => a.order - b.order);
    rootQuestions.forEach((q, i) => (q.order = i + 1)); // ensure order is sequential
    this.rootQuestions.set(rootQuestions);
  };

  reset = () => {
    clearDebounce("save-blocks");
    this.form.set(undefined);
    this.questions.set({});
    this.rootQuestions.set([]);
  };

  update = async (params: Partial<Prisma.Form>) => {
    const form = this.form.get();
    if (!form) return;
    const keyChanged = Object.keys(params).find((k) => (form as any)[k] != (params as any)[k]);
    if (!keyChanged) return;

    const result = await API.updateForm(form.id, params);
    this.form.set(result);
  };

  addQuestion = async (props: Partial<Question>) => {
    const existing = this.rootQuestions.get();
    const orderMax = Math.max(...existing.map((e) => e.order), 0);
    const newQuestion = {
      order: orderMax + 1,
      type: QuestionType.SHORT_ANSWER,
      title: "",
      required: true,
      ...props,
    } as Prisma.Question;

    const response = await API.createQuestion(this.form.get()!.id, newQuestion);
    this.rootQuestions.set([...existing, response]);
    this.questions.set({ ...this.questions.get(), [response.id]: response });

    return response;
  };

  updateQuestion = async (question: Prisma.Question, params: Partial<Prisma.Question>) => {
    if (!question) return;
    const keyChanged = Object.keys(params).find((k) => (question as any)[k] != (params as any)[k]);
    if (!keyChanged) return;

    this.questions.set({ ...this.questions.get(), [question.id]: { ...question, ...params } });
    Object.assign(question, params);

    // this question hasn't persisted to the database yet, delay saving
    if (!question.createdAt) {
      console.warn("question not persisted yet, delaying save");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
      await API.updateQuestion(question.id, params);
    } catch (e) {
      logger.warn("failed to update question", e);
      toast.error("Failed to save question");
    }

    // once we're editing questions, make sure form has a title
    const form = this.form.get();
    if (form && !form.name) {
      this.update({ name: "Untitled form" });
    }
  };

  deleteQuestion = async (question: Prisma.Question) => {
    const questions = this.rootQuestions.get();
    this.rootQuestions.set(questions.filter((q) => q.id != question.id));
    const params = { deletedAt: new Date() };
    this.questions.set({ ...this.questions.get(), [question.id]: { ...question, ...params } });
    await API.updateQuestion(question.id, params);
  };

  // --- sending

  loadSlug = async () => {
    const form = this.form.get();
    if (!form) return "";
    if (!form.slug) {
      form.slug = await API.slug(form.id);
    }
    const url = new URL(window.location.href);
    url.pathname = "/r/" + form!.slug;
    return url.toString();
  };

  sendForm = async (fromName: string, defaultFrom: string, emails: string) => {
    if (fromName) {
      API.updateUser({ from: fromName });
    }
    if (emails) {
      const form = this.form.get();
      await API.sendEmails(form!.id, emails, fromName || defaultFrom);
      toast.success("Emails sent");
    }
  };

  // --- saving questions

  onPreview = async () => {
    const doc = editorStore.getDoc();
    const topLevelNodes = doc.content;
    const questionMap = this.questions.get();
    const questions = topLevelNodes.filter((n) => n.attrs?.id && questionMap[n.attrs.id]);
    await Promise.all([this.removeDeletedQuestions(questions), this.saveAllQuestions(questions)]);
  };

  saveQuestion = async (block: JSONContent) => {
    if (!block.attrs?.id) return;

    const questionId = block.attrs.id;
    const question = this.questions.get()[questionId];
    if (!question) return;

    logger.debug("saving question", question, block);
    if (
      question.type === QuestionType.SHORT_ANSWER ||
      question.type === QuestionType.LONG_ANSWER ||
      question.type === QuestionType.SIGNATURE
    ) {
      const title = textContent(block).trim();
      if (title != question.title) {
        await this.updateQuestion(question, { title });
      }
    }

    if (question.type === QuestionType.CHECKBOXES || question.type === QuestionType.RADIO_BUTTONS) {
      const options = block.content?.map((n) => textContent(n).trim()) || [];
      const optionString = options.join("\n");
      if (optionString != question.options) {
        await this.updateQuestion(question, { options: options.join("\n") });
      }
    }
  };

  saveAllQuestions = async (blocks: JSONContent[]) => {
    await Promise.all(blocks.map(this.saveQuestion));
  };

  removeDeletedQuestions = async (blocks: JSONContent[]) => {
    const questions = this.questions.get();
    const questionsInDoc = blocks.map((b) => b.attrs?.id).filter(Boolean);
    const inDocSet = new Set(questionsInDoc);

    const missingQuestions = Object.keys(questions).filter((id) => !inDocSet.has(id));
    if (missingQuestions.length) {
      logger.info("deleted questions", missingQuestions);
      const params = { deletedAt: new Date() };
      try {
        await Promise.all(missingQuestions.map((id) => API.updateQuestion(id, params)));
      } catch (e) {
        logger.warn("failed to delete questions", e);
      }
    }
  };
}

declare global {
  interface Window {
    editFormStore: EditFormStore;
  }
}

export const editFormStore = new EditFormStore();
if (typeof window !== "undefined" && process.env.NODE_ENV == "development")
  window.editFormStore = editFormStore;
