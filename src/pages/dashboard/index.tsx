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
import { useStore } from "@nanostores/react";
import { dashboardStore } from "@/stores/dashboardStore";
import DashboardIssues from "./DashboardIssues";
import NewIssueButton from "@/components/issues/NewIssueButton";
import RefreshButton from "@/components/ui/RefreshButton";

type Props = {
  welcomed: boolean;
} & WorkspaceProps;

export default function Dashboard({ welcomed, ...props }: Props) {
  useUI(props);

  useEffect(() => {
    if (!welcomed) {
      logger.info("user needs welcome");
      API.welcome();
    }
    dashboardStore.load();
  }, [welcomed]);

  const refresh = useCallback(async () => {
    await dashboardStore.load();
  }, []);

  const headerButton = (
    <>
      <RefreshButton refresh={refresh} refreshOnLoad />

      <NewIssueButton />
    </>
  );

  return (
    <Layout>
      <PageLayout title="My Stuff" titleButtons={headerButton}>
        <DashboardIssues />
      </PageLayout>
    </Layout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { session, redirect, ...rest } = await loadWorkspaceData(context);
  if (redirect) return redirect;

  return {
    props: {
      ...rest,
      welcomed: !!session.dbUser.welcomedAt,
    } as Props,
  };
};
