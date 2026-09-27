import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let storyCreateLimit: Ratelimit | null = null;

export function isRateLimitConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  return Redis.fromEnv();
}

/** 5 story submissions per hour per identifier (user id or IP) */
export function getStoryCreateRateLimit(): Ratelimit | null {
  if (!isRateLimitConfigured()) return null;
  if (!storyCreateLimit) {
    storyCreateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "ratelimit:story:create",
    });
  }
  return storyCreateLimit;
}
