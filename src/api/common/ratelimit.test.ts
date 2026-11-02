import { test } from "node:test";
import assert from "node:assert/strict";
import { MemoryRateLimiter } from "./ratelimit";

const rule = { limit: 3, windowMs: 60_000 };

test("allows requests within the limit", () => {
  const limiter = new MemoryRateLimiter(() => 1_000);
  for (let i = 0; i < 3; i++) assert.equal(limiter.limit("k", rule).success, true);
});

test("blocks past the limit and reports how long to wait", () => {
  let now = 0;
  const limiter = new MemoryRateLimiter(() => now);
  for (let i = 0; i < 3; i++) {
    limiter.limit("k", rule);
    now += 10_000;
  }
  const blocked = limiter.limit("k", rule);
  assert.equal(blocked.success, false);
  assert.equal(blocked.retryAfter, 30); // the first hit (t=0) expires at t=60s; now is t=30s
  assert.equal(limiter.limit("other", rule).success, true);
});

test("frees a slot once the window has passed, and reset clears the key", () => {
  let now = 0;
  const limiter = new MemoryRateLimiter(() => now);
  for (let i = 0; i < 3; i++) limiter.limit("k", rule);
  assert.equal(limiter.limit("k", rule).success, false);
  now = 60_001;
  assert.equal(limiter.limit("k", rule).success, true);
  for (let i = 0; i < 5; i++) limiter.limit("k", rule);
  limiter.reset("k");
  assert.equal(limiter.limit("k", rule).success, true);
});
