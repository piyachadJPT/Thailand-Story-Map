import { test } from "node:test";
import assert from "node:assert/strict";
import { assertSameOrigin, getClientIp } from "./request";

function request(headers: Record<string, string>) {
  return new Request("https://storymap.example/api/admin/stories/1", { method: "PATCH", headers });
}

test("same origin passes", () => {
  assert.doesNotThrow(() =>
    assertSameOrigin(request({ origin: "https://storymap.example", host: "storymap.example" }))
  );
});

test("a different origin is rejected with 403", () => {
  assert.throws(
    () => assertSameOrigin(request({ origin: "https://evil.example", host: "storymap.example" })),
    { status: 403 }
  );
});

test("a missing Origin header is rejected", () => {
  assert.throws(() => assertSameOrigin(request({ host: "storymap.example" })), { status: 403 });
});

test("client IP prefers the first x-forwarded-for entry", () => {
  assert.equal(getClientIp(request({ "x-forwarded-for": " 203.0.113.9 , 10.0.0.1" })), "203.0.113.9");
  assert.equal(getClientIp(request({ "x-real-ip": "198.51.100.2" })), "198.51.100.2");
  assert.equal(getClientIp(request({})), "unknown");
});
