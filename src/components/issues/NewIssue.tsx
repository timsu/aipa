import { issueStore } from "@/stores/issueStore";
import { ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import TextField from "../inputs/TextField";
import { useStore } from "@nanostores/react";
import { projectStore } from "@/stores/projectStore";
import ProjectBadge from "../projects/ProjectBadge";
import EditorContainer from "../editor/EditorContainer";
import Button from "../ui/Button";
import { IssueTYPE, IssueType } from "@/types";
import {
  BeakerIcon,
  BugAntIcon,
  CodeBracketSquareIcon,
  IdentificationIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { classNames } from "@/lib/utils";

export default function NewIssue() {
  const project = useStore(projectStore.activeProject)!;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

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
  const [issueType, setIssueType] = useState<IssueType>(types[0]);

  return (
    <div>
      <div className="flex items-center">
        <ProjectBadge project={project} />
        <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
        <h2 className="font-bold text-xl flex-1">New Issue</h2>

        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => issueStore.closeIssuePanel()}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-wrap justify-between items-center">
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
            className="text-lg border-gray-300"
            placeholder={issueTypes[issueType].label + " Title"}
          />
        </div>

        <EditorContainer
          className="h-64 rounded-md border border-gray-300 p-2"
          placeholder="Issue Description"
        />

        <div className="flex gap-4">
          <Button
            className="bg-gray-500 hover:bg-gray-700"
            data-tooltip-content="In a hurry? Create a draft issue and complete it later."
            data-tooltip-id="tooltip"
          >
            Save Draft
          </Button>
          <Button data-tooltip-content="Validate and create your issue" data-tooltip-id="tooltip">
            Create Issue
          </Button>
        </div>
      </form>
    </div>
  );
}
