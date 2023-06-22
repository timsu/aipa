import { getServerSession, Session } from "next-auth";

import prisma from "@/server/prisma";
import { tracker } from "@/server/tracker";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Prisma, { Project, Workspace } from "@prisma/client";

import type { NextApiRequest, NextApiResponse } from "next";
import { ApiError, authApiWrapper } from "@/server/apiWrapper";
import { sqltag } from "@prisma/client/runtime";
import { getProject } from "@/server/loaders";

export default authApiWrapper<Project>(async function handler(
  req: NextApiRequest,
  session: Session
) {
  const id = req.query.id as string;

  const project = await getProject(id, session);
  if (!project) throw new ApiError(404, "Project not found");

  if (req.method == "PUT") {
    return update(session, project, req);
  } else {
    return get(project, req);
  }
});

async function get(project: Project, req: NextApiRequest): Promise<Project> {
  return project;
}

async function update(session: Session, item: Project, req: NextApiRequest): Promise<Project> {
  tracker.logEvent(session.user.email, "project-edit", { keys: Object.keys(req.body) });

  const { ...updates } = req.body;

  const shortcodeChanged = updates.shortcode && updates.shortcode !== item.shortcode;

  let result = null;
  if (Object.keys(updates).length > 0) {
    result = await prisma.project.update({
      where: {
        id: item.id,
      },
      data: updates,
    });
  }

  if (result && shortcodeChanged) {
    // we will need to update all the issues that have this shortcode
    await prisma.$queryRaw(
      sqltag`
      UPDATE issues
      SET identifier = REPLACE(identifier, ${item.shortcode}, ${updates.shortcode})
      WHERE "projectId" = ${item.id}`
    );
  }

  return result || item;
}
