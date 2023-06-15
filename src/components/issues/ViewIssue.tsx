import { issueStore } from "@/stores/issueStore";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import { projectStore } from "@/stores/projectStore";
import ProjectBadge from "../projects/ProjectBadge";
import EditorContainer from "../editor/EditorContainer";
import Button from "../ui/Button";
import { PencilIcon } from "@heroicons/react/24/outline";
import { MutableRefObject, Ref, useCallback, useEffect, useRef, useState } from "react";
import { classNames, titleCase, unwrapError } from "@/lib/utils";
import { Issue } from "@prisma/client";
import { Doc } from "../editor/Doc";
import { Messages } from "../messages/Messages";
import IssueIcon from "./IssueTypeIcon";
import { IssueState, stateLabels } from "@/types";
import { editorStore } from "@/stores/editorStore";
import { workspaceStore } from "@/stores/workspaceStore";
import IssueStateMenu from "@/components/issues/IssueStateMenu";
import TextField from "@/components/inputs/TextField";
import API from "@/client/api";
import useShortcut, { ctrlOrMeta } from "@/components/hooks/useShortcut";
import { SidebarButton } from "@/components/layout/PageLayout";
import IssueAssigneeMenu from "@/components/issues/IssueAssigneeMenu";
import IssuePriorityMenu from "@/components/issues/IssuePriorityMenu";

export default function ViewIssue({ issue }: { issue: Issue }) {
  const project = useStore(projectStore.activeProject)!;
  const [editing, setEditing] = useState<boolean>(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useShortcut(
    ["Escape"],
    (e: KeyboardEvent) => {
      if (editing) setEditing(false);
      else issueStore.closeIssuePanel();
    },
    false
  );

  return (
    <div>
      <div className="flex items-center">
        <SidebarButton />
        <ProjectBadge project={project} />
        <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
        <h2 className="text-xl flex-1">{issue.identifier}</h2>

        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => issueStore.closeIssuePanel()}
          data-tooltip-content="Close"
          data-tooltip-id="tooltip"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div
        className="flex items-center mt-4 p-2 cursor-pointer group"
        onClick={() => !editing && setEditing(true)}
      >
        {editing ? (
          <>
            <TextField
              ref={titleRef}
              name="title"
              autoFocus
              defaultValue={issue.title}
              className="text-lg border-gray-300 flex-1 leading-normal py-1 -mt-2 -ml-1"
              placeholder={"Issue Title"}
            />
          </>
        ) : (
          <>
            <div className="text-lg font-semibold">{issue.title}</div>
            <PencilIcon className="ml-2 -mt-1 w-4 h-4 text-gray-500 invisible group-hover:visible" />
          </>
        )}
      </div>

      <div
        className={classNames("group h-64 overflow-auto", !editing && "cursor-pointer")}
        onClick={() => !editing && setEditing(true)}
      >
        {editing ? (
          <EditorContainer
            className="h-64 rounded-md border border-gray-300 p-2"
            content={issue.description as Doc}
          />
        ) : (
          <>
            <EditorContainer className="p-2" readonly content={issue.description as Doc} />
            <PencilIcon className="ml-2 -mt-1 w-4 h-4 text-gray-500 invisible group-hover:visible" />
          </>
        )}
      </div>

      <div className="flex gap-4 items-center mb-4 mt-2">
        <div className="rounded-md hover:bg-gray-100 p-2 flex gap-1 items-center cursor-pointer">
          <IssueIcon type={issue.type} />
          {titleCase(issue.type)}
        </div>
        <IssueStateMenu
          issue={issue}
          buttonClass="rounded-md hover:bg-gray-100 p-2 flex gap-1 items-center cursor-pointer"
        />
        <IssueAssigneeMenu
          issue={issue}
          buttonClass="rounded-md hover:bg-gray-100 p-2 flex gap-1 items-center cursor-pointer"
        />
        <IssuePriorityMenu
          issue={issue}
          buttonClass="rounded-md hover:bg-gray-100 p-2 flex gap-1 items-center cursor-pointer"
        />
      </div>

      {editing ? (
        <EditActions issue={issue} setEditing={setEditing} titleRef={titleRef} />
      ) : (
        <ViewActions issue={issue} />
      )}

      <Messages issue={issue} />

      <VisibleInList issue={issue} />
    </div>
  );
}

const VisibleInList = ({ issue }: { issue: Issue }) => {
  const issueList = useStore(issueStore.issues);
  const visibleInList = issueList.find((i) => i.id === issue.id);

  return visibleInList ? null : (
    <div className="mt-4">Note: this issue is not visible in the current issue list</div>
  );
};

