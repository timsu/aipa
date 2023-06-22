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

  setActiveProject = (id: string) => {
    const project = this.projects.get().find((p) => p.id === id);
    if (project) this.activeProject.set(project);
  };

  createProject = async (params: Partial<Project>) => {
    const project = await API.projects.create(params);
    this.projects.set([...this.projects.get(), project]);
    return project;
  };

  updateProject = async (project: Project, params: Partial<Project>) => {
    project = await API.projects.update(project.id, params);
    const projects = this.projects.get().map((p) => (p.id === project.id ? project : p));
    this.projects.set(projects);
    if (this.activeProject.get()?.id === project.id) this.activeProject.set(project);
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
