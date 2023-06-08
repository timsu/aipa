import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { logger } from "./logger";
import { SuccessResponse } from "../client/api";

// api wrapper that takes a handler function and returns a next api handler, wrapping errors

export class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

export function apiWrapper<T>(func: (req: NextApiRequest, session: Session | null) => Promise<T>) {
  return async function handler(
    req: NextApiRequest,
    res: NextApiResponse<string | T | SuccessResponse>
  ) {
    try {
      const session = await getServerSession(req, res, authOptions);
      const result = await func(req, session);

      if (!result) return res.json({ success: true });
      return res.json(result);
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.code).send(err.message);
      } else {
        logger.error(err);
        res.status(500).send("Internal server error");
      }
    }
  };
}

export function authApiWrapper<T>(func: (req: NextApiRequest, session: Session) => Promise<T>) {
  return apiWrapper(async function (req: NextApiRequest, session: Session | null) {
    if (!session) {
      throw new ApiError(401, "Unauthorized");
    }
    return await func(req, session);
  });
}
