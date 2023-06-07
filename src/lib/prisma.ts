import { PrismaClient } from "@prisma/client";

declare global {
  var prismaClient: PrismaClient;
}

let prisma: PrismaClient;
if (process.env.NODE_ENV != "development") {
  prisma = new PrismaClient();
} else {
  // avoid re-creating prisma in hot-reload case
  if (!globalThis.prismaClient) {
    globalThis.prismaClient = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = globalThis.prismaClient;
}

// needed for next.js server props
export function serialize<T extends Object>(model: T): T {
  const m = model as any;
  Object.keys(m).forEach((key) => {
    if (m[key] instanceof Date) {
      m[key] = m[key].toISOString();
    } else if (m[key] instanceof Object) {
      m[key] = serialize(m[key]);
    } else if (Array.isArray(m[key])) {
      m[key] = m[key].map((item: any) => (item instanceof Object ? serialize(item) : item));
    }
  });
  return model;
}

export default prisma;
