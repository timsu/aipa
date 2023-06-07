import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import Link from "next/link";

import Layout from "@/components/layout/Layout";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { AuthLayout } from "@/components/layout/AuthLayout";

export default function IndexPage() {
  return (
    <AuthLayout>
      <Head>
        <title>DocGet</title>
      </Head>
      <p>Welcome to DocGet. Please sign in to continue.</p>
      <Link
        href="/api/auth/signin"
        className="my-4 py-2 px-4 rounded-md bg-blue-600 text-white inline-block hover:bg-blue-800"
      >
        Sign in
      </Link>
    </AuthLayout>
  );
}

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}
