import { Session, getServerSession } from "next-auth";

import { FormFillWithData, SuccessResponse } from "@/client/api";
import prisma from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Answer } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import emails from "@/emails/emails";
import { ApiError, authApiWrapper } from "@/lib/apiWrapper";

export default authApiWrapper(async function handler(req: NextApiRequest, session: Session) {
  const { id } = req.body;

  let fill = await prisma.formFill.findFirst({
    where: {
      id,
      OR: [
        {
          userId: session.dbUser.id,
        },
        {
          fillDelegations: {
            some: {
              assigneeId: session.dbUser.id,
            },
          },
        },
      ],
    },
  });

  if (!fill) throw new ApiError(404, "Not found");

  const firstSubmit = !fill.submittedAt;

  await prisma.formFill.update({
    where: {
      id,
    },
    data: {
      submittedAt: new Date(),
    },
  });

  if (firstSubmit) {
    const form = await prisma.form.findUnique({
      where: {
        id: fill.formId,
      },
      include: {
        formOwners: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!form) throw new ApiError(404, "Not found");

    const fromUser = session.dbUser.name || session.dbUser.email;
    const title = form.name;
    const path = `/forms/responses/${fill.id}`;

    await Promise.all(
      form.formOwners.map(async (owner) => {
        const email = owner.user.email;
        if (!email) return;
        await emails.responseReceived(email, fromUser, session.dbUser.email, title, path);
      })
    );

    if (!session.dbUser.welcomedAt) {
      // check if this was user's first form
      const formCount = await prisma.formFill.count({
        where: {
          userId: session.dbUser.id,
        },
      });
      if (formCount === 1) {
        await emails.sendFirstForm(session.dbUser.email);
      }
    }
  }
});
