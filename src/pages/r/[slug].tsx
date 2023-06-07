"use client";

import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import { ClientSafeProvider, getCsrfToken, getProviders, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

import Submit from "@/components/questions/Submit";
import prisma, { serialize } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import LoginModal from "@/pages/r/LoginModal";
import { fillFormStore } from "@/stores/fillFormStore";

import type Prisma from "@prisma/client";
import FormViewer from "@/components/forms/FormViewer";
import { Doc } from "@/components/editor/Doc";
import { toast } from "react-toastify";
import { logger } from "@/lib/logger";
import { useStore } from "@nanostores/react";
import MiniLayout from "@/components/layout/MiniLayout";
import { User } from "@/types";
import DueDate from "./DueDate";
import MiniHeader from "@/components/layout/MiniHeader";
import useArrowKeyNavigation from "@/components/hooks/useArrowKeyNavigation";
type Props = {
  form: Prisma.Form;
  questions: Prisma.Question[];
  doc: Doc | null;
  csrfToken: string;
  providers: Record<string, ClientSafeProvider>;
  isOwner: boolean;
};

export default function FillForm({ form, doc, questions, isOwner, ...authProps }: Props) {
  const session = useSession();

  useEffect(() => {
    if (session.status == "loading") return;
    const user = session.data?.user as User | undefined;
    fillFormStore.load(form, questions, user, isOwner);
  }, [form, questions, session, isOwner]);

  const router = useRouter();
  const previewMode = useStore(fillFormStore.previewMode);

  const submit = async () => {
    try {
      await fillFormStore.submit();
      router.push("/r/success");
    } catch (e: any) {
      logger.error(e);
      toast.error("Error submitting form: " + e.message);
    }
  };

  const parentNode = useArrowKeyNavigation<HTMLDivElement>({ selectors: "a,input,button" });

  return (
    <>
      <Head>
        <title>{form.name || "Form"}</title>
      </Head>
      <MiniLayout>
        <MiniHeader>
          {session.data?.user && previewMode && (
            <div className="-ml-2 p-2 bg-blue-50 rounded text-blue-600">
              {isOwner
                ? "This is a preview of what your recipient will see."
                : "Form filling is disabled."}
            </div>
          )}
          <DueDate />
        </MiniHeader>

        <div ref={parentNode} className="p-4 w-full max-w-4xl mx-auto pb-20">
          <div className="flex items-center justify-between">
            <div className={`font-bold text-4xl my-4 p-2 -mx-2`}>{form.name}</div>
          </div>

          <FormViewer doc={doc} />

          <Submit onSubmit={submit} disabled={previewMode} />

          <LoginModal {...authProps} isOwner={isOwner} />
        </div>
      </MiniLayout>
    </>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { slug } = context.query;
  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);

  const session = await getServerSession(context.req, context.res, authOptions);

  if (!slug)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  const form = await prisma.form.findUnique({
    where: {
      slug: slug as string,
    },
  });

  if (!form) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const [ownerRecord, questions, doc] = await Promise.all([
    session
      ? await prisma.formOwner.findUnique({
          where: {
            userId_formId: {
              formId: form.id,
              userId: session?.dbUser?.id,
            },
          },
        })
      : null,
    prisma.question.findMany({
      where: {
        formId: form.id,
        deletedAt: null,
      },
    }),
    prisma.formContents.findFirst({
      where: {
        formId: form.id as string,
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
      providers: providers || {},
      csrfToken,
      user: session?.user || null,
      isOwner: !!ownerRecord,
    } as Props,
  };
};
