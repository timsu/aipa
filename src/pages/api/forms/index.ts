import { getServerSession, Session } from "next-auth";

import prisma from "@/server/prisma";
import { tracker } from "@/server/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma, { Form } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";

export default authApiWrapper<Form[] | Form>(function handler(
  req: NextApiRequest,
  session: Session
) {
  if (req.method == "POST") {
    return createForm(session, req);
  } else if (req.method == "PUT") {
    return updateForm(session, req);
  } else {
    return listForms(session, req);
  }
});

async function listForms(session: Session, req: NextApiRequest): Promise<Form[]> {
  const forms = await prisma.form.findMany({
    where: {
      formOwners: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  return forms;
}

async function createForm(session: Session, req: NextApiRequest): Promise<Form> {
  tracker.logEvent(session.user.email, "form-create");

  const result = await prisma.form.create({
    data: {
      name: "",
    },
  });

  await prisma.formOwner.create({
    data: {
      userId: session.user.id,
      formId: result.id,
    },
  });

  return result;
}

async function updateForm(session: Session, req: NextApiRequest): Promise<Form> {
  tracker.logEvent(session.user.email, "form-edit", { keys: Object.keys(req.body) });

  const { id, options, ...updates } = req.body;

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

  let result = null;
  if (options) {
    const prev: any = form.options || {};
    const newOptions = { ...prev, ...options };
    result = await prisma.form.update({
      where: {
        id: form.id,
      },
      data: {
        options: newOptions as Prisma.Prisma.JsonObject,
      },
    });
  }

  if (Object.keys(updates).length > 0) {
    result = await prisma.form.update({
      where: {
        id: form.id,
      },
      data: updates,
    });
  }

  return result || form;
}
