import { NextResponse } from "next/server";
import { handleRouteError } from "@/api/common/http";
import { assertSameOrigin } from "@/api/common/request";
import { ADMIN_COOKIE, adminCookieOptions, deleteAdminSession, requireAdminSession } from "@/api/admin/session";

export async function POST(request: Request) {
  try {
    const { session } = await requireAdminSession();
    assertSameOrigin(request);
    await deleteAdminSession(session.id);
    const response = NextResponse.json({ success: true, data: { ok: true } });
    response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions(new Date(0)), maxAge: 0 });
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
