import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import emails from "@/emails/emails";
import jwt from "jsonwebtoken";
import { createDueDate } from "@/lib/db";
import { SuccessResponse } from "@/client/api";
import { ApiError, authApiWrapper } from "@/lib/apiWrapper";

export default authApiWrapper(async function handler(req: NextApiRequest, session: Session) {
  const id = req.body.id as string;

  const form = await prisma.form.findFirst({
    where: {
      id: id,
      formOwners: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });
  if (!form) throw new ApiError(404, "Form not found");

  // split emails by comma or newline
  const sendToEmails = req.body.emails as string;
  const splitEmails = sendToEmails.split(/,|\n/).map((e) => e.trim());

  // strip names
  const actualEmails = splitEmails.map(stripName);

  // validate emails
  const invalidEmails = actualEmails.filter((e) => !e.match(/.+@.+\..+/));
  if (invalidEmails.length > 0) {
    throw new ApiError(400, `Invalid emails: ${invalidEmails.join(", ")}`);
  }

  // send emails
  const fromName = req.body.fromName as string;
  const title = form.name;

  const existingUsers = await prisma.user.findMany({
    where: {
      email: {
        in: actualEmails,
      },
    },
  });

  const existingUserIds = existingUsers.map((u) => u.id);
  const existingFormFills = await prisma.formFill.findMany({
    where: {
      formId: form.id,
      userId: {
        in: existingUserIds,
      },
    },
  });

  await Promise.all(
    splitEmails.map(async (email) => {
      const actualEmail = stripName(email);
      let user = existingUsers.find((u) => u.email === actualEmail);
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: actualEmail,
          },
        });
      }

      let fill = existingFormFills.find((f) => f.userId === user!.id);
      if (!fill) {
        fill = await prisma.formFill.create({
          data: {
            formId: form.id,
            userId: user.id,
            completed: 0,
            dueAt: createDueDate(form),
          },
        });
      }

      // generate token to sign in automatically
      const secret = process.env.NEXTAUTH_SECRET!;
      const token = jwt.sign({ email }, secret, { expiresIn: "1w" });
      const path = `/r/${form.slug}?email=${encodeURIComponent(email)}&token=${token}`;
      await emails.sendForm(email, fromName, session.dbUser.email, title, path);
    })
  );
});

const stripName = (e: string) => e.replace(/^.+<(.+)>$/, "$1");
