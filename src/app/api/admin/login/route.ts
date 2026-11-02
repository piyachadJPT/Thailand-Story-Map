import { NextResponse } from "next/server";
import { handleRouteError } from "@/api/common/http";
import { enforceRateLimit, resetRateLimit } from "@/api/common/ratelimit";
import { assertSameOrigin, getClientIp } from "@/api/common/request";
import { loginAdmin } from "@/api/admin/account";
import { ADMIN_COOKIE, adminCookieOptions } from "@/api/admin/session";
import { adminLoginSchema } from "@/models/schemas/admin";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = getClientIp(request);
    await enforceRateLimit("admin:login:ip", ip);
    // Never log the body: it holds the password.
    const input = adminLoginSchema.parse(await request.json());
    await enforceRateLimit("admin:login:user", input.username);
    const session = await loginAdmin(input, { ip, userAgent: request.headers.get("user-agent") });
    await resetRateLimit("admin:login:user", input.username);
    const response = NextResponse.json({ success: true, data: { ok: true } });
    response.cookies.set(ADMIN_COOKIE, session.token, adminCookieOptions(session.expiresAt));
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
