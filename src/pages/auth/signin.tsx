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

type Props = {
  csrfToken: string;
  providers: Record<string, ClientSafeProvider>;
};

export default function SignInPage({ csrfToken, providers }: Props) {
  const [email, setEmail] = useState("");
  const oauthProviders = Object.values(providers || {}).filter((p) => p.type == "oauth");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // validate email
    if (!email || !email.includes("@")) return;

    if (process.env.NODE_ENV === "development") {
      await signIn("credentials", { email, token: "dev" });
    } else {
      await signIn("email", { email });
    }
  };

  return (
    <AuthLayout>
      <Head>
        <title>Sign In</title>
      </Head>
      {oauthProviders.map((provider) => (
        <div key={provider.name} className="">
          <button
            onClick={() => signIn(provider.id, { callback: location.href })}
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
            disabled={!email}
            className="inline-flex w-full justify-center rounded-md bg-blue-600 disabled:bg-gray-600 p-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
          >
            Continue&nbsp;<span className="hidden sm:inline">with Email</span>
          </button>
        </div>
      </form>
    </AuthLayout>
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
    } as Props,
  };
};
