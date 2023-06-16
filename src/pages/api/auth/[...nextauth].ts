import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import NextAuth, { getServerSession, NextAuthOptions, Session } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

import prisma from "@/server/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import emails from "@/emails/emails";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";
import { logger } from "@/lib/logger";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest(params) {
        const { identifier: email, url } = params;
        if (email.endsWith("@test.com")) {
          console.log(url);
          return;
        }
        await emails.verifyEmail(email, url);
      },
    }),
    CredentialsProvider({
      name: "Email Tokens",
      credentials: {
        email: { label: "Email", type: "text" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials, req) {
        console.log("authorizing", credentials, credentials?.email, credentials?.token);
        if (!credentials) return null;

        const bypass = process.env.NODE_ENV === "development" && credentials.token == "dev";
        if (!bypass) {
          const secret = process.env.NEXTAUTH_SECRET!;
          const tokenResult = jwt.verify(credentials.token, secret) as { email: string };
          if (tokenResult?.email != credentials.email) {
            logger.info("Email and token do not match", credentials.email, tokenResult);
            return null;
          }
        }

        let user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
            },
          });
        }

        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  theme: {
    colorScheme: "light",
    logo: "/icon.svg",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      const dbUser = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });
      session.user.id = dbUser!.id;
      session.dbUser = dbUser;
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);

export const sessionOrRedirect = async (context: GetServerSidePropsContext) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session) return session;
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};

export const isRedirect = (session: Session | { redirect: any }): session is { redirect: any } => {
  return (session as { redirect: any }).redirect !== undefined;
};
