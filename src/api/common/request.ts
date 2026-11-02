import { ForbiddenError } from "./errors";

/**
 * Client IP from proxy headers. Only trustworthy when deployed behind a proxy
 * that overwrites these headers (e.g. Vercel); otherwise clients can spoof them.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  const real = request.headers.get("x-real-ip")?.trim();
  return real || "unknown";
}

function allowedOrigins(request: Request) {
  const origins = new Set<string>();
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    try {
      origins.add(new URL(configured).origin);
    } catch {
      // ignore malformed config; fall back to the request host
    }
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
    origins.add(`${proto}://${host}`);
  }
  return origins;
}

/** CSRF guard for admin mutations: the Origin header must be this site. */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins(request).has(origin)) {
    throw new ForbiddenError("คำขอไม่ได้มาจากเว็บไซต์นี้");
  }
}
