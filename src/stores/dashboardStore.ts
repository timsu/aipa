import { atom, map } from "nanostores";

import Prisma, { Project, User } from "@prisma/client";
import API from "@/client/api";
import { logger } from "@/lib/logger";
import { toast } from "react-toastify";

class DashboardStore {
  // --- services

  projects = atom<Project[]>([]);

  // --- actions

  load = (projects: Project[]) => {
    this.projects.set(projects);
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
