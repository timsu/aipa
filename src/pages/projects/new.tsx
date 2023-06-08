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
import { ProjectVisibility, WorkspaceProps } from "@/types";
import { useUI } from "@/stores/uiStore";
import { workspaceStore } from "@/stores/workspaceStore";

type Props = WorkspaceProps;

const COLOR_OPTIONS = [
  "e0953f",
  "d34a2d",
  "c4272e",
  "c7295f",
  "ce00f1",
  "4a5ed4",
  "6275f6",
  "64a9f8",
  "6ebed7",
  "589686",
  "67b057",
  "5e9a3b",
  "696773",
  "212121",
];

export default function NewProject(props: Props) {
  const { workspaces, projects } = props;
  const [name, _setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(
    COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]
  );

  const setName = (name: string) => {
    _setName(name);
    const code =
      name.indexOf(" ") > -1
        ? name
            .split(" ")
            .map((w) => w[0])
            .join("")
        : name.substring(0, 3);
    setCode(code.toUpperCase());
  };

  useUI(props);
  const [error, setError] = useState<string | null>(null);
  const { setSubmitting, SubmitButton } = useSubmitButton();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name) {
      return;
    }
    if (projects.find((p) => p.name === name || p.shortcode === code)) {
      setError("A project with that name or code already exists.");
      return;
    }

    const visibility: ProjectVisibility =
      projects.length >= 5 ? ProjectVisibility.MEMBERS : ProjectVisibility.ALL;
    const workspaceId = workspaceStore.activeWorkspace.get()?.id;

    try {
      setError(null);
      setSubmitting(true);
      await API.projects.create({ name, shortcode: code, visibility, color, workspaceId });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      return;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>New Project</title>
      </Head>
      <PageLayout title="New Project">
        {workspaces.length == 1 && !projects.length && (
          <div className="mb-4 p-4 rounded-md bg-blue-100">
            Fantastic! Now create or sync a project.
          </div>
        )}

        <div>
          A project consists of issues & the settings around them. Use projects to organize your
          teams and workflows.
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col mt-4 gap-2">
          <div>Please name your project:</div>
          <TextField
            name="projectName"
            placeholder="My Project"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>Project key: (used for issue ids)</div>
          <TextField
            name="shortcode"
            placeholder="PRJ"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <div>Color theme:</div>
          <div className="flex flex-wrap gap-2 items-center">
            {COLOR_OPTIONS.map((c) => (
              <div
                key={c}
                onClick={() => setColor(c)}
                className={`p-[1px] rounded-lg cursor-pointer border-2 ${
                  c === color ? " border-black" : "border-transparent"
                }`}
              >
                <div className="w-8 h-8 rounded-md" style={{ backgroundColor: `#${c}` }} />
              </div>
            ))}
          </div>

          <div className="mt-2">
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <SubmitButton style={{ backgroundColor: `#${color}` }}>Create Project</SubmitButton>
          </div>
        </form>
      </PageLayout>
    </Layout>
  );
}
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { session, redirect, ...props } = await loadWorkspaceData(context);
  if (redirect) return redirect;

  return {
    props: props as Props,
  };
};
