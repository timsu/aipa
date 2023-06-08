import { atom, map } from "nanostores";

import Prisma, { Issue, Project, User } from "@prisma/client";
import API from "@/client/api";
import { logger } from "@/lib/logger";
import { toast } from "react-toastify";
import { IssueState } from "@/types";

type IssueMap = { [type: string]: Issue[] };

class DashboardStore {
  // --- services

  issues = atom<Issue[]>([]);

  groupedIssues = map<IssueMap>({});

  // --- actions

  load = async () => {
    try {
      const issues = await API.listIssues({ filter: "mystuff" });
      this.issues.set(issues);
      this.splitIssues(issues);
    } catch (error) {
      logger.error(error);
      toast.error("Failed to load issues");
    }
  };

  splitIssues = (issues: Issue[]) => {
    const map: IssueMap = {};
    issues.forEach((issue) => {
      const state = issue.state.trim();
      if (!map[state]) {
        map[state] = [];
      }
      map[state].push(issue);
    });
    this.groupedIssues.set(map);
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
