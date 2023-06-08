import { getServerSession, Session } from "next-auth";

import prisma from "@/lib/prisma";
import { tracker } from "@/lib/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma, { Workspace } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/lib/apiWrapper";

export default authApiWrapper<Workspace[] | Workspace>(function handler(
  req: NextApiRequest,
  session: Session
) {
  if (req.method == "POST") {
    return create(session, req);
  } else if (req.method == "PUT") {
    return update(session, req);
  } else {
    return list(session, req);
  }
});

async function list(session: Session, req: NextApiRequest): Promise<Workspace[]> {
  const forms = await prisma.workspace.findMany({
    where: {
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  return forms;
}

async function create(session: Session, req: NextApiRequest): Promise<Workspace> {
  tracker.logEvent(session.user.email, "workspace-create");

  const { name } = req.body;

  const result = await prisma.workspace.create({
    data: {
      name,
      users: {
        create: {
          userId: session.user.id,
          role: "owner",
        },
      },
    },
  });

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      activeWorkspace: result.id,
    },
  });

  return result;
}

async function update(session: Session, req: NextApiRequest): Promise<Workspace> {
  tracker.logEvent(session.user.email, "workspace-edit", { keys: Object.keys(req.body) });

  const { id, options, ...updates } = req.body;

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: req.body.id,
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });
  if (!workspace) throw new ApiError(404, "Form not found");

  let result = null;
  if (Object.keys(updates).length > 0) {
    result = await prisma.workspace.update({
      where: {
        id: workspace.id,
      },
      data: updates,
    });
  }

  return result || workspace;
}
