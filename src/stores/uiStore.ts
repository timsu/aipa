import Ably from "ably";
import { atom } from "nanostores";
import { Project, Workspace } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { NextRouter, useRouter } from "next/router";
import { WorkspaceProps } from "@/types";
import { workspaceStore } from "./workspaceStore";
import { projectStore } from "./projectStore";

class UIStore {
  realtime: Ably.Realtime | undefined;

  sidebarVisible = atom<boolean>(true);

  user = atom<{ id: string; email: string; name: string } | null>(null);

  router: NextRouter | undefined;

  init = (props: WorkspaceProps) => {
    if (!this.realtime) {
      this.realtime = new Ably.Realtime({ authUrl: location.origin + "/api/ably/token" });
    }

    workspaceStore.init(props.workspaces, props.activeWorkspace);
    projectStore.init(props.projects);
  };

  toggleSidebar = () => {
    this.sidebarVisible.set(!this.sidebarVisible.get());
  };

  onConnected = (callback: (realtime: Ably.Realtime) => void) => {
    if (!this.realtime) return;
    if (this.realtime.connection.state === "connected") {
      callback(this.realtime);
    }
    this.realtime.connection.once("connected", () => callback(this.realtime!));
  };
}

export function useUI(props: WorkspaceProps) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    uiStore.init(props);
  }, [props]);

  useEffect(() => {
    uiStore.router = router;
  }, [router]);

  useEffect(() => {
    if (session.data?.user) {
      uiStore.user.set(session.data.user);
    }
  }, [session]);

  return session;
}

declare global {
  interface Window {
    uiStore: UIStore;
  }
}

export const uiStore = new UIStore();
if (typeof window !== "undefined") window.uiStore = uiStore;
