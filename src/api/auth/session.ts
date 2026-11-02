import { auth } from "@/auth";
import { ForbiddenError, UnauthorizedError } from "@/api/common/errors";
import { UserStatus } from "@/models/enums";

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
