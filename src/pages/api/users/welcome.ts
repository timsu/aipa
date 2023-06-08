import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import emails from "@/emails/emails";
import prisma from "@/lib/prisma";
import { SuccessResponse } from "@/client/api";
import { Session } from "next-auth";
import { authApiWrapper } from "@/lib/apiWrapper";

export default authApiWrapper(async function handler(req: NextApiRequest, session: Session) {
  await emails.sendWelcome(session.dbUser.email as string);

  await prisma.user.update({
    where: {
      id: session.dbUser.id,
    },
    data: {
      welcomedAt: new Date(),
    },
  });
});
