import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth";
import Head from "next/head";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ButtonLink } from "@/components/ui/Button";
import { PRODUCT } from "@/types";
import prisma from "@/server/prisma";
import { Workspace } from "@prisma/client";

type Props = {
  error?: string;
  email: string;
  token: string;
  inviter: string;
  workspace: string;
};

export default function JoinInvitePage(props: Props) {
  if (props.error)
    return (
      <AuthLayout>
        <Head>
          <title>{PRODUCT}</title>
        </Head>
        <p>Error: this invite is invalid or expired</p>
        <ButtonLink href="/" className="my-4">
          Go home
        </ButtonLink>
      </AuthLayout>
    );

  return (
    <AuthLayout title={props.workspace}>
      <Head>
        <title>{PRODUCT}</title>
      </Head>
      <p>
        Welcome! {props.inviter} would like you to join their workspace on {PRODUCT}.
      </p>
      <ButtonLink href="/api/auth/signin" className="my-4">
        Sign in
      </ButtonLink>
    </AuthLayout>
  );
}

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

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
      session,
      email,
      token,
      inviter: invite.creator?.name,
      workspace: invite.workspace.name,
      alreadyJoined,
    } as Props,
  };
}
