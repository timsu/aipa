import { atom, map } from "nanostores";

import API, { FormFillWithData } from "@/client/api";
import Prisma, { Answer, Question } from "@prisma/client";
import { QuestionType, Signature, User, formOptions } from "@/types";
import { logger } from "@/lib/logger";
import { toast } from "react-toastify";

class FillFormStore {
  // --- services

  form = atom<Prisma.Form | undefined>();

  user = atom<User | undefined>();

  formFill = atom<Prisma.FormFill | undefined>();

  answers = map<{ [questionId: string]: Answer }>({});

  errors = map<{ [questionId: string]: string | undefined }>({});

  questions = map<{ [id: string]: Question }>({});

  rootQuestions = atom<Prisma.Question[]>([]);

  loginModal = atom<boolean>(false);

  finished = atom<boolean>(false);

  previewMode = atom<boolean>(true);

  readOnly = atom<boolean>(false);

  selectedQuestionId = atom<string | undefined>(undefined);

  canComment = false;

  // --- actions

  load = async (
    form: Prisma.Form,
    questions: Prisma.Question[],
    user: User | undefined,
    previewMode: boolean
  ) => {
    this.form.set(form);
    const questionMap = questions.reduce((acc, q) => ({ ...acc, [q.id]: q }), {});
    this.questions.set(questionMap);

    const rootQuestions = questions.filter((q) => !q.parentId).sort((a, b) => a.order - b.order);
    rootQuestions.forEach((q, i) => (q.order = i + 1)); // ensure order is sequential
    this.rootQuestions.set(rootQuestions);

    this.user.set(user);
    this.canComment = !!formOptions(form).comments;

    if (user && !previewMode) {
      this.loginModal.set(false);

      try {
        const formFill = await API.formFillData(form.id);
        if (formFill) {
          this.formFill.set(formFill);
          this.previewMode.set(false);
          const answerMap = formFill.answers.reduce(
            (acc, a) => ({ ...acc, [a.questionId]: a }),
            {}
          );
          this.answers.set(answerMap);
        }
      } catch (e: any) {
        console.log("errr");
        logger.error(e);
        toast.error("Failed to initialize form filling.");
      }
    } else {
      this.loginModal.set(true);
    }
  };

  loadResponse = async (
    form: Prisma.Form,
    formFill: Prisma.FormFill,
    questions: Prisma.Question[],
    user: User,
    answers: Answer[]
  ) => {
    this.form.set(form);
    this.formFill.set(formFill);
    const questionMap = questions.reduce((acc, q) => ({ ...acc, [q.id]: q }), {});
    this.questions.set(questionMap);

    const rootQuestions = questions.filter((q) => !q.parentId).sort((a, b) => a.order - b.order);
    rootQuestions.forEach((q, i) => (q.order = i + 1)); // ensure order is sequential
    this.rootQuestions.set(rootQuestions);

    this.user.set(user);
    this.previewMode.set(true);
    this.readOnly.set(true);

    const answerMap = answers.reduce((acc, a) => ({ ...acc, [a.questionId]: a }), {});
    this.answers.set(answerMap);
  };

  reset = () => {
    this.form.set(undefined);
    this.answers.set({});
    this.questions.set({});
    this.errors.set({});
    this.rootQuestions.set([]);
  };

  clearError = (questionId: string) => {
    const errors = this.errors.get();
    this.errors.set({ ...errors, [questionId]: undefined });
  };

  onEditAnswer = async (question: Question, value: any) => {
    const questionId = question.id;
    const formFill = this.formFill.get();
    if (!formFill) {
      this.answers.setKey(questionId, { questionId, value } as Answer);
      return;
    }
    const stringAnswer = typeof value != "string" ? JSON.stringify(value) : value;
    const answer = await API.updateAnswer(formFill.id, questionId, stringAnswer);
    this.answers.setKey(questionId, answer);

    this.updateCompletionPct();
  };

  updateCompletionPct = () => {
    const formFill = this.formFill.get();
    if (!formFill) return;

    const questions = Object.values(this.questions.get());
    const answers = this.answers.get();
    const numQuestions = questions.length;
    const numAnswers = Object.values(answers).filter((a) => !!a.value).length;
    const pct = Math.round((numAnswers / numQuestions) * 100);

    if (pct != formFill?.completed) {
      API.updateFormFill(formFill, { completed: pct });
    }
  };

  validateForm = () => {
    const questions = Object.values(this.questions.get());
    const answers = this.answers.get();
    const errors: { [questionId: string]: string } = {};

    let valid = true;
    questions.forEach((q) => {
      const required = q.required;
      const answer = answers[q.id];
      const validAnswer =
        q.type == QuestionType.SIGNATURE ? validSig(answer?.value) : !!answer?.value;
      if (required && !validAnswer) {
        errors[q.id] = "Required";
        valid = false;
      }
    });

    this.errors.set(errors);
    return valid;
  };

  submit = async () => {
    const formFill = this.formFill.get();
    if (!formFill) return;

    await API.submitForm(formFill.id);
  };
}

const validSig = (value: string | Signature | undefined) => {
  if (!value) return false;

  try {
    const sig = typeof value == "string" ? JSON.parse(value) : value;
    return !!sig.name;
  } catch (e) {
    return false;
  }
};

declare global {
  interface Window {
    fillFormStore: FillFormStore;
  }
}

export const fillFormStore = new FillFormStore();
if (typeof window !== "undefined" && process.env.NODE_ENV == "development")
  window.fillFormStore = fillFormStore;
