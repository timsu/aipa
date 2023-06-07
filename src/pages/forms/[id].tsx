"use client";

import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import Layout from "@/components/layout/Layout";
import prisma, { serialize } from "@/lib/prisma";
import { isRedirect, sessionOrRedirect } from "@/pages/api/auth/[...nextauth]";
import FormEditor from "@/components/forms/FormEditor";
import { editFormStore } from "@/stores/editFormStore";
import { ChevronLeftIcon, CogIcon, EyeIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Form, Question } from "@prisma/client";
import { useStore } from "@nanostores/react";
import { Doc } from "@/components/editor/Doc";
import { editorStore } from "@/stores/editorStore";
import OverlayPanel from "@/components/modals/OverlayPanel";
import FormSettings from "@/components/forms/FormSettings";

type Props = {
  form: Form;
  doc: Doc | null;
  questions: Question[];
};

export default function ViewForm({ form, doc, questions }: Props) {
  const [name, setName] = useState(form.name);
  const router = useRouter();

  const canPreview = Object.keys(useStore(editFormStore.questions)).length > 0;

  useEffect(() => {
    editFormStore.load(form, questions);
    return () => editFormStore.reset();
  }, [form, questions]);

  const preview = async () => {
    await Promise.all([editFormStore.onPreview(), editorStore.saveNow()]);
    router.push("/forms/preview/" + form.id);
  };

  const [showSettings, setShowSettings] = useState(false);

  return (
    <Layout>
      <Head>
        <title>{form.name || "Form"}</title>
      </Head>
      <div className={`relative w-full`}>
        <div className={`form-main p-4 w-full max-w-4xl flex flex-col mx-auto`}>
          <Link
            href={"/dashboard"}
            className="text-slate-400 hover:text-slate-800 flex items-center"
          >
            <ChevronLeftIcon className="inline-block w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>
          <div className="flex items-center">
            <input
              className={`w-full font-bold text-4xl my-4 p-2 -mx-2 flex-1 mr-4 min-h-[3rem]`}
              autoFocus={!form.name}
              placeholder="Form Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  editorStore.focus();
                }
              }}
              onBlur={() => editFormStore.update({ name })}
            />
            <button
              onClick={() => setShowSettings(true)}
              className="hover:bg-blue-100 text-gray-500 p-2 rounded-md"
              tabIndex={-1}
              data-tooltip-id="tooltip"
              data-tooltip-content={"Settings"}
            >
              <CogIcon className="w-6 h-7" />
            </button>
          </div>

          <FormEditor id={form.id} doc={doc} />

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-8 mb-[20rem]">
            <button
              className="flex-1 hover:bg-slate-200 text-slate-700 bg-slate-100 rounded-md p-4 
          cursor-pointer"
              tabIndex={0}
              onClick={() => editorStore.triggerSlashMenu()}
            >
              <PlusIcon className="inline-block w-4 h-4 mr-2 -mt-1" />
              Add Item
            </button>

            <div
              className="flex-1"
              data-tooltip-id="tooltip"
              data-tooltip-content={!canPreview ? "Please add a question first" : undefined}
            >
              <button
                onClick={preview}
                disabled={!canPreview}
                className="w-full bg-blue-600 disabled:bg-gray-600 text-white p-4 rounded-md hover:bg-blue-800"
              >
                <EyeIcon className="inline-block w-4 h-4 mr-2 -mt-1" />
                Preview
              </button>
            </div>
          </div>
        </div>

        <OverlayPanel
          open={showSettings}
          close={() => setShowSettings(false)}
          title="Form Settings"
          panelClass={"max-w-xl"}
        >
          <FormSettings />
        </OverlayPanel>
      </div>
    </Layout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const id = context.query.id as string;
  const session = await sessionOrRedirect(context);
  if (isRedirect(session)) {
    // user is not logged in - if this is a public form, show the url
    const form = await prisma.form.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (form.slug) {
      return {
        redirect: {
          destination: `/r/${form.slug}`,
          permanent: false,
        },
      };
    } else {
      return session;
    }
  }

  const userId = session.user.id;

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
    },
  };
};
