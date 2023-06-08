import { isIssue, issueStore } from "@/stores/issueStore";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import TextField from "../inputs/TextField";
import { useStore } from "@nanostores/react";
import { projectStore } from "@/stores/projectStore";
import ProjectBadge from "../projects/ProjectBadge";
import EditorContainer from "../editor/EditorContainer";
import Button from "../ui/Button";
import { IssueState, IssueType } from "@/types";
import {
  BeakerIcon,
  BugAntIcon,
  CodeBracketSquareIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { classNames, unwrapError } from "@/lib/utils";
import { Issue } from "@prisma/client";
import { editorStore } from "@/stores/editorStore";
import API from "@/client/api";
import { Doc } from "../editor/Doc";
import { deepEqual } from "fast-equals";
import { useRouter } from "next/router";
import { Messages } from "../messages/Messages";

const issueTypes = {
  [IssueType.STORY]: {
    label: "Story",
    icon: <IdentificationIcon className="w-6 h-6 text-green-600" />,
  },
  [IssueType.BUG]: { label: "Bug", icon: <BugAntIcon className="w-6 h-6 text-red-600" /> },
  [IssueType.TASK]: {
    label: "Task",
    icon: <CodeBracketSquareIcon className="w-6 h-6 text-blue-400" />,
  },
  [IssueType.EXPRIMENT]: {
    label: "Experiment",
    icon: <BeakerIcon className="w-6 h-6 text-purple-600" />,
  },
};
const types = Object.keys(issueTypes) as IssueType[];

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
  }, [draftIssue]);

  const getIssueData = () => {
    setError(null);
    setSuccessMessage(null);
    const description = editorStore.getDoc();
    const type = issueType;

    const issue: Partial<Issue> = { title, description, type };
    return issue;
  };

  const saveDraft = async () => {
    setSubmitting(true);
    const issue = getIssueData();
    issue.state = IssueState.DRAFT;
    try {
      let updatedIssue: Issue;
      if (savedIssue) {
        updatedIssue = await API.issues.update(savedIssue.projectId!, savedIssue.id, issue);
      } else {
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
  };

  const createIssue = async () => {
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
  };

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

  return (
    <div>
      <div className="flex items-center">
        <ProjectBadge project={project} />
        <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
        <h2 className="font-bold text-xl flex-1">
          {savedIssue ? `#${savedIssue.number} (draft)` : "New Issue"}
        </h2>

        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => issueStore.closeIssuePanel()}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form ref={formRef} className="mt-4 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-wrap gap-4 items-center">
          <div>Issue Type:</div>

          {types.map((type) => (
            <button
              key={type}
              className={classNames(
                "text-sm flex gap-1 items-center hover:bg-blue-200 text-gray-700 rounded-md py-1 px-2 border",
                issueType === type ? "bg-blue-100 border-blue-500" : "bg-gray-100 border-gray-500"
              )}
              onClick={() => setIssueType(type)}
            >
              {issueTypes[type].icon}
              <span>{issueTypes[type].label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <TextField
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg border-gray-300"
            placeholder={issueTypes[issueType].label + " Title"}
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
            Save Draft
          </Button>
          <Button
            data-tooltip-content="Validate and create your issue"
            data-tooltip-id="tooltip"
            onClick={createIssue}
            disabled={submitting}
          >
            Create Issue
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
