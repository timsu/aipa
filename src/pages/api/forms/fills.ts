import { getServerSession, Session } from "next-auth";

import prisma from "@/lib/prisma";
import { tracker } from "@/lib/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma, { Form, FormFill } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/lib/apiWrapper";

export default authApiWrapper<FormFill[]>(async function handler(
  req: NextApiRequest,
  session: Session
) {
  const form = await prisma.form.findFirst({
    where: {
      id: req.body.id,
      formOwners: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });
  if (!form) throw new ApiError(404, "Form not found");

  const id = req.query.id as string;

  const fills = await prisma.formFill.findMany({
    where: {
      formId: id,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  return fills;
});
