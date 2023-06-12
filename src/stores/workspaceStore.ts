import { atom, map } from "nanostores";

import { Workspace } from "@prisma/client";
import { User } from "@/types";

class WorkspaceStore {
  // --- services

  workspaces = atom<Workspace[]>([]);

  users = map<{ [id: string]: User }>({});

  activeWorkspace = atom<Workspace | null>(null);

  // --- actions

  init = async (workspaces: Workspace[], activeWorkspace: string | null) => {
    this.workspaces.set(workspaces);
    this.activeWorkspace.set(workspaces.find((w) => w.id === activeWorkspace) || null);
  };

  initUsers = (users: User[], yourUser: string) => {
    const map: { [id: string]: User } = {};
    users.forEach((user) => {
      map[user.id] = user;
      if (user.id === yourUser) {
        map[user.id].name = "You";
      }
    });
    this.users.set(map);
  };
}

declare global {
  interface Window {
    workspaceStore: WorkspaceStore;
  }
}

export const workspaceStore = new WorkspaceStore();
if (typeof window !== "undefined") window.workspaceStore = workspaceStore;
