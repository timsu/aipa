import { Session } from "next-auth";

import prisma from "@/server/prisma";
import { ProjectValidation } from "@prisma/client";

import type { NextApiRequest } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { getProject } from "@/server/loaders";

export default authApiWrapper<ProjectValidation>(async function handler(
  req: NextApiRequest,
  session: Session
) {
  const { id } = req.query;
  const data = req.body;

  const project = await getProject(id as string, session);
  if (!project) throw new ApiError(404, "Project not found");

  const validation = await prisma.projectValidation.findFirst({
    where: {
      projectId: project.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (validation) {
    return await prisma.projectValidation.update({
      where: {
        id: validation.id,
      },
      data: {
        ...data,
      },
    });
  } else {
    return await prisma.projectValidation.create({
      data: {
        ...data,
        projectId: project.id,
      },
    });
  }
});
