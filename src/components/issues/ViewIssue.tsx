import { issueStore } from "@/stores/issueStore";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import { projectStore } from "@/stores/projectStore";
import ProjectBadge from "../projects/ProjectBadge";
import EditorContainer from "../editor/EditorContainer";
import Button from "../ui/Button";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { titleCase } from "@/lib/utils";
import { Issue } from "@prisma/client";
import { Doc } from "../editor/Doc";
import { Messages } from "../messages/Messages";
import IssueIcon from "./IssueTypeIcon";
import { IssueState, stateLabels } from "@/types";
import { editorStore } from "@/stores/editorStore";

export default function ViewIssue({ issue }: { issue: Issue }) {
  const project = useStore(projectStore.activeProject)!;
  const [submitting, setSubmitting] = useState<boolean>(false);

  const transition = async (newState: IssueState) => {
    setSubmitting(true);
    try {
      await issueStore.transitionIssue(issue, newState);
    } finally {
      setSubmitting(false);
    }
  };

  const assign = () => {};

  const deleteIssue = () => {};

  useEffect(() => {
    editorStore.editor?.commands.setContent((issue?.description as Doc) || "");
  }, [issue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.metaKey) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div>
      <div className="flex items-center">
        <ProjectBadge project={project} />
        <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
        <h2 className="text-xl flex-1">{issue.identifier}</h2>

        <button
          className="text-gray-500 hover:text-gray-700 mr-4"
          onClick={() => issueStore.editingIssue.set(true)}
          data-tooltip-content="Edit issue"
          data-tooltip-id="tooltip"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => issueStore.closeIssuePanel()}
          data-tooltip-content="Close"
          data-tooltip-id="tooltip"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col mt-4">
        <div className="text-lg font-semibold p-2">{issue.title}</div>
      </div>

      <EditorContainer className="h-64 p-2" readonly content={issue.description as Doc} />

      <div className="flex gap-4 items-center mb-4">
        <div className="mt-2 rounded-md hover:bg-gray-100 p-2 flex gap-1 items-center cursor-pointer">
          <IssueIcon type={issue.type} />
          {titleCase(issue.type)}
        </div>
        <div className="mt-2 rounded-md hover:bg-gray-100 p-2 flex gap-1 items-center cursor-pointer">
          {stateLabels[issue.state]}
        </div>
        <div className="mt-2 rounded-md hover:bg-gray-100 p-2 flex gap-1 items-center cursor-pointer">
          Not Assigned
        </div>
      </div>

      <div className="flex gap-4">
        {issue.state == IssueState.BACKLOG && (
          <Button
            data-tooltip-content="Add to the 'To Do' list"
            data-tooltip-id="tooltip"
            onClick={() => transition(IssueState.TODO)}
            disabled={submitting}
          >
            Mark as To Do
          </Button>
        )}
        {(issue.state == IssueState.TODO || issue.state == IssueState.IN_PROGRESS) && (
          <Button
            className="bg-gray-500 hover:bg-gray-700"
            data-tooltip-content="Move back to backlog"
            data-tooltip-id="tooltip"
            onClick={() => transition(IssueState.BACKLOG)}
            disabled={submitting}
          >
            Back to Backlog
          </Button>
        )}
        {(issue.state == IssueState.BACKLOG || issue.state == IssueState.TODO) && (
          <Button
            data-tooltip-content="Assign to you and move to 'In Progress'"
            data-tooltip-id="tooltip"
            onClick={() => transition(IssueState.IN_PROGRESS)}
            disabled={submitting}
          >
            Start Issue
          </Button>
        )}
        {issue.state == IssueState.IN_PROGRESS && (
          <Button
            data-tooltip-content="Mark as 'Review'"
            data-tooltip-id="tooltip"
            onClick={() => transition(IssueState.REVIEW)}
            disabled={submitting}
          >
            In Review
          </Button>
        )}
        <div className="flex-1"></div>
        <Button
          className="bg-red-700 hover:bg-red-900"
          data-tooltip-content="Delete this issue"
          data-tooltip-id="tooltip"
          onClick={deleteIssue}
        >
          Delete
        </Button>
      </div>

      <Messages />
    </div>
  );
}
