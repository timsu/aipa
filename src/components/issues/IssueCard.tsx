import { projectStore } from "@/stores/projectStore";
import { Issue } from "@prisma/client";
import Image from "next/image";
import ProjectBadge from "../projects/ProjectBadge";
import IssueIcon from "./IssueTypeIcon";
import { IssueType } from "@/types";
import { classNames } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import { issueStore } from "@/stores/issueStore";
import { UserAvatar } from "../ui/Avatar";

export default function IssueCard({
  issue,
  onClick,
}: {
  issue: Issue;
  onClick?: (issue: Issue) => void;
}) {
  const project = projectStore.projects.get().find((p) => p.id == issue.projectId)!;

  const bg =
    issue.type == IssueType.STORY
      ? "bg-green-50 hover:bg-green-100"
      : issue.type == IssueType.BUG
      ? "bg-red-50 hover:bg-red-100"
      : issue.type == IssueType.TASK
      ? "bg-blue-50 hover:bg-blue-100"
      : issue.type == IssueType.EXPRIMENT
      ? "bg-purple-50 hover:bg-purple-100"
      : "bg-gray-50 hover:bg-gray-100";

  const isActive = useStore(issueStore.activeIssue)?.id == issue.id;

  return (
    <div
      onClick={() => onClick?.(issue)}
      className={classNames(
        "rounded-lg shadow cursor-pointer",
        bg,
        isActive ? "ring-2 ring-blue-500" : ""
      )}
    >
      <div className="flex w-full items-center justify-between space-x-6 p-4">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className={classNames("truncate text-sm text-gray-900 font-medium")}>
              {issue.title}
            </h3>
          </div>
          <div className="flex items-center space-x-3 mt-1">
            <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              {project.shortcode}-{issue.number}
            </span>

            <p className="flex items-center gap-1 truncate text-sm text-gray-500">
              <IssueIcon type={issue.type.trim() as any} />
              {issue.type}
            </p>
          </div>
        </div>
        {issue.assigneeId && <UserAvatar userId={issue.assigneeId} />}
      </div>
    </div>
  );
}
