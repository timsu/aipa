import { Session } from "next-auth";

import prisma from "@/lib/prisma";

import type { NextApiRequest } from "next";
import { FormFill } from "@prisma/client";
import { createDueDate } from "@/lib/db";
import { ApiError, authApiWrapper } from "@/lib/apiWrapper";

export default authApiWrapper<FormFill>(function handler(req: NextApiRequest, session: Session) {
  if (req.method == "GET") {
    return createFormFill(session, req);
  } else if (req.method == "PUT") {
    return updateForm(session, req);
  } else {
    throw new ApiError(400, "Bad request");
  }
});

async function createFormFill(session: Session, req: NextApiRequest) {
  // id = form id
  const { id } = req.query;

  // create or validate form fill
  const form = await prisma.form.findFirst({
    where: {
      id: id as string,
      deletedAt: null,
    },
  });

  if (!form) throw new ApiError(404, "Not found");

  // get the form fill item
  const formFill = await prisma.formFill.findFirst({
    where: {
      formId: form.id,
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
    include: {
      user: true,
      fillDelegations: true,
      answers: true,
    },
  });

  if (formFill) {
    if (!formFill.startedAt) {
      await prisma.formFill.update({
        where: {
          id: formFill.id,
        },
        data: {
          startedAt: new Date(),
        },
      });
    }

    return formFill;
  }

  // create form fill
  const result = await prisma.formFill.create({
    data: {
      formId: form.id,
      userId: session.dbUser.id,
      completed: 0,
      startedAt: new Date(),
      dueAt: createDueDate(form),
    },
  });

  return { ...result, fillDelegations: [], answers: [] };
}

async function updateForm(session: Session, req: NextApiRequest) {
  const id = req.query.id as string;
  const updates = req.body;

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

  const formFill = await prisma.formFill.update({
    where: {
      id,
    },
    data: updates,
  });

  return formFill;
}
