import { atom } from "nanostores";

import { Project } from "@prisma/client";

class ProjectStore {
  // --- services

  projects = atom<Project[]>([]);

  activeProject = atom<Project | null>(null);

  // --- actions

  init = async (projects: Project[]) => {
    this.projects.set(projects);
    this.activeProject.set(projects[0] || null);
  };
}

declare global {
  interface Window {
    projectStore: ProjectStore;
  }
}

export const projectStore = new ProjectStore();
if (typeof window !== "undefined") window.projectStore = projectStore;
