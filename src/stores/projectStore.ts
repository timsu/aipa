import { atom } from "nanostores";

import { Project } from "@prisma/client";
import API from "@/client/api";

class ProjectStore {
  // --- services

  projects = atom<Project[]>([]);

  activeProject = atom<Project | null>(null);

  // --- actions

  init = async (projects: Project[]) => {
    this.projects.set(projects);
    this.activeProject.set(projects[0] || null);
  };

  createProject = async (params: Partial<Project>) => {
    const project = await API.projects.create(params);
    this.projects.set([...this.projects.get(), project]);
    return project;
  };
}

declare global {
  interface Window {
    projectStore: ProjectStore;
  }
}

export const projectStore = new ProjectStore();
if (typeof window !== "undefined") window.projectStore = projectStore;
