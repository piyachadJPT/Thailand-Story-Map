import { auth } from "@/auth";
import { ForbiddenError, UnauthorizedError } from "@/api/common/errors";
import { UserRole, UserStatus } from "@/models/enums";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError("Sign in required");
  if (user.status === UserStatus.BANNED) {
    throw new ForbiddenError("บัญชีนี้ถูกระงับการใช้งาน");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== UserRole.ADMIN) {
    throw new ForbiddenError("Admin access required");
  }
  return user;
}