const EditActions = ({
  issue,
  titleRef,
  setEditing,
}: {
  issue: Issue;
  titleRef: MutableRefObject<HTMLInputElement | null>;
  setEditing: (editing: boolean) => void;
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const save = useCallback(async () => {
    setSubmitting(true);

    setError(null);
    setSuccessMessage(null);
    const description = editorStore.getDoc();
    const updates = { title: titleRef.current?.value || issue.title, description };

    try {
      const updatedIssue = await API.issues.update(issue.projectId!, issue.id, updates);
      setSuccessMessage("Saved.");
      issueStore.issueUpdated(updatedIssue);
      setEditing(false);
      return updatedIssue;
    } catch (e) {
      setError(unwrapError(e));
    } finally {
      setSubmitting(false);
    }
    return false;
  }, [titleRef, issue, setEditing]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key == "s" && e.metaKey) {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [save]);

  return (
    <>
      <div className="flex gap-4 mb-4 flex-wrap">
        <Button onClick={save} disabled={submitting}>
          Save (⌘S)
        </Button>

        <div className="flex-1"></div>
        <Button
          className="bg-transparent text-gray-700 hover:bg-gray-50"
          data-tooltip-content="Delete this issue"
          data-tooltip-id="tooltip"
          onClick={() => setEditing(false)}
        >
          Cancel
        </Button>
      </div>

      {successMessage && <div className="text-green-500">{successMessage}</div>}
      {error && <div className="text-red-500">{error}</div>}
    </>
  );
};

type Action = {
  label: string;
  transition: IssueState;
  className?: string;
  tooltip?: string;
};

const ViewActions = ({ issue }: { issue: Issue }) => {
  const [submitting, setSubmitting] = useState<boolean>(false);

  const transition = async (newState: IssueState) => {
    setSubmitting(true);
    try {
      await issueStore.transitionIssue(issue, newState);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteIssue = () => {};

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.metaKey) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const actions: Action[] = [];

  if (issue.state == IssueState.BACKLOG)
    actions.push({ label: "Mark as To Do", transition: IssueState.TODO });

  if (
    issue.state == IssueState.TODO ||
    issue.state == IssueState.BACKLOG ||
    issue.state == IssueState.SUGGESTIONS ||
    issue.state == IssueState.BLOCKED
  )
    actions.push({
      label: issue.state == IssueState.BLOCKED ? "Resume Issue" : "Start Issue",
      transition: IssueState.IN_PROGRESS,
      tooltip: "Assign to you and move to 'In Progress'",
    });

  if (issue.state == IssueState.IN_PROGRESS) {
    actions.push({ label: "Ready to Review", transition: IssueState.REVIEW });
    actions.push({
      label: "Blocked",
      transition: IssueState.BLOCKED,
      className: "bg-transparent text-purple-500 hover:bg-purple-100",
      tooltip: "Use 'Blocked' to signal you can't make progress",
    });
  }

  if (
    issue.state == IssueState.TODO ||
    issue.state == IssueState.IN_PROGRESS ||
    issue.state == IssueState.BLOCKED
  )
    actions.push({
      label: "Back to Backlog",
      transition: IssueState.BACKLOG,
      className: "bg-transparent hover:bg-gray-100 text-gray-700",
    });

  if (issue.state == IssueState.REVIEW)
    actions.push({ label: "Mark Complete", transition: IssueState.DONE });

  if (issue.state == IssueState.DONE)
    actions.push({
      label: "Un-complete",
      transition: IssueState.IN_PROGRESS,
      className: "bg-gray-500 hover:bg-gray-700",
    });

  useShortcut(["1", "2"], (e) => {
    e.preventDefault();
    const idx = parseInt(e.key) - 1;
    if (actions.length >= idx) transition(actions[idx].transition);
  });

  return (
    <div className="flex gap-4 flex-wrap">
      {actions.map(({ label, transition: state, className, tooltip }, index) => (
        <Button
          key={label}
          className={className}
          data-tooltip-content={
            (tooltip || `Transition to ${stateLabels[state]}`) + ` (${ctrlOrMeta + (index + 1)})`
          }
          data-tooltip-id="tooltip"
          onClick={() => transition(state)}
          disabled={submitting}
        >
          {label}
        </Button>
      ))}

      <div className="flex-1"></div>
      <Button
        className="bg-transparent text-red-700 hover:bg-red-50"
        data-tooltip-content="Delete this issue"
        data-tooltip-id="tooltip"
        onClick={deleteIssue}
      >
        Delete
      </Button>
    </div>
  );
};
