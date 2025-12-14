import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const url = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: url.hostname || "localhost",
  port: url.port ? parseInt(url.port, 10) : 3306,
  user: url.username || undefined,
  password: url.password || undefined,
  database: url.pathname.replace(/^\//, "") || undefined,
  connectionLimit: 5,
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


