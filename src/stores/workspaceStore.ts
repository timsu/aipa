import { atom, map } from "nanostores";

import { Workspace } from "@prisma/client";
import { User } from "@/types";
import API from "@/client/api";
import { uiStore } from "@/stores/uiStore";
import { logger } from "@/lib/logger";
import { toast } from "react-toastify";

class WorkspaceStore {
  // --- services

  workspaces = atom<Workspace[]>([]);

  users = map<{ [id: string]: User }>({});

  userList = atom<User[]>([]);

  memberList = atom<User[]>([]); // team roster for the teams page

  activeWorkspace = atom<Workspace | null>(null);

  // --- actions

  init = async (workspaces: Workspace[], activeWorkspace: string | null) => {
    this.workspaces.set(workspaces);
    this.activeWorkspace.set(workspaces.find((w) => w.id === activeWorkspace) || null);
  };

  initUsers = (users: User[], yourUser: string | undefined) => {
    this.userList.set(users);

    const map: { [id: string]: User } = {};
    users.forEach((user) => {
      map[user.id] = user;
      if (user.id === yourUser) {
        map[user.id].name = "You";
      }
    });
    this.users.set(map);
    this.memberList.set(users);
  };

  loadMembers = async () => {
    const workspace = this.activeWorkspace.get();
    if (!workspace) return;
    const members = await API.members.list<User[]>(workspace);
    this.memberList.set(members);
  };

  inviteMember = async (email: string, role: string) => {
    const workspace = this.activeWorkspace.get();
    if (!workspace) return;
    const user = await API.members.create<User & { email: string; url?: string }>(workspace, {
      email,
      role,
    });

    const users = this.memberList.get();
    if (!users.find((u) => u.id === user.id)) {
      users.unshift(user);
    }

    this.initUsers(users, uiStore.user.get()?.id);
    this.memberList.set(users);

    return user.url;
  };

  resendInvite = async (user: User) => {
    const workspace = this.activeWorkspace.get();
    if (!workspace) return;

    this.userList.set(
      this.userList.get().map((u) => (user.id === u.id ? { ...u, sentEmail: true } : u))
    );
    try {
      await API.resendInvite(workspace.id, user.name!);
    } catch (e) {
      logger.error(e);
      toast.error("Failed to resend invite");
    }
  };
}

declare global {
  interface Window {
    workspaceStore: WorkspaceStore;
  }
}

export const workspaceStore = new WorkspaceStore();
if (typeof window !== "undefined") window.workspaceStore = workspaceStore;
