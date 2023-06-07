import Ably from "ably";

let ably: Ably.Types.RealtimePromise | null = null;

export default function getAbly() {
  if (!ably) ably = new Ably.Realtime.Promise(process.env.ABLY_API_KEY!);
  return ably;
}

// export const ablyPushDraftStatus = (request: DraftRequest) =>
//   getAbly()
//     .channels.get("repo:" + request.repositoryId)
//     .publish("draft-status", {
//       id: request.id,
//       name: request.name,
//       prUrl: request.prUrl,
//       status: request.status,
//     });

// export const ablyPushLogLine = (id: string, line: string) =>
//   getAbly()
//     .channels.get("request:" + id)
//     .publish("log", {
//       line,
//     });

// export const ablyPushRepoStatus = (repo: Repository) =>
//   getAbly()
//     .channels.get("repo:" + repo.id)
//     .publish("status", {
//       status: repo.status,
//     });
