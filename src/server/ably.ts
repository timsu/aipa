import { UIMessage } from "@/types";
import { Issue } from "@prisma/client";
import Ably from "ably";

let ably: Ably.Types.RealtimePromise | null = null;

export default function getAbly() {
  if (!ably) ably = new Ably.Realtime.Promise(process.env.ABLY_API_KEY!);
  return ably;
}

export const ablySendIssueMessage = (id: string, message: UIMessage) =>
  getAbly()
    .channels.get("issue:" + id)
    .publish("message", message);

export const ablySendIssueUpdate = (id: string, updates: Partial<Issue>) =>
  getAbly()
    .channels.get("issue:" + id)
    .publish("update", updates);

// export const ablyPushRepoStatus = (repo: Repository) =>
//   getAbly()
//     .channels.get("repo:" + repo.id)
//     .publish("status", {
//       status: repo.status,
//     });
