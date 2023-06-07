import { PrismaClient } from "@prisma/client";

interface Window {
  slashMenuMount: (instance: any, shown: boolean) => void;
}

declare namespace NodeJS {
  interface Global {
    prisma: PrismaClient;
  }
}

declare var global: NodeJS.Global & typeof globalThis;
