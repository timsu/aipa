import { issueStore } from "@/stores/issueStore";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import TextField from "../inputs/TextField";
import { useStore } from "@nanostores/react";
import { projectStore } from "@/stores/projectStore";
import ProjectBadge from "../projects/ProjectBadge";
import EditorContainer from "../editor/EditorContainer";
import Button from "../ui/Button";
import { IssueType } from "@/types";

import { useCallback, useEffect, useState } from "react";
import { titleCase, unwrapError } from "@/lib/utils";
import { Issue } from "@prisma/client";
import { editorStore } from "@/stores/editorStore";
import API from "@/client/api";
import { Doc } from "../editor/Doc";
import { Messages } from "../messages/Messages";
import { IssueTypeButton, ISSUE_TYPES } from "./IssueTypeButton";

export default function EditIssue({ issue }: { issue: Issue }) {
  const project = useStore(projectStore.activeProject)!;
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [issueType, setIssueType] = useState<IssueType>(ISSUE_TYPES[0]);

  useEffect(() => {
    setTitle(issue.title);
    setIssueType(issue.type as IssueType);
    editorStore.editor?.commands.setContent((issue?.description as Doc) || "");
  }, [issue]);

  const getIssueData = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
    const description = editorStore.getDoc();
    const type = issueType;

    const issue: Partial<Issue> = { title, description, type };
    return issue;
  }, [title, issueType]);

  const save = useCallback(async () => {
    setSubmitting(true);
    const issueData = getIssueData();
    try {
      const updatedIssue = await API.issues.update(issue.projectId!, issue.id, issueData);
      setSuccessMessage("Saved.");
      issueStore.editingIssue.set(false);
      issueStore.issueUpdated(updatedIssue);
      return updatedIssue;
    } catch (e) {
      setError(unwrapError(e));
    } finally {
      setSubmitting(false);
    }
    return false;
  }, [getIssueData, project, issue]);

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
    <div>
      <div className="flex items-center">
        <ProjectBadge project={project} />
        <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
        <h2 className="text-xl flex-1">{issue.identifier}</h2>

        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => issueStore.editingIssue.set(false)}
          data-tooltip-content="Cancel Editing"
          data-tooltip-id="tooltip"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap gap-1 sm:gap-2 xl:gap-3 items-center">
          <div>Issue Type:</div>

          {ISSUE_TYPES.map((type) => (
            <IssueTypeButton
              key={type}
              type={type}
              selected={issueType === type}
              onClick={() => setIssueType(type)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <TextField
            name="title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg border-gray-300"
            placeholder={titleCase(issueType) + " Title"}
          />
        </div>

        <EditorContainer
          className="h-64 rounded-md border border-gray-300 p-2"
          placeholder="Issue Description"
          content={issue?.description as Doc}
        />

        <div className="flex gap-4">
          <Button
            className="bg-red-700 hover:bg-red-900"
            onClick={() => issueStore.editingIssue.set(false)}
          >
            Cancel Editing
          </Button>
          <div className="flex-1"></div>

          <Button onClick={save} disabled={submitting}>
            Save (⌘S)
          </Button>
        </div>
        {successMessage && <div className="text-green-500">{successMessage}</div>}
        {error && <div className="text-red-500">{error}</div>}
      </form>

      <Messages />
    </div>
  );
}
