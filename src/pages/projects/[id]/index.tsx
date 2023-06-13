import { GetServerSidePropsContext } from "next";
import Head from "next/head";

import Layout from "@/components/layout/Layout";
import prisma, { serialize } from "@/server/prisma";
import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";

import { useState } from "react";
import { Workspace } from "@prisma/client";
import Button from "@/components/ui/Button";
import PageLayout from "@/components/layout/PageLayout";
import TextField from "@/components/inputs/TextField";
import API from "@/client/api";
import useSubmitButton from "@/components/hooks/useSubmitButton";
import { useRouter } from "next/router";
import { loadWorkspaceData } from "@/server/loaders";
import { IssueState, ProjectVisibility, WorkspaceProps } from "@/types";
import { useUI } from "@/stores/uiStore";
import { workspaceStore } from "@/stores/workspaceStore";
import Checkbox from "@/components/inputs/Checkbox";
import { ISSUE_TYPES } from "@/components/issues/IssueTypeButton";
import IssueTypeIcon from "@/components/issues/IssueTypeIcon";
import { titleCase } from "@/lib/utils";

type Props = {
  id: string;
} & WorkspaceProps;

export default function Project({ id, ...props }: Props) {
  useUI(props);

  const project = props.projects.find((p) => p.id === id);
  if (!project) {
    return "Not found";
  }

  return (
    <Layout>
      <Head>
        <title>{project.name}</title>
      </Head>
      <PageLayout title={project.name} fullSize>
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
        </ol>

        <h2 className="font-semibold text-xl mt-8 mb-4">Validation Rules</h2>

        <div className="flex flex-col gap-4">
          <h3 className="font-medium text-lg">Creating issues</h3>
          <hr />
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1">
              <div>General criteria</div>
              <textarea className="w-full h-24 rounded-md p-2 border-gray-300">
                issues must have good spelling and grammar. titles generally must be at least 3
                words.
              </textarea>
              <div>Additional criteria for:</div>
              {ISSUE_TYPES.map((type) => (
                <div className="flex gap-4 items-center my-2" key={type}>
                  <IssueTypeIcon type={type} />
                  <div className="w-20">{titleCase(type)}</div>
                  <TextField
                    className="p-1 flex-1 border-gray-300"
                    placeholder={`Criteria for ${type}s`}
                  />
                </div>
              ))}
            </div>
            <div className="w-56 xl:w-72">
              <div className="font-bold">Tips:</div>
              <ul className="list-disc ml-4 mb-2 space-y-4">
                <li>Data available: issue title, description, type, and creator</li>
                <li>
                  Distinguish between requirements (e.g. issues MUST have...) and suggestions. The
                  system will be more flexible with suggestions than rules.
                </li>
              </ul>
            </div>
          </div>

          <h3 className="font-medium text-lg mt-8">Work in progress</h3>
          <hr />
          <div className="flex gap-4">
            <div className="flex-1">
              <div>General criteria</div>
              <textarea className="w-full h-24 rounded-md p-2 border-gray-300">
                allow no more than one in-progress story per person. any number of bugs is ok.
              </textarea>
            </div>
            <div className="w-56 xl:w-72">
              <div className="font-bold">Tips:</div>
              <ul className="list-disc ml-4 mb-2 space-y-4">
                <li>Data available: current tickets on the board, issue details</li>
              </ul>
            </div>
          </div>

          <h3 className="font-medium text-lg mt-8">Assigning & transitioning issues</h3>
          <hr />
          <div className="flex gap-4">
            <div className="flex-1">
              <div>In general When assigning an issue:</div>
              <textarea className="w-full h-24 rounded-md p-2 border-gray-300">
                a message must be written to the assignee indicating what should be done
              </textarea>
              <div>When transitioning to &quot;in review&quot;:</div>
              <textarea
                className="w-full h-24 rounded-md p-2 border-gray-300"
                placeholder="No rule specified"
              />
            </div>
            <div className="w-56 xl:w-72">
              <div className="font-bold">Tips:</div>
              <ul className="list-disc ml-4 mb-2 space-y-4">
                <li>Data available: issue title, description, type, creator, assignee</li>
                <li>
                  If you specify rules for transitions, a conversation with the assistant will be
                  required.
                </li>
              </ul>
            </div>
          </div>
        </div>
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
