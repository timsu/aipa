import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ButtonLink } from "@/components/ui/Button";
import { PRODUCT } from "@/types";

export default function IndexPage() {
  return (
    <AuthLayout>
      <Head>
        <title>{PRODUCT}</title>
      </Head>
      <p>Welcome! Join ze invite.</p>
      <ButtonLink href="/api/auth/signin" className="my-4">
        Sign in
      </ButtonLink>
    </AuthLayout>
  );
}

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  return {
    props: {
      session,
    },
  };
}
