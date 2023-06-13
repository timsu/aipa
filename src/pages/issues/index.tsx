import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";
import API from "@/client/api";
import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";

import { useCallback, useEffect } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { logger } from "@/lib/logger";
import Button from "@/components/ui/Button";
import { WorkspaceProps } from "@/types";
import { loadWorkspaceData } from "@/server/loaders";
import { useUI } from "@/stores/uiStore";
import PageLayout from "@/components/layout/PageLayout";
import { issueStore } from "@/stores/issueStore";
import NewIssueButton from "@/components/issues/NewIssueButton";
import RefreshButton from "@/components/ui/RefreshButton";

import IssueList from "@/components/issues/IssueList";

type Props = {} & WorkspaceProps;

export default function IssuesScreen({ ...props }: Props) {
  useUI(props);

  const refresh = useCallback(async () => {
    const issues = await API.listIssues({ filter: "all", workspaceId: props.activeWorkspace });
    issueStore.loadIssues(issues);
  }, [props.activeWorkspace]);

  const headerButton = (
    <>
      <RefreshButton refresh={refresh} refreshOnLoad />
      <NewIssueButton />
    </>
  );

  return (
    <Layout>
      <PageLayout title="All Issues" titleButtons={headerButton}>
        <IssuesMain />
      </PageLayout>
    </Layout>
  );
}
function IssuesMain() {
  const emptyView = <div className="">No issues found. Create an issue to get started!</div>;

  return (
    <>
      <IssueList emptyView={emptyView} />
    </>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { session, redirect, ...props } = await loadWorkspaceData(context);
  if (redirect) return redirect;

  return {
    props: props as Props,
  };
};
