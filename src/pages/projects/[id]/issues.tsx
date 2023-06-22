import API from "@/client/api";
import IssueList from "@/components/issues/IssueList";
import NewIssueButton from "@/components/issues/NewIssueButton";
import Layout from "@/components/layout/Layout";

import PageLayout from "@/components/layout/PageLayout";
import RefreshButton from "@/components/ui/RefreshButton";
import { loadWorkspaceData } from "@/server/loaders";
import { issueStore } from "@/stores/issueStore";
import { projectStore } from "@/stores/projectStore";
import { useUI } from "@/stores/uiStore";
import { WorkspaceProps } from "@/types";
import { useStore } from "@nanostores/react";
import { GetServerSidePropsContext } from "next";
import { useCallback, useEffect } from "react";

type Props = { id: string } & WorkspaceProps;

export default function Issues(props: Props) {
  useUI(props);

  useEffect(() => {
    projectStore.setActiveProject(props.id);
  }, [props.id]);

  const project = useStore(projectStore.activeProject);

  const refresh = useCallback(async () => {
    issueStore.init();
    const issues = await API.listIssues({
      filter: "project",
      projectId: props.id,
      workspaceId: props.activeWorkspace,
    });
    issueStore.loadIssues(issues);
  }, [props.activeWorkspace, props.id]);

  if (!project) return null;

  const headerButton = (
    <>
      <RefreshButton refresh={refresh} refreshOnLoad />
      <NewIssueButton />
    </>
  );

  return (
    <Layout>
      <PageLayout title={project.name + " Issues"} titleButtons={headerButton}>
        <IssueList />
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
