import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";
import Link from "next/link";

import Layout from "@/components/layout/Layout";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { AuthLayout } from "@/components/layout/AuthLayout";
import Button, { ButtonLink } from "@/components/ui/Button";

export default function IndexPage() {
  return (
    <AuthLayout>
      <Head>
        <title>Rhea</title>
      </Head>
      <p>Welcome! Please sign in to continue.</p>
      <ButtonLink href="/api/auth/signin" className="my-4">
        Sign in
      </ButtonLink>
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
