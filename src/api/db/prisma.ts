import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/**
 * Local dev connects through DIRECT_URL (Supabase session mode, port 5432) when set.
 * DATABASE_URL uses the transaction pooler with `pgbouncer=true`, which turns off
 * prepared statements: every query then costs several network round trips (~5x slower
 * from here). Serverless production needs the transaction pooler, so it keeps
 * DATABASE_URL. Set PRISMA_DEV_USE_POOLER=1 to use DATABASE_URL locally too.
 */
function devDatabaseUrl(): string | undefined {
  const direct = process.env.DIRECT_URL;
  if (process.env.NODE_ENV !== "development" || !direct || process.env.PRISMA_DEV_USE_POOLER) {
    return undefined;
  }
  try {
    const url = new URL(direct);
    // Stay under Supabase's session-mode client limit (Prisma's default pool scales with CPUs).
    if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "5");
    return url.toString();
  } catch {
    return undefined;
  }
}

function createPrismaClient() {
  const url = devDatabaseUrl();
  return new PrismaClient({
    ...(url ? { datasources: { db: { url } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
