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
  return null;
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const id = context.query.id as string;
  return {
    redirect: {
      destination: "/projects/" + id + "/issues",
      permanent: false,
    },
  };
};
