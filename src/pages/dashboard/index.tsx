import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";
import API from "@/lib/api";
import prisma, { serialize } from "@/lib/prisma";
import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";

import FormTable from "@/pages/dashboard/FormTable";
import DeleteFormModal from "@/pages/dashboard/DeleteFormModal";
import { FormWithFill, dashboardStore } from "@/stores/dashboardStore";
import { useEffect } from "react";
import ResponsesModal from "@/pages/dashboard/ResponsesModal";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { logger } from "@/lib/logger";
import { Project, Workspace } from "@prisma/client";
import Button from "@/components/ui/Button";

type Props = {
  workspaces: Workspace[];
  projects: Project[];
  welcomed: boolean;
};

export default function Dashboard({ workspaces, projects, welcomed }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!welcomed) {
      logger.info("user needs welcome");
      API.welcome();
    }
  }, [welcomed]);

  const newForm = async () => {
    // create request and get id
    const form = await API.createForm();
    const formId = form.id;
    // redirect to request page via next routing
    router.push(`/forms/${formId}`);
  };

  const refresh = () => {
    router.replace(router.asPath);
  };

  return (
    <Layout>
      <Head>
        <title>My Stuff</title>
      </Head>
      <div className="p-4 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl my-4">My Stuff</h1>
          <Button onClick={newForm}>New Issue</Button>
        </div>
        <div>
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
        </div>
      </div>
      <DeleteFormModal />
      <ResponsesModal />
    </Layout>
  );
}
export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await sessionOrRedirect(context);
  if (isRedirect(session)) return session;

  const userId = session.user.id;

  const workspaces = await prisma.workspace.findMany({
    where: {
      users: {
        some: {
          userId,
        },
      },
    },
  });

  const projects = await prisma.project.findMany({
    where: {
      workspace: {
        id: {
          in: workspaces.map((w) => w.id),
        },
      },
      archivedAt: null,
      deletedAt: null,
    },
  });

  return {
    props: {
      workspaces: workspaces.map(serialize),
      projects: projects.map(serialize),
      welcomed: !!session.dbUser.welcomedAt,
    } as Props,
  };
};
