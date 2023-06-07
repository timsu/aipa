import Head from "next/head";
import { AuthLayout } from "../../components/layout/AuthLayout";
import Link from "next/link";

export default function ErrorPage({ error }: { error: string }) {
  return (
    <AuthLayout>
      <Head>
        <title>Verify Request</title>
      </Head>
      <p className="text-xl">Check your email</p>
      <p>A sign in link has been sent to your email address.</p>
      <Link
        href="/"
        className="my-4 py-2 px-4 rounded-md bg-blue-600 text-white inline-block hover:bg-blue-800"
      >
        Home
      </Link>
    </AuthLayout>
  );
}
