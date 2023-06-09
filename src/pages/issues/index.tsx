import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";
import API from "@/client/api";
import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";

import { useEffect } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { logger } from "@/lib/logger";
import Button from "@/components/ui/Button";
import { WorkspaceProps } from "@/types";
import { loadWorkspaceData } from "@/server/loaders";
import { useUI } from "@/stores/uiStore";
import PageLayout from "@/components/layout/PageLayout";
import { issueStore } from "@/stores/issueStore";
import { useStore } from "@nanostores/react";
import { dashboardStore } from "@/stores/dashboardStore";
import DashboardIssues from "./DashboardIssues";
import { toast } from "react-toastify";
import { unwrapError } from "@/lib/utils";

type Props = {} & WorkspaceProps;

export default function Issues({ ...props }: Props) {
  const router = useRouter();
  useUI(props);

  useEffect(() => {
    refresh();
  }, []);

  const newIssue = async () => {
    issueStore.newIssue();
  };

  const refresh = async () => {
    try {
      const issues = await API.listIssues({ filter: "all", workspaceId: props.activeWorkspace });
      issueStore.loadIssues(issues);
    } catch (error) {
      logger.error(error);
      toast.error(unwrapError(error));
    }
  };

  const activeIssue = useStore(issueStore.activeIssue);

  const headerButton = (
    <>
      <div
        className="mr-4 p-1 hover:bg-gray-100 rounded-md cursor-pointer"
        onClick={refresh}
        data-tooltip-content="Refresh"
        data-tooltip-id="tooltip"
      >
        <ArrowPathIcon className="w-4 h-4" />
      </div>

      <Button onClick={newIssue} disabled={!!activeIssue && !activeIssue.id}>
        New Issue
      </Button>
    </>
  );

  return (
    <Layout>
      <PageLayout title="All Issues" titleButtons={headerButton}>
        <DashboardIssues />
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
