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

export default function Roadmap({ ...props }: Props) {
  const router = useRouter();
  useUI(props);

  return (
    <Layout>
      <PageLayout title="Roadmap">TODO</PageLayout>
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
