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
import ColorPicker, { randomColor } from "@/components/projects/ColorPicker";
import { projectStore } from "@/stores/projectStore";
import Select from "@/components/inputs/Select";
import useUnsavedChanges from "@/components/hooks/useUnsavedChanges";

type Props = WorkspaceProps;

export default function NewProject(props: Props) {
  const { workspaces, projects } = props;
  const [name, _setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(randomColor());

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

    const visibility: ProjectVisibility = ProjectVisibility.ALL;
    const workspaceId = workspaceStore.activeWorkspace.get()?.id;

    try {
      setError(null);
      setSubmitting(true);
      const project = await projectStore.createProject({
        name,
        shortcode: code,
        visibility,
        color,
        workspaceId,
      });
      router.push("/projects/" + project.id);
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message);
      return;
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
            placeholder="e.g. ENG"
            className="w-56"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().substring(0, 5))}
          />

          <div>Sync with:</div>
          <Select className="border w-56">
            <option>None</option>
            <option>Jira (coming soon)</option>
            <option>Trello (coming soon)</option>
            <option>Linear (coming soon)</option>
            <option>GitHub Issues (coming soon)</option>
          </Select>

          <div>Color theme:</div>
          <ColorPicker color={color} setColor={setColor} />

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
