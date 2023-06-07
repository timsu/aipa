import Head from "next/head";
import Link from "next/link";

import Layout from "@/components/layout/Layout";
import Image from "next/image";
import { GetServerSidePropsContext } from "next";
import { AuthLayout } from "../../components/layout/AuthLayout";

export default function ErrorPage({ error }: { error: string }) {
  const canGoBack = history.length > 1;

  const goBack = (e: React.MouseEvent) => {
    if (canGoBack) {
      e.preventDefault();
      history.back();
    }
  };

  return (
    <AuthLayout>
      <Head>
        <title>Error</title>
      </Head>
      <p className="text-xl text-red-600">Error: {error || "unknown error"}</p>
      <p>
        If you were trying to fill out a request, sign in with a different method or ask the sender
        for a new link.
      </p>
      <Link
        href="/api/auth/signin"
        className="my-4 py-2 px-4 rounded-md bg-blue-600 text-white inline-block hover:bg-blue-800"
        onClick={goBack}
      >
        {canGoBack ? "Go Back" : "Sign in"}
      </Link>
    </AuthLayout>
  );
}

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      error: context.query.error || "unkonwn error",
    },
  };
}
