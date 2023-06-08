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

type Props = {
  welcomed: boolean;
} & WorkspaceProps;

export default function Dashboard({ welcomed, ...props }: Props) {
  const router = useRouter();
  useUI(props);

  useEffect(() => {
    if (!welcomed) {
      logger.info("user needs welcome");
      API.welcome();
    }
  }, [welcomed]);

  const newIssue = async () => {
    // create request and get id
    // const form = await API.createForm();
    // const formId = form.id;
    // // redirect to request page via next routing
    // router.push(`/forms/${formId}`);
  };

  const refresh = () => {
    router.replace(router.asPath);
  };

  const headerButton = <Button onClick={newIssue}>New Issue</Button>;

  return (
    <Layout>
      <Head>
        <title>My Stuff</title>
      </Head>
      <PageLayout title="My Stuff" titleButtons={headerButton}>
        <div className="flex items-center">
          <h2 className="font-bold text-lg">In Progress</h2>
          <div
            className="ml-4 p-1 hover:bg-gray-100 rounded-md cursor-pointer"
            onClick={refresh}
            data-tooltip-content="Refresh"
            data-tooltip-id="tooltip"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </div>
        </div>
        {/* <FormTable /> */}
      </PageLayout>
    </Layout>
  );
}
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { session, redirect, workspaces, activeWorkspace, projects } = await loadWorkspaceData(
    context
  );
  if (redirect) return redirect;

  return {
    props: {
      activeWorkspace,
      workspaces,
      projects,
      welcomed: !!session.dbUser.welcomedAt,
    } as Props,
  };
};
