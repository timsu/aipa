import { getServerSession, Session } from "next-auth";

import prisma from "@/server/prisma";
import { tracker } from "@/server/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma, { Project, Workspace } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { sqltag } from "@prisma/client/runtime";
import { allWorkspaceIds, allWorkspaces } from "@/server/loaders";

export default authApiWrapper<Project[] | Project>(function handler(
  req: NextApiRequest,
  session: Session
) {
  if (req.method == "POST") {
    return create(session, req);
  } else {
    return list(session, req);
  }
});

async function list(session: Session, req: NextApiRequest): Promise<Project[]> {
  const workspaces = await allWorkspaceIds(session.user.id);

  const items = await prisma.project.findMany({
    where: {
      workspaceId: {
        in: workspaces,
      },
      deletedAt: null,
      OR: [
        { visibility: 0 },
        {
          users: {
            some: {
              userId: session.user.id,
            },
          },
        },
      ],
    },
  });

  return items;
}

async function create(session: Session, req: NextApiRequest): Promise<Project> {
  tracker.logEvent(session.user.email, "project-create");

  const { name, shortcode, visibility, workspaceId, color } = req.body;

  const result = await prisma.project.create({
    data: {
      name,
      shortcode,
      visibility,
      workspaceId,
      color,
    },
  });

  await prisma.projectUser.create({
    data: {
      projectId: result.id,
      userId: session.user.id,
      role: "owner",
    },
  });

  return result;
}
