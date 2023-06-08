"use client";

import { GetServerSidePropsContext } from "next";
import { Noto_Serif, Share } from "next/font/google";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Layout from "@/components/layout/Layout";
import Submit, { SubmitResult } from "@/components/questions/Submit";
import prisma, { serialize } from "@/server/prisma";
import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";
import Viewer from "@/components/forms/FormViewer";
import { editFormStore } from "@/stores/editFormStore";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Form, Question } from "@prisma/client";
import { fillFormStore } from "@/stores/fillFormStore";
import { Doc } from "@/components/editor/Doc";
import { User } from "@/types";
import OverlayPanel from "@/components/modals/OverlayPanel";
import FormSettings from "@/components/forms/FormSettings";
import SendForm from "./SendForm";

type Props = {
  form: Form;
  questions: Question[];
  doc: Doc;
  user: User;
};

export default function ViewForm({ user, form, doc, questions }: Props) {
  useEffect(() => {
    fillFormStore.load(form, questions, user, true);
    editFormStore.form.set(form);
    return () => fillFormStore.reset();
  }, [form, questions, user]);

  const [showSettings, setShowSettings] = useState(false);
  const send = () => setShowSettings(true);

  const submit = async () => {
    await new Promise((r) => setTimeout(r, 1000));
  };

  return (
    <Layout>
      <Head>
        <title>{form.name || "Form"}</title>
      </Head>
      <div className={`relative w-full`}>
        <div className="p-4 w-full max-w-4xl mx-auto pb-40">
          <Link
            href={"/forms/" + form.id}
            className="text-slate-400 hover:text-slate-800 flex items-center"
          >
            <ChevronLeftIcon className="inline-block w-4 h-4 mr-1" />
            Back to Edit
          </Link>
          <div className="flex items-center justify-between">
            <div className={`font-bold text-4xl my-4 p-2 -mx-2`}>{form.name}</div>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-800"
              onClick={send}
            >
              Settings & Send Form
            </button>
          </div>

          <Viewer doc={doc} />

          <Submit onSubmit={submit} />

          <Link
            href={"/forms/" + form.id}
            className="text-slate-400 hover:text-slate-800 flex items-center mt-4"
          >
            <ChevronLeftIcon className="inline-block w-4 h-4 mr-1 " />
            Back to Edit
          </Link>
        </div>
        <OverlayPanel
          open={showSettings}
          close={() => setShowSettings(false)}
          title="Send Form"
          panelClass={"max-w-xl"}
        >
          <SendForm close={() => setShowSettings(false)} />

          <hr className="my-4" />

          <h3 className="font-semibold mb-4">Form Settings</h3>
          <FormSettings />
        </OverlayPanel>
      </div>
    </Layout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await sessionOrRedirect(context);
  if (isRedirect(session)) return session;

  const userId = session.user.id;
  const id = context.query.id as string;

  // assert user has permission to view this form
  await prisma.formOwner.findUniqueOrThrow({
    where: {
      userId_formId: {
        formId: id as string,
        userId,
      },
    },
  });

  const [form, questions, doc] = await Promise.all([
    prisma.form.findUniqueOrThrow({
      where: {
        id,
      },
    }),
    prisma.question.findMany({
      where: {
        formId: id,
        deletedAt: null,
      },
    }),
    prisma.formContents.findFirst({
      where: {
        formId: id as string,
      },
      orderBy: {
        version: "desc",
      },
    }),
  ]);

  return {
    props: {
      form: serialize(form!),
      doc: doc?.data || null,
      questions: questions.map(serialize),
      user: session.user,
    },
  };
};
