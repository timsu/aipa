import { GetServerSidePropsContext } from "next";
import Head from "next/head";

import Layout from "@/components/layout/Layout";
import prisma, { serialize } from "@/server/prisma";
import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";

import { useState } from "react";
import { Workspace } from "@prisma/client";
import Button, { ButtonLink } from "@/components/ui/Button";
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

type Props = WorkspaceProps;

export default function Projects(props: Props) {
  const { workspaces, projects } = props;

  const headerButton = <ButtonLink href="/projects/new">New Project</ButtonLink>;

  return (
    <Layout>
      <PageLayout title="Projects" titleButtons={headerButton}>
        Projects here
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
