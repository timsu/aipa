import { GetServerSidePropsContext } from "next";
import Head from "next/head";

import Layout from "@/components/layout/Layout";
import prisma, { serialize } from "@/server/prisma";
import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Workspace } from "@prisma/client";
import Button from "@/components/ui/Button";
import PageLayout from "@/components/layout/PageLayout";
import TextField from "@/components/inputs/TextField";
import API from "@/client/api";
import useSubmitButton from "@/components/hooks/useSubmitButton";
import { useRouter } from "next/router";
import { loadWorkspaceData } from "@/server/loaders";
import {
  IssueState,
  IssueType,
  ProjectVisibility,
  ValidationRules,
  ValidationRuleset,
  WorkspaceProps,
  stateLabels,
} from "@/types";
import { useUI } from "@/stores/uiStore";
import { workspaceStore } from "@/stores/workspaceStore";
import Checkbox from "@/components/inputs/Checkbox";
import { ISSUE_TYPES } from "@/components/issues/IssueTypeButton";
import IssueTypeIcon from "@/components/issues/IssueTypeIcon";
import { titleCase } from "@/lib/utils";
import { issueStore } from "@/stores/issueStore";
import useUnsavedChanges from "@/components/hooks/useUnsavedChanges";
import { toast } from "react-toastify";

type Props = {
  id: string;
} & WorkspaceProps;

const IssueTypePlaceholders = {
  [IssueType.STORY]: "e.g. be in the format 'As [persona], I want to [action] so that [goal].'",
  [IssueType.BUG]:
    "e.g. include reproduction steps, expected behavior, actual behavior, screenshots, etc.",
  [IssueType.TASK]: "e.g. include a short description of the task",
  [IssueType.EXPRIMENT]: "e.g. include a hypothesis & and experiment owner, or link to a doc",
};

const IssueStatePlaceholders = {
  [IssueState.TODO]: "e.g. issues must have a description",
  [IssueState.IN_PROGRESS]: "e.g. issues must have an assignee",
  [IssueState.REVIEW]: "e.g. indicate how to test this issue",
  [IssueState.DONE]: "e.g. ask about tests & mobile support",
};

