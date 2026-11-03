import { prisma } from "@/api/db/prisma";
import { tryRateLimit } from "@/api/common/ratelimit";
import { getClientIp } from "@/api/common/request";

/** Crawlers, link-preview fetchers, audits and scripts — never counted as reads. */
const BOT_USER_AGENT =
  /bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|meta-externalagent|preview|lighthouse|pagespeed|headless|phantomjs|puppeteer|playwright|selenium|embedly|quora link|whatsapp|skypeuripreview|vkshare|w3c_validator|python-requests|python-urllib|curl\/|wget|httpclient|okhttp|axios|node-fetch|undici|go-http-client|java\/|libwww|scrapy|feedfetcher|mediapartners|google-inspectiontool|chrome-lighthouse/i;

export function isBotUserAgent(userAgent: string | null): boolean {
  return !userAgent?.trim() || BOT_USER_AGENT.test(userAgent);
}

/** Next.js link prefetches and browser speculative loads. */
export function isPrefetch(headers: Headers): boolean {
  const purpose = `${headers.get("purpose") ?? ""} ${headers.get("sec-purpose") ?? ""}`.toLowerCase();
  return purpose.includes("prefetch") || headers.has("next-router-prefetch");
}

/**
 * Counts one read of a published story. Skips bots and prefetches, and counts
 * the same viewer (user id, else IP) at most once per story every 6 hours.
 * Returns whether the view was counted; the HTTP response never reveals it.
 */
export async function recordStoryView(
  request: Request,
  storyId: string,
  viewerId?: string | null
): Promise<boolean> {
  if (isBotUserAgent(request.headers.get("user-agent")) || isPrefetch(request.headers)) {
    return false;
  }
  const viewer = viewerId ? `user:${viewerId}` : `ip:${getClientIp(request)}`;
  if (!(await tryRateLimit("story:view", `${viewer}:${storyId}`))) return false;
  // Raw SQL on purpose: Prisma's @updatedAt would bump updated_at on every read,
  // which feeds "อัปเดต", dateModified and the sitemap's lastmod.
  const count = await prisma.$executeRaw`
    UPDATE stories SET view_count = view_count + 1
    WHERE id = ${storyId} AND status = 'APPROVED'`;
  return count > 0;
}
