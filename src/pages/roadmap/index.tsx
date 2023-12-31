import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";

import { WorkspaceProps } from "@/types";
import { loadWorkspaceData } from "@/server/loaders";
import { useUI } from "@/stores/uiStore";
import PageLayout from "@/components/layout/PageLayout";

type Props = {} & WorkspaceProps;

export default function Roadmap({ ...props }: Props) {
  const router = useRouter();
  useUI(props);

  return (
    <Layout>
      <PageLayout title="Roadmap">TODO: put your issues on the calendar</PageLayout>
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
