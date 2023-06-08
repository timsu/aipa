import type { NextApiRequest, NextApiResponse } from "next";
import emails from "@/emails/emails";
import prisma from "@/server/prisma";
import { Session } from "next-auth";
import { authApiWrapper } from "@/server/apiWrapper";

export default authApiWrapper(async function handler(req: NextApiRequest, session: Session) {
  // make sure database update succeeds before sending welcome email, else we risk sending multiple
  await prisma.user.update({
    where: {
      id: session.dbUser.id,
    },
    data: {
      welcomedAt: new Date(),
    },
  });

  await emails.sendWelcome(session.dbUser.email as string);
});
