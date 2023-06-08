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
import { WorkspaceProps } from "@/types";
import { useUI } from "@/stores/uiStore";

type Props = WorkspaceProps;

export default function NewWorkspace(props: Props) {
  const { workspaces } = props;

  useUI(props);
  const [error, setError] = useState<string | null>(null);
  const { setSubmitting, SubmitButton } = useSubmitButton();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();

    if (!name) {
      return;
    }
    if (workspaces.find((w) => w.name === name)) {
      setError("A workspace with that name already exists.");
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      await API.workspaces.create({ name });
      router.push("/projects/new");
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
        <title>New Workspace</title>
      </Head>
      <PageLayout title="New Workspace">
        {!workspaces.length && (
          <div className="mb-4 p-4 rounded-md bg-blue-100">
            Welcome! Please create a workspace to get started.
          </div>
        )}

        <div>
          A workspace consists of users and projects. You will probably only need one workspace for
          your entire company.
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col mt-4 gap-2">
          <div>Please name your workspace:</div>
          <TextField name="name" placeholder="My Workspace" required />
          <div className="mt-2">
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <SubmitButton>Create Workspace</SubmitButton>
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
