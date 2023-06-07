import { getServerSession, Session } from "next-auth";

import prisma from "@/lib/prisma";
import { tracker } from "@/lib/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { assertFormOwner } from "@/pages/api/questions";
import Prisma from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { authApiWrapper } from "@/lib/apiWrapper";

export default authApiWrapper(async function handler(req: NextApiRequest, session: Session) {
  tracker.logEvent(session.user.email, "contents-save");
  const { id: formId, data } = req.body;
  assertFormOwner(formId, session.user.id);

  const contents = await prisma.formContents.findFirst({
    where: {
      formId,
    },
    orderBy: {
      version: "desc",
    },
    select: {
      id: true,
    },
  });

  if (contents) {
    await prisma.formContents.update({
      where: {
        id: contents.id,
      },
      data: {
        data,
        editorId: session.user.id,
      },
    });
  } else {
    await prisma.formContents.create({
      data: {
        data,
        editor: {
          connect: {
            id: session.user.id,
          },
        },
        form: {
          connect: {
            id: formId,
          },
        },
      },
    });
  }

  return { success: true };
});
