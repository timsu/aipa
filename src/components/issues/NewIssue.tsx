import { isIssue, issueStore } from "@/stores/issueStore";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import TextField from "../inputs/TextField";
import { useStore } from "@nanostores/react";
import { projectStore } from "@/stores/projectStore";
import ProjectBadge from "../projects/ProjectBadge";
import EditorContainer from "../editor/EditorContainer";
import Button from "../ui/Button";
import { IssueState, IssueType } from "@/types";

import { useCallback, useEffect, useRef, useState } from "react";
import { classNames, titleCase, unwrapError } from "@/lib/utils";
import { Issue } from "@prisma/client";
import { editorStore } from "@/stores/editorStore";
import API from "@/client/api";
import { Doc } from "../editor/Doc";
import { deepEqual } from "fast-equals";
import { useRouter } from "next/router";
import { Messages } from "../messages/Messages";
import { IssueTypeButton, types } from "./IssueTypeButton";

export default function NewIssue({ draftIssue }: { draftIssue?: Issue }) {
  const project = useStore(projectStore.activeProject)!;
  const formRef = useRef<HTMLFormElement>(null);
  const [savedIssue, setSavedIssue] = useState<Issue | undefined>(draftIssue);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");

  const [issueType, setIssueType] = useState<IssueType>(types[0]);

  useEffect(() => {
    setTitle(draftIssue?.title || "");
    setIssueType((draftIssue?.type as IssueType) || types[0]);
    setSavedIssue(draftIssue);
    editorStore.editor?.commands.setContent((draftIssue?.description as Doc) || "");
  }, [draftIssue]);

  const getIssueData = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
    const description = editorStore.getDoc();
    const type = issueType;

    const issue: Partial<Issue> = { title, description, type };
    return issue;
  }, [title, issueType]);

  const saveDraft = useCallback(async () => {
    setSubmitting(true);
    const issue = getIssueData();
    try {
      let updatedIssue: Issue;
      if (savedIssue) {
        updatedIssue = await API.issues.update(savedIssue.projectId!, savedIssue.id, issue);
        issueStore.issueUpdated(updatedIssue);
      } else {
        issue.state = IssueState.DRAFT;
        updatedIssue = await API.issues.create(project, issue);
      }
      setSuccessMessage("Draft saved.");
      setSavedIssue(updatedIssue);
      return updatedIssue;
    } catch (e) {
      setError(unwrapError(e));
    } finally {
      setSubmitting(false);
    }
    return false;
  }, [getIssueData, project, savedIssue]);

  const createIssue = useCallback(async () => {
    const issueData = getIssueData();
    let issue: Issue | false | undefined = savedIssue;
    if (
      !savedIssue ||
      Object.keys(issueData).find(
        (key) => !deepEqual((savedIssue as any)[key], (issueData as any)[key])
      )
    ) {
      issue = await saveDraft();
    }

    if (!issue) return;

    setSubmitting(true);
    setSuccessMessage(null);
    setError(null);
    try {
      await issueStore.transitionIssue(issue, IssueState.BACKLOG);
    } catch (e) {
      setError(unwrapError(e));
    } finally {
      setSubmitting(false);
    }
  }, [getIssueData, saveDraft, savedIssue]);

  const router = useRouter();

  const deleteIssue = async () => {
    if (!savedIssue) return;
    setError(null);
    setSubmitting(true);
    try {
      await API.issues.update(savedIssue.projectId!, savedIssue.id, { deletedAt: new Date() });
      issueStore.closeIssuePanel();
      // reload whatever view we're on
      router.replace(router.asPath);
    } catch (e) {
      setError(unwrapError(e));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.metaKey) {
        e.preventDefault();
        createIssue();
      } else if (e.key == "s" && e.metaKey) {
        e.preventDefault();
        saveDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [createIssue, saveDraft]);

  return (
    <div>
      <div className="flex items-center">
        <ProjectBadge project={project} />
        <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
        <h2 className="font-bold text-xl flex-1">
          {savedIssue ? `#${savedIssue.identifier} (draft)` : "New Issue"}
        </h2>

        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => issueStore.closeIssuePanel()}
          data-tooltip-content="Close"
          data-tooltip-id="tooltip"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form ref={formRef} className="mt-4 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap gap-1 sm:gap-2 xl:gap-3 items-center">
          <div>Issue Type:</div>

          {types.map((type) => (
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
          content={draftIssue?.description as Doc}
        />

        <div className="flex gap-4">
          <Button
            className="bg-gray-500 hover:bg-gray-700"
            data-tooltip-content="In a hurry? Create a draft issue and complete it later."
            data-tooltip-id="tooltip"
            onClick={saveDraft}
            disabled={submitting}
          >
            Save Draft (⌘S)
          </Button>
          <Button
            data-tooltip-content="Validate and create your issue"
            data-tooltip-id="tooltip"
            onClick={createIssue}
            disabled={submitting}
          >
            Create Issue (⌘⏎)
          </Button>
          <div className="flex-1"></div>
          {savedIssue && (
            <Button className="bg-red-700 hover:bg-red-900" onClick={deleteIssue}>
              Discard Draft
            </Button>
          )}
        </div>

        {successMessage && <div className="text-green-500">{successMessage}</div>}
        {error && <div className="text-red-500">{error}</div>}
      </form>

      {savedIssue && <Messages />}
    </div>
  );
}
