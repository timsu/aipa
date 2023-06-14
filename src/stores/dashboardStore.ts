import { atom, map } from "nanostores";

import Prisma, { Issue, Project, User } from "@prisma/client";
import API from "@/client/api";
import { logger } from "@/lib/logger";
import { toast } from "react-toastify";
import { IssueState } from "@/types";
import { issueStore } from "./issueStore";

class DashboardStore {
  // --- services

  // --- actions

  load = async () => {
    try {
      issueStore.init();
      const issues = await API.listIssues({ filter: "mystuff" });
      issueStore.loadIssues(issues);
    } catch (error) {
      logger.error(error);
      toast.error("Failed to load issues");
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
