import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ButtonLink } from "@/components/ui/Button";
import { PRODUCT } from "@/types";
import { SignInForm, SignInProps } from "@/pages/auth/signin";
import { getCsrfToken, getProviders } from "next-auth/react";

export default function IndexPage(props: SignInProps) {
  return (
    <AuthLayout>
      <Head>
        <title>{PRODUCT}</title>
      </Head>
      <p>Welcome!</p>
      <SignInForm {...props} />
    </AuthLayout>
  );
}

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);

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
      providers,
      csrfToken,
    },
  };
}
