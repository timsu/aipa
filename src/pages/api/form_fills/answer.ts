import { Session, getServerSession } from "next-auth";

import { FormFillWithData } from "@/client/api";
import prisma from "@/server/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Answer } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { authApiWrapper } from "@/server/apiWrapper";

export default authApiWrapper<Answer>(async function handler(
  req: NextApiRequest,
  session: Session
) {
  const { fillId, questionId, value } = req.body;

  let answer = await prisma.answer.findFirst({
    where: {
      formFillId: fillId,
      questionId: questionId,
    },
  });

  if (answer) {
    await prisma.answer.update({
      where: {
        id: answer.id,
      },
      data: {
        value: value,
        userId: session.dbUser.id,
      },
    });
  } else {
    answer = await prisma.answer.create({
      data: {
        userId: session.dbUser.id,
        formFillId: fillId,
        questionId: questionId,
        value: value,
      },
    });
  }

  return answer;
});
