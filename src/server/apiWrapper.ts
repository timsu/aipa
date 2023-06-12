import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { logger } from "@/lib/logger";
import { SuccessResponse } from "@/types";

// api wrapper that takes a handler function and returns a next api handler, wrapping errors

export class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

type ResponseType<T> = NextApiResponse<string | T | SuccessResponse>;

export function apiWrapper<T>(func: (req: NextApiRequest, session: Session | null) => Promise<T>) {
  return async function handler(req: NextApiRequest, res: ResponseType<T>) {
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

export function streamingApiWrapper(
  func: (req: NextApiRequest, session: Session, res: NextApiResponse) => Promise<void>
) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        throw new ApiError(401, "Unauthorized");
      }

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Transfer-Encoding", "chunked");

      await func(req, session, res);
    } catch (err) {
      if (err instanceof ApiError) {
        streamWrite(res, { success: false, error: err.message, code: err.code });
      } else {
        logger.error(err);
        streamWrite(res, { success: false, error: "Internal server error", code: 500 });
      }
    } finally {
      res.end();
    }
  };
}

export function streamWrite(res: NextApiResponse, data: any) {
  res.write(JSON.stringify(data) + ",");
}
