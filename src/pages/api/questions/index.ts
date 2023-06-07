import { getServerSession, Session } from "next-auth";

import prisma from "@/lib/prisma";
import { tracker } from "@/lib/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type Prisma from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { Question } from "@prisma/client";
import { ApiError, authApiWrapper } from "@/lib/apiWrapper";

export default authApiWrapper<Question[] | Question>(function handler(
  req: NextApiRequest,
  session: Session
) {
  if (req.method == "POST") {
    return createQuestion(session, req);
  } else if (req.method == "PUT") {
    return updateQuestion(session, req);
  } else {
    return listQuestions(session, req);
  }
});

export const assertFormOwner = async (formId: string, userId: string) => {
  if (!formId) throw new Error("formId is required");
  await prisma.formOwner.findFirstOrThrow({
    where: {
      formId,
      userId,
    },
  });
};

async function listQuestions(session: Session, req: NextApiRequest): Promise<Question[]> {
  const formId = req.query.formId as string;
  assertFormOwner(formId, session.user.id);

  const questions = await prisma.question.findMany({
    where: {
      formId,
    },
  });

  return questions;
}

async function createQuestion(session: Session, req: NextApiRequest): Promise<Question> {
  const formId = req.query.formId as string;
  assertFormOwner(formId, session.user.id);
  tracker.logEvent(session.user.email, "question-create");

  const body: Partial<Prisma.Question> = req.body;

  const result = await prisma.question.create({
    data: {
      title: body.title || "",
      type: body.type || "",
      order: body.order || 0,
      formId,
    },
  });

  return result;
}

async function updateQuestion(session: Session, req: NextApiRequest): Promise<Question> {
  const question = await prisma.question.findFirst({
    where: {
      id: req.body.id,
    },
  });
  if (!question) throw new ApiError(404, "Not found");

  const formId = question?.formId;
  assertFormOwner(formId, session.user.id);
  tracker.logEvent(session.user.email, "question-edit", { keys: Object.keys(req.body) });

  const { meta, ...rest } = req.body;

  let result = null;
  if (meta) {
    const prevMeta: any = question.meta || {};
    const newMeta = { ...prevMeta, ...meta };
    result = await prisma.question.update({
      where: {
        id: question.id,
      },
      data: {
        meta: newMeta as Prisma.Prisma.JsonObject,
      },
    });
  }

  if (Object.keys(rest).length > 0) {
    result = await prisma.question.update({
      where: {
        id: question.id,
      },
      data: {
        ...rest,
      },
    });
  }

  return result || question;
}
