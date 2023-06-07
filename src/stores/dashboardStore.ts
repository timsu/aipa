import { atom, map } from "nanostores";

import Prisma, { Form, FormFill, User } from "@prisma/client";
import API from "@/lib/api";
import { logger } from "@/lib/logger";
import { toast } from "react-toastify";

export type FormWithFill = Prisma.Form & {
  formFills: FormFill[];
};

export type FillWithUser = Prisma.FormFill & {
  user: { email: string };
};

class DashboardStore {
  // --- services

  deleteFormModal = atom<FormWithFill | undefined>();

  responsesModal = atom<FormWithFill | undefined>();

  forms = atom<FormWithFill[]>([]);

  formFills = map<{ [formId: string]: FillWithUser[] }>({});

  // --- actions

  load = (forms: FormWithFill[]) => {
    logger.info("forms loaded", forms);
    this.forms.set(forms);
  };

  updateForm = async (form: Prisma.Form, updates: Partial<Form>) => {
    form = { ...form, ...updates };
    this.forms.set(this.forms.get().map((f) => (f.id == form.id ? { ...f, ...form } : f)));

    try {
      await API.updateForm(form.id, updates);
    } catch (e) {
      logger.error(e);
      toast.error("Failed to delete form");
    }
  };

  deleteForm = async (form: Prisma.Form) => {
    this.forms.set(this.forms.get().filter((f) => f.id != form.id));
    try {
      await API.updateForm(form.id, { deletedAt: new Date() });
    } catch (e) {
      logger.error(e);
      toast.error("Failed to delete form");
    }
  };

  loadFills = async (form: Prisma.Form) => {
    try {
      const fills = (await API.loadFills(form)) as FillWithUser[];
      this.formFills.set({ ...this.formFills.get(), [form.id]: fills });
    } catch (e) {
      logger.error(e);
      toast.error("Failed to load responses");
      if (!this.formFills.get()[form.id]) {
        this.formFills.set({ ...this.formFills.get(), [form.id]: [] });
      }
    }
  };
}

declare global {
  interface Window {
    dashboardStore: DashboardStore;
  }
}

export const dashboardStore = new DashboardStore();
if (typeof window !== "undefined" && process.env.NODE_ENV == "development")
  window.dashboardStore = dashboardStore;
