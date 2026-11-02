import { prisma } from "@/api/db/prisma";
import { ApiError, UnauthorizedError } from "@/api/common/errors";
import { UserRole, UserStatus } from "@/models/enums";
import { AUDIT_ACTION, AUDIT_TARGET } from "@/config/auditActions";
import { DUMMY_HASH, hashPassword, passwordPolicyError, verifyPassword } from "./password";
import { createAdminSession, type AdminSessionContext } from "./session";

/** Same message for every failure so it never reveals whether a username exists. */
export const LOGIN_ERROR_MESSAGE = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";

export async function loginAdmin(
  input: { username: string; password: string },
  meta: { ip: string; userAgent: string | null },
  verify: typeof verifyPassword = verifyPassword
) {
  const user = await prisma.user.findUnique({
    where: { username: input.username },
    select: { id: true, passwordHash: true, role: true, status: true },
  });
  const valid = await verify(input.password, user?.passwordHash ?? DUMMY_HASH);
  if (
    !user ||
    !user.passwordHash ||
    !valid ||
    user.role !== UserRole.ADMIN ||
    user.status !== UserStatus.ACTIVE
  ) {
    throw new UnauthorizedError(LOGIN_ERROR_MESSAGE);
  }
  const session = await createAdminSession(user.id, meta);
  await prisma.auditLog.create({
    data: {
      adminId: user.id,
      action: AUDIT_ACTION.ADMIN_LOGIN,
      targetType: AUDIT_TARGET.ADMIN,
      targetId: user.id,
      note: `IP ${meta.ip}`,
    },
  });
  return session;
}

export async function hasAnyAdmin() {
  const count = await prisma.user.count({
    where: { role: UserRole.ADMIN, passwordHash: { not: null } },
  });
  return count > 0;
}

export async function logoutOtherSessions(context: AdminSessionContext) {
  const { count } = await prisma.$transaction(async (tx) => {
    const result = await tx.adminSession.deleteMany({
      where: { userId: context.user.id, id: { not: context.session.id } },
    });
    await tx.auditLog.create({
      data: {
        adminId: context.user.id,
        action: AUDIT_ACTION.ADMIN_LOGOUT_ALL,
        targetType: AUDIT_TARGET.ADMIN,
        targetId: context.user.id,
        note: `ออกจากระบบ ${result.count} อุปกรณ์`,
      },
    });
    return result;
  });
  return { removed: count };
}

export async function changeAdminPassword(
  context: AdminSessionContext,
  input: { currentPassword: string; newPassword: string }
) {
  const user = await prisma.user.findUnique({
    where: { id: context.user.id },
    select: { passwordHash: true, username: true },
  });
  const valid = await verifyPassword(input.currentPassword, user?.passwordHash ?? DUMMY_HASH);
  if (!user?.passwordHash || !valid) throw new ApiError("รหัสผ่านเดิมไม่ถูกต้อง", 422, "INVALID_PASSWORD");
  const policy = passwordPolicyError(input.newPassword, user.username);
  if (policy) throw new ApiError(policy, 422, "WEAK_PASSWORD");
  if (await verifyPassword(input.newPassword, user.passwordHash))
    throw new ApiError("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสเดิม", 422, "WEAK_PASSWORD");

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: context.user.id }, data: { passwordHash }, select: { id: true } });
    await tx.adminSession.deleteMany({
      where: { userId: context.user.id, id: { not: context.session.id } },
    });
    await tx.auditLog.create({
      data: {
        adminId: context.user.id,
        action: AUDIT_ACTION.ADMIN_PASSWORD_CHANGE,
        targetType: AUDIT_TARGET.ADMIN,
        targetId: context.user.id,
      },
    });
  });
}

export async function listAdminSessions(context: AdminSessionContext) {
  const sessions = await prisma.adminSession.findMany({
    where: { userId: context.user.id, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      lastSeenAt: true,
      expiresAt: true,
      ip: true,
      userAgent: true,
    },
  });
  return sessions.map((session) => ({
    ...session,
    current: session.id === context.session.id,
  }));
}
