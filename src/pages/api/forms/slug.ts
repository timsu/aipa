import crypto from "crypto";
import { getServerSession, Session } from "next-auth";

import prisma from "@/lib/prisma";
import { tracker } from "@/lib/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/lib/apiWrapper";

export default authApiWrapper<string>(async function handler(
  req: NextApiRequest,
  session: Session
) {
  tracker.logEvent(session.user.email, "form-slug-generate");

  const { id } = req.query;

  const form = await prisma.form.findFirst({
    where: {
      id: id as string,
      formOwners: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });
  if (!form) throw new ApiError(404, "Form not found");

  if (form.slug) return form.slug;

  // generate random slug
  for (let i = 0; i < 10; i++) {
    const slug = generateRandomString(12);
    try {
      await prisma.form.update({
        where: {
          id: form.id,
        },
        data: {
          slug,
        },
      });
      return slug;
    } catch (e) {
      console.log(e);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw new ApiError(500, "Failed to generate slug");
});

export function generateRandomString(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";

  // Create an array of 32-bit unsigned integers
  const randomValues = new Uint32Array(length);

  // Generate random values
  crypto.getRandomValues(randomValues);
  randomValues.forEach((value) => {
    result += characters.charAt(value % charactersLength);
  });
  return result;
}
