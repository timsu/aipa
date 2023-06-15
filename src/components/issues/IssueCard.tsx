import { projectStore } from "@/stores/projectStore";
import { Issue } from "@prisma/client";
import Image from "next/image";
import ProjectBadge from "../projects/ProjectBadge";
import IssueIcon from "./IssueTypeIcon";
import { IssueState, IssueType, Priority, priorityColors, priorityLabels } from "@/types";
import { classNames } from "@/lib/utils";
import { useStore } from "@nanostores/react";
import { issueStore } from "@/stores/issueStore";
import { UserAvatar } from "../ui/Avatar";
import { priorityIcons } from "@/components/issues/IssuePriorityMenu";

export default function IssueCard({
  issue,
  onClick,
}: {
  issue: Issue;
  onClick?: (issue: Issue) => void;
}) {
  const project = projectStore.projects.get().find((p) => p.id == issue.projectId)!;

  const bg =
    issue.state == IssueState.DONE
      ? "bg-green-50 hover:bg-green-100"
      : issue.state == IssueState.REVIEW
      ? "bg-blue-50 hover:bg-blue-100"
      : issue.state == IssueState.BLOCKED
      ? "bg-purple-100 hover:bg-purple-300"
      : issue.type == IssueType.BUG
      ? "bg-red-100 hover:bg-red-200"
      : issue.type == IssueType.EXPRIMENT
      ? "bg-purple-50 hover:bg-purple-100"
      : issue.state == IssueState.IN_PROGRESS
      ? "bg-yellow-50 hover:bg-yellow-100"
      : issue.state == IssueState.TODO
      ? "bg-gray-50 hover:bg-gray-100"
      : issue.state == IssueState.DRAFT
      ? "bg-orange-100 hover:bg-orange-200"
      : "bg-white-50 hover:bg-gray-50";

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
            <div className="text-xs font-medium" style={{ color: `#${project.color}` }}>
              {project.shortcode}-{issue.number}
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-500">
              <IssueIcon type={issue.type.trim() as any} />
              {issue.type}
            </div>

            {issue.priority ? (
              <div
                className={classNames(
                  "flex items-center text-sm",
                  priorityColors[issue.priority as Priority]
                )}
              >
                {priorityIcons[issue.priority as Priority]}
                {priorityLabels[issue.priority as Priority]}
              </div>
            ) : null}
          </div>
        </div>
        {issue.assigneeId && <UserAvatar userId={issue.assigneeId} />}
      </div>
    </div>
  );
}
