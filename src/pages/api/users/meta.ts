import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/server/prisma";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { UserMeta } from "@/types";
import { authApiWrapper } from "@/server/apiWrapper";

export default authApiWrapper<UserMeta>(async function handler(
  req: NextApiRequest,
  session: Session
) {
  const { meta } = req.body;

  // Fetch the existing user meta from the database
  const existingMeta = session.dbUser.meta ?? {};

  // Merge the existing meta with the new meta
  const updatedMeta = { ...existingMeta, ...meta };

  // Update the user meta in the database
  await prisma.user.update({
    where: { id: session.dbUser.id },
    data: { meta },
  });

  // Return the updated user meta
  return updatedMeta;
});
