import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";

import { FillRole, UserMeta } from "@/types";
import Prisma, { Answer, FillDelegate, Form, FormFill, Question } from "@prisma/client";

export type FormFillWithData = FormFill & {
  answers: Answer[];
  fillDelegations: FillDelegate[];
};

export type SuccessResponse = {
  success: true;
};

class APIService {
  axios: AxiosInstance;

  constructor() {
    const config: CreateAxiosDefaults = {
      baseURL: (typeof window === "undefined" ? process.env.NEXTAUTH_URL : "") + "/api",
    };
    this.axios = axios.create(config);
  }

  welcome = async (): Promise<SuccessResponse> => {
    const response = await this.axios.get("/users/welcome");
    return response.data;
  };

  updateUser = async (meta: UserMeta): Promise<UserMeta> => {
    const response = await this.axios.put("/users/meta", { meta });
    return response.data;
  };

  getAblyTokenRequest = async (): Promise<string> => {
    const response = await this.axios.get("/ably/token");
    return response.data;
  };

  createForm = async (): Promise<Form> => {
    const response = await this.axios.post("/forms");
    return response.data;
  };

  updateForm = async (id: string, params: Partial<Form>): Promise<Prisma.Form> => {
    const response = await this.axios.put("/forms", { id, ...params });
    return response.data;
  };

  sendEmails = async (id: string, emails: string, fromName: string): Promise<SuccessResponse> => {
    const response = await this.axios.post("/forms/sendEmails", { id, emails, fromName });
    return response.data;
  };

  loadFills = async (form: Form): Promise<Prisma.FormFill[]> => {
    const response = await this.axios.get("/forms/fills?id=" + form.id);
    return response.data;
  };

  saveContents = async (id: string, data: any): Promise<Prisma.Form> => {
    const response = await this.axios.put("/contents", { id, data });
    return response.data;
  };

  createQuestion = async (formId: string, params: Partial<Question>): Promise<Question> => {
    const response = await this.axios.post("/questions?formId=" + formId, params);
    return response.data;
  };

  updateQuestion = async (id: string, params: Partial<Question>): Promise<Question> => {
    const response = await this.axios.put("/questions", { id, ...params });
    return response.data;
  };

  slug = async (id: string): Promise<string> => {
    const response = await this.axios.get("/forms/slug?id=" + id);
    return response.data;
  };

  // --- form fill

  formFillData = async (id: string): Promise<FormFillWithData> => {
    const response = await this.axios.get("/form_fills/" + id);
    return response.data;
  };

  updateFormFill = async (
    formFill: FormFill,
    updates: Partial<FormFill>
  ): Promise<FormFillWithData> => {
    const response = await this.axios.put("/form_fills/" + formFill.id, updates);
    return response.data;
  };

  submitForm = async (id: string): Promise<SuccessResponse> => {
    const response = await this.axios.put("/form_fills/submit", { id });
    return response.data;
  };

  updateAnswer = async (fillId: string, questionId: string, value: string): Promise<Answer> => {
    const response = await this.axios.post("/form_fills/answer", { fillId, questionId, value });
    return response.data;
  };
}

const API = new APIService();

export default API;
