"use client";

import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useEffect } from "react";

import prisma, { serialize } from "@/lib/prisma";
import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";
import { fillFormStore } from "@/stores/fillFormStore";

import type Prisma from "@prisma/client";
import FormViewer from "@/components/forms/FormViewer";
import { Doc } from "@/components/editor/Doc";
import Layout from "@/components/layout/Layout";
import { User } from "@/types";

type Props = {
  form: Prisma.Form;
  questions: Prisma.Question[];
  answers: Prisma.Answer[];
  formFill: Prisma.FormFill;
  doc: Doc | null;
  user: User;
};

export default function FillForm({ form, formFill, doc, questions, answers, user }: Props) {
  useEffect(() => {
    fillFormStore.loadResponse(form, formFill, questions, user, answers);
  }, [answers, form, formFill, questions, user]);

  return (
    <>
      <Head>
        <title>{form.name || "Form"}</title>
      </Head>
      <Layout>
        <div className="p-4 w-full max-w-4xl mx-auto pb-20">
          <div className="flex items-center justify-between">
            <div className="mt-4 -ml-2 p-2 bg-blue-50 rounded text-blue-600 ">
              Response from {user.name ? `${user.name} (${user.email})` : user.email}
            </div>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-800 print:hidden"
              onClick={() => {
                window.print();
              }}
            >
              Print
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className={`font-bold text-4xl my-4 p-2 -mx-2`}>{form.name}</div>
          </div>

          <FormViewer doc={doc} />
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await sessionOrRedirect(context);
  if (isRedirect(session)) return session;

  const { fillId } = context.query;

  const formFill = await prisma.formFill.findUnique({
    where: {
      id: fillId as string,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!formFill) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  const [form, questions, answers, doc] = await Promise.all([
    prisma.form.findFirst({
      where: {
        id: formFill.formId,
        formOwners: {
          some: {
            userId: session.user.id,
          },
        },
      },
    }),
    prisma.question.findMany({
      where: {
        formId: formFill.formId,
        deletedAt: null,
      },
    }),
    prisma.answer.findMany({
      where: {
        formFillId: formFill.id,
      },
    }),
    prisma.formContents.findFirst({
      where: {
        formId: formFill.formId,
      },
      orderBy: {
        version: "desc",
      },
    }),
  ]);

  if (!form) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {
      form: serialize(form),
      formFill: serialize(formFill),
      doc: doc?.data || null,
      questions: questions.map(serialize),
      answers: answers.map(serialize),
      user: formFill.user,
    } as Props,
  };
};
