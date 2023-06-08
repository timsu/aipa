import { atom } from "nanostores";

import { Workspace } from "@prisma/client";

class WorkspaceStore {
  // --- services

  workspaces = atom<Workspace[]>([]);

  activeWorkspace = atom<Workspace | null>(null);

  // --- actions

  init = async (workspaces: Workspace[], activeWorkspace: string) => {
    this.workspaces.set(workspaces);
    this.activeWorkspace.set(workspaces.find((w) => w.id === activeWorkspace) || null);
  };
}

declare global {
  interface Window {
    workspaceStore: WorkspaceStore;
  }
}

export const workspaceStore = new WorkspaceStore();
if (typeof window !== "undefined") window.workspaceStore = workspaceStore;
