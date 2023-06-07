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

type Props = {
  forms: FormWithFill[];
  welcomed: boolean;
};

export default function Dashboard({ forms, welcomed }: Props) {
  const router = useRouter();

  useEffect(() => {
    dashboardStore.load(forms);
  }, [forms]);

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
        <title>Dashboard</title>
      </Head>
      <div className="p-4 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-xl my-4">Dashboard</h1>
          <button
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-800"
            onClick={newForm}
          >
            New Request Form
          </button>
        </div>
        <div className="">Welcome to DocGet.</div>

        <div className="mt-8">
          <div className="flex items-center">
            <h2 className="font-bold text-lg">Your Forms</h2>
            <div
              className="ml-4 p-1 hover:bg-gray-100 rounded-md cursor-pointer"
              onClick={refresh}
              data-tooltip-content="Refresh"
              data-tooltip-id="tooltip"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </div>
          </div>
          <FormTable />
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
  const forms = await prisma.form.findMany({
    where: {
      name: {
        not: "",
      },
      formOwners: {
        some: {
          userId,
        },
      },
      deletedAt: null,
    },
    include: {
      formFills: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return {
    props: {
      forms: forms.map(serialize),
      welcomed: !!session.dbUser.welcomedAt,
    } as Props,
  };
};
