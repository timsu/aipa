import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ButtonLink } from "@/components/ui/Button";
import { PRODUCT } from "@/types";
import prisma from "@/server/prisma";
import { Workspace } from "@prisma/client";
import { ClientSafeProvider, getCsrfToken, getProviders, useSession } from "next-auth/react";
import { SignInForm } from "@/pages/auth/signin";

type Props = {
  error?: string;
  email: string;
  token: string;
  inviter: string;
  workspace: string;
  csrfToken: string;
  alreadyJoined: boolean;
  providers: Record<string, ClientSafeProvider>;
};

export default function JoinInvitePage(props: Props) {
  const session = useSession();
  return (
    <AuthLayout title={props.workspace}>
      <Head>
        <title>{PRODUCT}</title>
      </Head>
      {props.error ? (
        <ErrorView />
      ) : props.alreadyJoined ? (
        <ExistingView {...props} />
      ) : session.status == "authenticated" ? (
        <JoinView {...props} />
      ) : (
        <LoginView {...props} />
      )}
    </AuthLayout>
  );
}

const ErrorView = () => (
  <>
    <p>Error: this invite is invalid or expired</p>
    <ButtonLink href="/" className="my-4">
      Go home
    </ButtonLink>
  </>
);

const ExistingView = ({ workspace }: Props) => (
  <>
    <p>Welcome! You are already a member of {workspace}.</p>
    <ButtonLink href="/dashboard" className="my-4">
      Dashboard
    </ButtonLink>
  </>
);

const LoginView = (props: Props) => (
  <>
    <p className="mb-4">
      Welcome! {props.inviter} would like you to join their workspace on {PRODUCT}.
    </p>

    <SignInForm
      {...props}
      callbackUrl={typeof location != "undefined" ? location.href : undefined}
    />
  </>
);

const JoinView = (props: Props) => (
  <>
    <p>
      Welcome! {props.inviter} would like you to join their workspace on {PRODUCT}.
    </p>
    <ButtonLink href="/api/auth/signin" className="my-4">
      Join
    </ButtonLink>
  </>
);

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);

  const { id, email, token } = context.query;

  const errorResult = (error: string) => ({
    props: {
      error,
    },
  });

  const invite = await prisma.workspaceInvite.findUnique({
    where: {
      slug: id as string,
    },
    include: {
      creator: {
        select: {
          name: true,
        },
      },
      workspace: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!invite || invite.deletedAt) {
    return errorResult("invalid-invite");
  }

  const alreadyJoined = session?.dbUser
    ? (await prisma.workspaceUser.findFirst({
        where: {
          userId: session.dbUser.id,
          workspaceId: invite.workspaceId,
          deletedAt: null,
        },
      })) != null
    : false;

  return {
    props: {
      email: email || null,
      token: token || null,
      inviter: invite.creator?.name,
      workspace: invite.workspace.name,
      alreadyJoined,
      providers: providers || {},
      csrfToken,
    } as Props,
  };
}