export default function Project({ id, ...props }: Props) {
  const [dirty, setDirty] = useUnsavedChanges();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { SubmitButton, setSubmitting } = useSubmitButton("Saving...");

  useUI(props);

  useEffect(() => {
    issueStore.closeIssuePanel();
  }, []);

  const project = props.projects.find((p) => p.id === id);

  useEffect(() => {
    if (!project) return;
    API.getValidations(project).then((validations) => {
      if (!validations?.rules) return;
      const form = formRef.current!;

      const rules = validations.rules as { [key: string]: string };
      for (const key of Object.keys(rules)) {
        const value = rules[key];
        if ((form.elements as any)[key]) (form.elements as any)[key].value = value;
      }
    });
  }, [project]);

  if (!project) {
    return "Not found";
  }

  const getFormData = () => {
    const form = formRef.current!;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    const rules: ValidationRuleset = {};
    for (const key of Object.keys(body)) {
      let value = body[key];
      if (typeof value === "string") {
        value = value.trim();
        if (value) rules[key] = value;
      }
    }
    return rules;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updates = getFormData();

    try {
      setSubmitting(true);
      await API.saveValidations(project, updates);
      setDirty(false);
      setSuccessMessage("Saved!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save validations");
    } finally {
      setSubmitting(false);
    }
  };

  const testCreateIssue = () =>
    issueStore.activeIssue.get()?.id
      ? issueStore.closeIssuePanel()
      : issueStore.dryRunIssue({}, async (issue) => {
          const formData = getFormData();
          console.log("dry running");
          await issueStore.transitionIssue(
            { ...issue, state: IssueState.DRAFT },
            IssueState.BACKLOG,
            false,
            formData
          );
          console.log("validating", issue, formData);
        });

  return (
    <Layout>
      <Head>
        <title>{project.name}</title>
      </Head>
      <PageLayout title={project.name} fullSize>
        <form onSubmit={handleSubmit} ref={formRef}>
          <h2 className="font-semibold text-xl mb-4">Your Issue States</h2>

          <ol className="flex flex-col gap-4 whitespace-pre-wrap list-decimal ml-4">
            <li className="list-item">
              <b>Backlog</b>- where unprioritized issues go
            </li>
            <li className="list-item">
              <b>To Do</b>- issues selected to be worked on
            </li>
            <li className="list-item">
              <b>In Progress</b>- issues actively being worked on
            </li>
            <li className="list-item4">
              <b>Review</b>- validation after issue work is completed
            </li>
            <li className="list-item">
              <b>Done</b>- issues that are completed and validated
            </li>
            <li className="list-item">
              <b>Won&apos;t Fix</b>- issues that are closed without being completed
            </li>
          </ol>

          {/* <Checkbox
          id="transitionStates"
          label="Enable transition states (pull-based workflow)"
          description="- create additional states between each state (e.g. Ready for Progress, Ready for Review)"
        /> */}

          <h2 className="font-semibold text-xl mt-8 mb-4">Validation Rules</h2>

          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-lg">Creating issues</h3>
            <hr />
            <div className="flex gap-4 flex-wrap">
              <div className="flex-[4]">
                <div>Criteria for all issues:</div>
                <textarea
                  name={ValidationRules.CREATE}
                  className="w-full mt-2 h-14 rounded-md p-2 border-gray-300"
                  placeholder="e.g. issues must have good spelling and grammar, and a clear title."
                  onChange={() => setDirty(true)}
                />
                <div>Additional criteria for each issue type:</div>
                {ISSUE_TYPES.map((type) => (
                  <div className="flex gap-4 items-center my-2" key={type}>
                    <IssueTypeIcon type={type} />
                    <div className="w-20">{titleCase(type)}</div>
                    <TextField
                      name={ValidationRules.CREATE + "-" + type}
                      className="p-1 flex-1 border-gray-300"
                      placeholder={IssueTypePlaceholders[type]}
                      onChange={() => setDirty(true)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-[250px]">
                <ul className="list-disc ml-4 mb-2 space-y-4">
                  <li>Data available: issue title, description, type, and creator</li>
                  <li>
                    Clarify what is a requirement (e.g. issues MUST have...) or a suggestion. The
                    system will be more flexible with suggestions than rules.
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-blue-500 hover:underline cursor-pointer" onClick={testCreateIssue}>
              Test validation rules
            </div>

            <h3 className="font-medium text-lg mt-8">Work in progress limits</h3>
            <hr />
            <div className="flex gap-4">
              <div className="flex-[4]">
                <textarea
                  name={ValidationRules.WIP}
                  className="w-full h-14 rounded-md p-2 border-gray-300"
                  placeholder="e.g. Allow no more than one in-progress story per person. any number of bugs is ok."
                  onChange={() => setDirty(true)}
                />
              </div>
              <div className="flex-1 min-w-[250px]">
                <ul className="list-disc ml-4 mb-2 space-y-4">
                  <li>Data available: issue details, all issues currently in progress</li>
                </ul>
              </div>
            </div>

            <h3 className="font-medium text-lg mt-8">Assigning & transitioning issues</h3>
            <hr />
            <div className="flex gap-4">
              <div className="flex-[4]">
                <div>When assigning an issue:</div>
                <textarea
                  name={ValidationRules.ASSIGN}
                  className="w-full mt-2 h-14 rounded-md p-2 border-gray-300"
                  placeholder="e.g. a message must be written to the assignee indicating what should be done"
                  onChange={() => setDirty(true)}
                />

                <div>Additional criteria for transition to:</div>
                {[IssueState.TODO, IssueState.IN_PROGRESS, IssueState.REVIEW, IssueState.DONE].map(
                  (state) => (
                    <div className="flex gap-4 items-center my-2" key={state}>
                      <div className="w-20">{stateLabels[state]}</div>
                      <TextField
                        name={ValidationRules.TRANSITION + "-" + state}
                        className="p-1 flex-1 border-gray-300"
                        placeholder={
                          IssueStatePlaceholders[state as keyof typeof IssueStatePlaceholders]
                        }
                        onChange={() => setDirty(true)}
                      />
                    </div>
                  )
                )}
              </div>

              <div className="flex-1 min-w-[250px]">
                <ul className="list-disc ml-4 mb-2 space-y-4">
                  <li>
                    Data available: issue title, description, type, creator, assignee, current state
                  </li>
                  <li>
                    If you specify rules for transitions and assignments, a conversation with the
                    assistant may be required in order for users to proceed with their action.
                  </li>
                  <li>
                    Clarify what is a question (e.g. ask about mobile support) vs a requirement
                    (e.g. MUST support mobile)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 h-56">
            <SubmitButton type="submit">Save</SubmitButton>
            {successMessage && <div className="text-green-500 mt-4">{successMessage}</div>}
          </div>
        </form>
      </PageLayout>
    </Layout>
  );
}
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { session, redirect, ...props } = await loadWorkspaceData(context);
  if (redirect) return redirect;

  const id = context.query.id as string;
  if (!props.projects.find((p) => p.id === id)) {
    return {
      redirect: {
        destination: "/projects",
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(props as Props),
      id,
    },
  };
};
