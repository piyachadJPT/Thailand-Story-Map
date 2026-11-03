import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TooManyRequestsError } from "./errors";

export type RateLimitBucket =
  | "story:create"
  | "story:update"
  | "upload"
  | "report"
  | "geocode"
  | "story:view"
  | "admin:login:ip"
  | "admin:login:user";

type Rule = { limit: number; window: Duration; windowMs: number };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export const RATE_LIMITS: Record<RateLimitBucket, Rule> = {
  "story:create": { limit: 5, window: "1 h", windowMs: HOUR },
  "story:update": { limit: 30, window: "1 h", windowMs: HOUR },
  upload: { limit: 20, window: "1 h", windowMs: HOUR },
  report: { limit: 5, window: "1 h", windowMs: HOUR },
  geocode: { limit: 60, window: "1 m", windowMs: MINUTE },
  /** One counted view per viewer and story every 6 hours. */
  "story:view": { limit: 1, window: "6 h", windowMs: 6 * HOUR },
  "admin:login:ip": { limit: 10, window: "15 m", windowMs: 15 * MINUTE },
  "admin:login:user": { limit: 5, window: "15 m", windowMs: 15 * MINUTE },
};

type Decision = { success: boolean; retryAfter: number };

/** Sliding-window log kept in process memory. Not shared between instances. */
export class MemoryRateLimiter {
  private hits = new Map<string, number[]>();
  private lastSweep = 0;

  constructor(private now: () => number = Date.now) {}

  limit(key: string, rule: Pick<Rule, "limit" | "windowMs">): Decision {
    const now = this.now();
    this.sweep(now);
    const since = now - rule.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((at) => at > since);
    if (recent.length >= rule.limit) {
      this.hits.set(key, recent);
      const retryAfter = Math.max(1, Math.ceil((recent[0] + rule.windowMs - now) / 1000));
      return { success: false, retryAfter };
    }
    recent.push(now);
    this.hits.set(key, recent);
    return { success: true, retryAfter: 0 };
  }

  reset(key: string) {
    this.hits.delete(key);
  }

  /** Drop keys whose newest hit is older than the longest window. */
  private sweep(now: number) {
    if (now - this.lastSweep < MINUTE) return;
    this.lastSweep = now;
    const longest = Math.max(...Object.values(RATE_LIMITS).map((rule) => rule.windowMs));
    for (const [key, hits] of this.hits) {
      if ((hits.at(-1) ?? 0) <= now - longest) this.hits.delete(key);
    }
  }
}

const memory = new MemoryRateLimiter();
const upstash = new Map<RateLimitBucket, Ratelimit>();
let warnedMemoryInProduction = false;

function isUpstashConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function upstashLimiter(bucket: RateLimitBucket) {
  let limiter = upstash.get(bucket);
  if (!limiter) {
    const rule = RATE_LIMITS[bucket];
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(rule.limit, rule.window),
      prefix: `ratelimit:${bucket}`,
    });
    upstash.set(bucket, limiter);
  }
  return limiter;
}

function memoryDecision(bucket: RateLimitBucket, identifier: string) {
  if (process.env.NODE_ENV === "production" && !warnedMemoryInProduction) {
    warnedMemoryInProduction = true;
    console.warn(
      "[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN not set: using in-memory limits, which are not shared between instances."
    );
  }
  return memory.limit(`${bucket}:${identifier}`, RATE_LIMITS[bucket]);
}

async function decide(bucket: RateLimitBucket, identifier: string): Promise<Decision> {
  if (!isUpstashConfigured()) return memoryDecision(bucket, identifier);
  try {
    const result = await upstashLimiter(bucket).limit(identifier);
    return {
      success: result.success,
      retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error("[ratelimit] Upstash failed, falling back to memory", error);
    return memoryDecision(bucket, identifier);
  }
}

/** Counts one attempt; throws TooManyRequestsError when the bucket is full. */
export async function enforceRateLimit(bucket: RateLimitBucket, identifier: string) {
  const decision = await decide(bucket, identifier);
  if (!decision.success) throw new TooManyRequestsError(decision.retryAfter);
}

/** Counts one attempt; false when the bucket is full (for callers that must not fail). */
export async function tryRateLimit(bucket: RateLimitBucket, identifier: string) {
  return (await decide(bucket, identifier)).success;
}

/** Clears an identifier's counter (e.g. after a successful admin login). */
export async function resetRateLimit(bucket: RateLimitBucket, identifier: string) {
  memory.reset(`${bucket}:${identifier}`);
  if (!isUpstashConfigured()) return;
  try {
    await upstashLimiter(bucket).resetUsedTokens(identifier);
  } catch (error) {
    console.error("[ratelimit] Upstash reset failed", error);
  }
}
