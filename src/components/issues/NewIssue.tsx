import { ActiveIssue, isIssue, issueStore } from "@/stores/issueStore";
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
import { IssueTypeButton, ISSUE_TYPES } from "./IssueTypeButton";
import Checkbox from "@/components/inputs/Checkbox";
import ProjectPicker from "@/components/projects/ProjectPicker";
import useShortcut, { ctrlOrMeta } from "@/components/hooks/useShortcut";
import { messageStore } from "@/stores/messageStore";
import { SidebarButton } from "@/components/layout/PageLayout";

export default function NewIssue({ draftIssue }: { draftIssue: ActiveIssue }) {
  const project = useStore(projectStore.activeProject)!;
  const formRef = useRef<HTMLFormElement>(null);
  const [savedIssue, setSavedIssue] = useState<Issue | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [transitionSuccess, setTransitionSuccess] = useState<boolean | undefined>();
  const createAnother = useStore(issueStore.createAnother);
  const titleRef = useRef<HTMLInputElement>(null);

  const [issueType, setIssueType] = useState<IssueType>(ISSUE_TYPES[0]);

  useEffect(() => {
    if (titleRef.current) titleRef.current.value = draftIssue.title || "";
    setIssueType((draftIssue.type as IssueType) || ISSUE_TYPES[0]);
    setSavedIssue(draftIssue.id ? draftIssue : undefined);
    editorStore.editor?.commands.setContent((draftIssue.description as Doc) || "");
  }, [draftIssue]);

  const getIssueData = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
    const description = editorStore.getDoc();
    const type = issueType;
    const title = titleRef.current?.value;

    const issue: Partial<Issue> = { title, description, type };
    return issue;
  }, [issueType]);

  const saveDraft = useCallback(
    async (partOfCreateIssue: boolean) => {
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
        if (!partOfCreateIssue && createAnother) issueStore.newIssue();
        return updatedIssue;
      } catch (e) {
        setError(unwrapError(e));
      } finally {
        setSubmitting(false);
      }
      return false;
    },
    [getIssueData, project, savedIssue, createAnother]
  );

  const createIssue = useCallback(
    async (override?: boolean) => {
      const issueData = getIssueData();
      let issue: Issue | false | undefined = savedIssue;
      if (draftIssue.dryRun) {
        issue = issueData as Issue;
      } else if (
        !savedIssue ||
        Object.keys(issueData).find(
          (key) => !deepEqual((savedIssue as any)[key], (issueData as any)[key])
        )
      ) {
        issue = await saveDraft(true);
      }

      if (!issue) return;

      setSubmitting(true);
      setSuccessMessage(null);
      setError(null);
      setTransitionSuccess(undefined);
      try {
        if (draftIssue.dryRun) {
          await draftIssue.dryRun(issue);
        } else {
          const result = await issueStore.transitionIssue(issue, IssueState.BACKLOG, override);
          setTransitionSuccess(result);
          if (createAnother) {
            issueStore.newIssue();
            messageStore.addMessage({
              role: "system",
              content: "Issue created: " + issue.identifier,
              createdAt: new Date(),
            });
          }
        }
      } catch (e) {
        setError(unwrapError(e));
      } finally {
        setSubmitting(false);
      }
    },
    [getIssueData, saveDraft, savedIssue, draftIssue, createAnother]
  );

  const deleteIssue = async () => {
    if (!savedIssue) return;
    setError(null);
    setSubmitting(true);
    try {
      await issueStore.deleteIssue(savedIssue);
    } catch (e) {
      setError(unwrapError(e));
    } finally {
      setSubmitting(false);
    }
  };

  useShortcut(["s", "Enter"], (e) => {
    if (e.key === "Enter") {
      createIssue();
    } else if (e.key == "s") {
      saveDraft(false);
    }
  });

  return (
    <div>
      <div className="flex items-center">
        <SidebarButton />
        <ProjectPicker project={project} />
        <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
        <h2 className="font-bold text-xl flex-1">
          {draftIssue.dryRun
            ? "Testing rules"
            : savedIssue
            ? `#${savedIssue.identifier} (draft)`
            : "New Issue"}
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
            ref={titleRef}
            className="text-lg border-gray-300"
            placeholder={titleCase(issueType) + " Title"}
          />
        </div>

        <EditorContainer
          className="h-64 rounded-md border border-gray-300 p-2 overflow-auto"
          placeholder="Issue Description"
          content={draftIssue?.description as Doc}
        />

        <div className="flex flex-wrap gap-4 items-center">
          {draftIssue.dryRun ? (
            <Button
              data-tooltip-content={`Test issue creation rules (${ctrlOrMeta}⏎)`}
              data-tooltip-id="tooltip"
              onClick={() => createIssue()}
              disabled={submitting}
            >
              Dry Run
            </Button>
          ) : (
            <>
              <Button
                className="bg-gray-500 hover:bg-gray-700"
                data-tooltip-content={`In a hurry? Create a draft issue and complete it later. (${ctrlOrMeta}S)`}
                data-tooltip-id="tooltip"
                onClick={() => saveDraft(false)}
                disabled={submitting}
              >
                Save Draft
              </Button>
              <Button
                data-tooltip-content={`Validate and create your issue (${ctrlOrMeta}⏎)`}
                data-tooltip-id="tooltip"
                onClick={() => createIssue()}
                disabled={submitting}
              >
                Create Issue
              </Button>
              <Checkbox
                id="createAnother"
                checked={createAnother}
                onChange={(e) => issueStore.createAnother.set(e.target.checked)}
                label="Create another?"
              />
              <div className="flex-1"></div>
              {savedIssue && (
                <Button className="bg-red-700 hover:bg-red-900" onClick={deleteIssue}>
                  Discard Draft
                </Button>
              )}
            </>
          )}
        </div>

        {successMessage && <div className="text-green-500">{successMessage}</div>}
        {error && <div className="text-red-500">{error}</div>}
      </form>

      {savedIssue && <Messages issue={savedIssue} />}

      {transitionSuccess == false && (
        <div
          className="mt-4 cursor-pointer text-sm text-blue hover:underline"
          onClick={() => createIssue(true)}
        >
          Force-create issue?
        </div>
      )}
    </div>
  );
}
