/** Hosts allowed in next.config images.remotePatterns; others are served unoptimized. */
export function isOptimizableImage(url: string): boolean {
  try {
    const { protocol, hostname, pathname } = new URL(url);
    if (protocol !== "https:") return false;
    if (hostname.endsWith(".supabase.co")) return pathname.startsWith("/storage/v1/object/public/");
    return hostname.endsWith(".r2.dev");
  } catch {
    return url.startsWith("/");
  }
}
