import useSubmitButton from "@/components/hooks/useSubmitButton";
import TextField from "@/components/inputs/TextField";
import Layout from "@/components/layout/Layout";

import PageLayout from "@/components/layout/PageLayout";
import ColorPicker from "@/components/projects/ColorPicker";
import { loadWorkspaceData } from "@/server/loaders";
import { projectStore } from "@/stores/projectStore";
import { useUI } from "@/stores/uiStore";
import { WorkspaceProps } from "@/types";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useState } from "react";

type Props = { id: string } & WorkspaceProps;

export default function ProjectSettings(props: Props) {
  const { id, projects } = props;
  const project = projects.find((p) => p.id === id) || projects[0];

  const [name, _setName] = useState(project.name);
  const [code, setCode] = useState(project.shortcode);
  const [color, setColor] = useState(project.color);

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

    try {
      setError(null);
      setSubmitting(true);
      await projectStore.updateProject(project, {
        name,
        shortcode: code,
        color,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <PageLayout title={project.name + " Settings"}>
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

          <div>Color theme:</div>
          <ColorPicker color={color} setColor={setColor} />

          <div className="mt-2">
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <SubmitButton style={{ backgroundColor: `#${color}` }}>Save</SubmitButton>
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
