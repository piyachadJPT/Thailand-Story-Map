import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/api/db/prisma";
import { UnauthorizedError } from "@/api/common/errors";
import { UserRole, UserStatus } from "@/models/enums";

export const ADMIN_SESSION_ABSOLUTE_MS = 8 * 60 * 60 * 1000;
export const ADMIN_SESSION_IDLE_MS = 2 * 60 * 60 * 1000;
/** lastSeenAt is written at most this often, to keep DB writes low. */
export const ADMIN_SESSION_TOUCH_MS = 5 * 60 * 1000;

export const ADMIN_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-tsm_admin" : "tsm_admin";

export function adminCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    expires,
  };
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const sessionUserSelect = {
  id: true,
  name: true,
  email: true,
  username: true,
  image: true,
  role: true,
  status: true,
} as const;

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  image: string | null;
  role: string;
  status: string;
};

export type AdminSessionContext = {
  user: AdminSessionUser;
  session: { id: string; createdAt: Date; expiresAt: Date; lastSeenAt: Date };
};

/** Creates a session; the raw token goes in the cookie, only its hash is stored. */
export async function createAdminSession(
  userId: string,
  meta: { ip?: string | null; userAgent?: string | null },
  now = new Date()
) {
  await prisma.adminSession.deleteMany({
    where: {
      userId,
      OR: [
        { expiresAt: { lte: now } },
        { lastSeenAt: { lte: new Date(now.getTime() - ADMIN_SESSION_IDLE_MS) } },
      ],
    },
  });
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_ABSOLUTE_MS);
  const session = await prisma.adminSession.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
      lastSeenAt: now,
      ip: meta.ip?.slice(0, 100) ?? null,
      userAgent: meta.userAgent?.slice(0, 500) ?? null,
    },
    select: { id: true },
  });
  return { token, expiresAt, sessionId: session.id };
}

/**
 * Looks up a session by raw token and checks expiry, idle time, role and
 * status against the database. Invalid sessions are deleted.
 */
export async function resolveAdminSession(
  token: string | undefined | null,
  now = new Date()
): Promise<AdminSessionContext | null> {
  if (!token || token.length > 200) return null;
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      id: true,
      createdAt: true,
      expiresAt: true,
      lastSeenAt: true,
      user: { select: sessionUserSelect },
    },
  });
  if (!session) return null;

  const expired =
    session.expiresAt.getTime() <= now.getTime() ||
    now.getTime() - session.lastSeenAt.getTime() > ADMIN_SESSION_IDLE_MS;
  const allowed =
    session.user.role === UserRole.ADMIN && session.user.status === UserStatus.ACTIVE;
  if (expired || !allowed) {
    await prisma.adminSession.deleteMany({ where: { id: session.id } });
    return null;
  }

  let lastSeenAt = session.lastSeenAt;
  if (now.getTime() - lastSeenAt.getTime() > ADMIN_SESSION_TOUCH_MS) {
    lastSeenAt = now;
    await prisma.adminSession.updateMany({
      where: { id: session.id },
      data: { lastSeenAt: now },
    });
  }

  return {
    user: session.user,
    session: {
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastSeenAt,
    },
  };
}

export async function readAdminToken() {
  return (await cookies()).get(ADMIN_COOKIE)?.value;
}

export async function getAdminSession() {
  return resolveAdminSession(await readAdminToken());
}

export async function requireAdminSession(): Promise<AdminSessionContext> {
  const context = await getAdminSession();
  if (!context) throw new UnauthorizedError("กรุณาเข้าสู่ระบบผู้ดูแล");
  return context;
}

export async function deleteAdminSession(sessionId: string) {
  await prisma.adminSession.deleteMany({ where: { id: sessionId } });
}
