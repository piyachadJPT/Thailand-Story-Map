import { NextResponse } from "next/server";
import { handleRouteError } from "@/api/common/http";
import { assertSameOrigin } from "@/api/common/request";
import { ADMIN_COOKIE, adminCookieOptions, deleteAdminSession, getAdminSession } from "@/api/admin/session";

/** Always clears the cookie, even when the session already expired. */
export async function POST(request: Request) {
  try {
    const context = await getAdminSession();
    assertSameOrigin(request);
    if (context) await deleteAdminSession(context.session.id);
    const response = NextResponse.json({ success: true, data: { ok: true } });
    response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions(new Date(0)), maxAge: 0 });
    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
