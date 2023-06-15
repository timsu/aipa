import PopoverMenu, { PopoverSelectOption } from "@/components/ui/PopoverMenu";
import { classNames } from "@/lib/utils";
import { issueStore } from "@/stores/issueStore";
import { workspaceStore } from "@/stores/workspaceStore";
import { IssueState, stateLabels } from "@/types";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import { Issue } from "@prisma/client";
import { useState } from "react";
import { usePopper } from "react-popper";

export default function IssueAssigneeMenu({
  issue,
  buttonClass,
}: {
  issue: Issue;
  buttonClass: string;
}) {
  const users = useStore(workspaceStore.users);
  const userList = useStore(workspaceStore.userList);

  const assign = (userId: string | null) => {
    issueStore.updateIssue(issue, { assigneeId: userId });
  };

  const assigneeName = issue.assigneeId
    ? "Assigned to " + users[issue.assigneeId!]?.name!
    : "Unassigned";

  return (
    <PopoverMenu buttonClass={buttonClass} buttonLabel={assigneeName}>
      <div className="px-2 py-2">Assign to:</div>
      <PopoverSelectOption selected={null == issue.assigneeId} onClick={() => assign(null)}>
        No One
      </PopoverSelectOption>

      {userList.map((user) => (
        <PopoverSelectOption
          key={user.id}
          selected={user.id == issue.assigneeId}
          onClick={() => assign(user.id)}
        >
          {user.name!}
        </PopoverSelectOption>
      ))}
    </PopoverMenu>
  );
}
