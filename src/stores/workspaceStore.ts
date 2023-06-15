import { atom, map } from "nanostores";

import { Workspace } from "@prisma/client";
import { User } from "@/types";
import API from "@/client/api";

class WorkspaceStore {
  // --- services

  workspaces = atom<Workspace[]>([]);

  users = map<{ [id: string]: User }>({});

  userList = atom<User[]>([]);

  activeWorkspace = atom<Workspace | null>(null);

  roles = map<{ [id: string]: string }>({});

  // --- actions

  init = async (workspaces: Workspace[], activeWorkspace: string | null) => {
    this.workspaces.set(workspaces);
    this.activeWorkspace.set(workspaces.find((w) => w.id === activeWorkspace) || null);
  };

  initUsers = (users: User[], yourUser: string) => {
    this.userList.set(users);

    const map: { [id: string]: User } = {};
    users.forEach((user) => {
      map[user.id] = user;
      if (user.id === yourUser) {
        map[user.id].name = "You";
      }
    });
    this.users.set(map);
  };

  loadRoles = async () => {
    const workspace = this.activeWorkspace.get();
    if (!workspace) return;
    const members = await API.members.list(workspace);

    const roles: { [id: string]: string } = {};
    members.forEach((member) => {
      roles[member.userId] = member.role;
    });
    this.roles.set(roles);
  };

  inviteMember = async (email: string, role: string) => {
    const workspace = this.activeWorkspace.get();
    if (!workspace) return;
    // const response = await API.projectAddMember(project, email, role)
    // projectStore.onProjectUpdated(response)
    const user = { id: "", name: email, role };
    this.userList.set([...this.userList.get(), user]);
    this.roles.set({ ...this.roles.get(), [user.id]: user.role });

    await API.members.create(workspace, { email, role } as any);
  };
}

declare global {
  interface Window {
    workspaceStore: WorkspaceStore;
  }
}

export const workspaceStore = new WorkspaceStore();
if (typeof window !== "undefined") window.workspaceStore = workspaceStore;
