import Head from "next/head";
import Link from "next/link";

import Layout from "@/components/layout/Layout";
import Image from "next/image";
import { GetServerSidePropsContext } from "next";
import { ClientSafeProvider, getCsrfToken, getProviders, signIn } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { FormEvent, useState } from "react";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { toast } from "react-toastify";
import { unwrapError } from "@/lib/utils";
import { logger } from "@/lib/logger";

export type SignInProps = {
  email?: string;
  token?: string;
  csrfToken: string;
  providers: Record<string, ClientSafeProvider>;
  callbackUrl?: string;
};

export default function SignInPage(props: SignInProps) {
  return (
    <AuthLayout>
      <Head>
        <title>Sign In</title>
      </Head>
      <SignInForm {...props} />
    </AuthLayout>
  );
}

export function SignInForm({
  csrfToken,
  providers,
  callbackUrl,
  email: queryEmail,
  token,
}: SignInProps) {
  const [email, setEmail] = useState(queryEmail || "");
  const oauthProviders = Object.values(providers || {}).filter((p) => p.type == "oauth");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // validate email
    if (!email || !email.includes("@")) return;

    try {
      setSubmitting(true);
      if (token && email == queryEmail) {
        if (callbackUrl?.includes("token=")) {
          // on failure, remove the token from the callback url
          callbackUrl = callbackUrl.replace(/&token=[^&]+/, "");
        }
        await signIn("credentials", {
          email,
          token,
          callbackUrl,
        });
      } else {
        if (process.env.NODE_ENV === "development" && !location.search.includes("test-email")) {
          await signIn("credentials", { email, token: "dev", callbackUrl });
        } else {
          await signIn("email", { email, callbackUrl });
        }
      }
    } catch (e: any) {
      logger.error(e);
      toast.error(unwrapError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {oauthProviders.map((provider) => (
        <div key={provider.name} className="">
          <button
            onClick={() => signIn(provider.id, { callbackUrl })}
            className="bg-white flex items-center w-full rounded-md border px-3 py-2 text-sm font-semibold shadow-sm hover:bg-blue-200 sm:ml-3 sm:w-auto"
          >
            <Image
              src={`https://authjs.dev/img/providers/${provider.id}.svg`}
              width={24}
              height={24}
              className="mr-4"
              alt="logo"
            />
            <div>Sign in with {provider.name}</div>
          </button>
        </div>
      ))}

      <div className="w-full border-b border-slate-300 my-4" />

      <form onSubmit={handleSubmit}>
        <div className="items-center flex">
          <input type="hidden" name="csrfToken" defaultValue={csrfToken} />
          <input
            name="email"
            autoComplete="on"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 flex-1 mr-4 w-[15rem] text-slate-800 rounded border border-gray-200"
          />
          <button
            disabled={!email || submitting}
            className="inline-flex w-full justify-center rounded-md bg-blue-600 disabled:bg-gray-600 p-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
          >
            Continue&nbsp;<span className="hidden sm:inline">with Email</span>
          </button>
        </div>
      </form>
    </>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);

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
      providers: providers || {},
      csrfToken,
    } as SignInProps,
  };
};
