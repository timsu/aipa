"use client";

import { GetServerSidePropsContext } from "next";
import { ClientSafeProvider } from "next-auth/react";
import Head from "next/head";

import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";
import Finished from "@/pages/r/Finished";
import MiniHeader from "@/components/layout/MiniHeader";
import { User } from "@prisma/client";

import type Prisma from "@prisma/client";
type Props = {
  form: Prisma.Form;
  questions: Prisma.Question[];
  csrfToken: string;
  providers: Record<string, ClientSafeProvider>;
  user: User | undefined;
  isOwner: boolean;
};

export default function FillForm({ form, questions, user, isOwner, ...authProps }: Props) {
  return (
    <>
      <MiniHeader />
      <Head>
        <title>{"Success!"}</title>
      </Head>
      <div className="p-4 w-full max-w-4xl mx-auto">
        <Finished />
      </div>
    </>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const result = await sessionOrRedirect(context);
  if (isRedirect(result)) {
    return result;
  }

  return {
    props: {},
  };
};
