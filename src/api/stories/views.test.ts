import { test } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/api/db/prisma";
import { databaseMock, restoreDatabaseMocksAfterEach } from "@/api/testing/prismaMock";
import { isBotUserAgent, recordStoryView } from "./views";

restoreDatabaseMocksAfterEach();

const CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

let ipCounter = 0;
function viewRequest(headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/stories/x/view", {
    method: "POST",
    headers: { "user-agent": CHROME, "x-forwarded-for": `10.0.0.${++ipCounter}`, ...headers },
  });
}
const increments = () => databaseMock(prisma, "$executeRaw", (async () => 1) as never);

test("crawlers, link previews and audits are not counted", async () => {
  const update = increments();
  for (const ua of [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "facebookexternalhit/1.1",
    "Mozilla/5.0 (Linux) Chrome-Lighthouse",
    "Twitterbot/1.0",
    "curl/8.4.0",
    "",
  ]) {
    assert.equal(isBotUserAgent(ua), true, ua);
    assert.equal(await recordStoryView(viewRequest({ "user-agent": ua }), "story-bots"), false, ua);
  }
  assert.equal(update.mock.callCount(), 0);
  assert.equal(isBotUserAgent(CHROME), false);
});

test("prefetch requests are not counted", async () => {
  const update = increments();
  assert.equal(await recordStoryView(viewRequest({ purpose: "prefetch" }), "story-prefetch"), false);
  assert.equal(await recordStoryView(viewRequest({ "sec-purpose": "prefetch;prerender" }), "story-prefetch"), false);
  assert.equal(update.mock.callCount(), 0);
});

test("the same viewer counts once per story within 6 hours", async () => {
  const update = increments();
  const ip = { "x-forwarded-for": "203.0.113.7" };
  assert.equal(await recordStoryView(viewRequest(ip), "story-a"), true);
  assert.equal(await recordStoryView(viewRequest(ip), "story-a"), false);
  assert.equal(await recordStoryView(viewRequest(ip), "story-a"), false);
  // A different story, or a different viewer, still counts.
  assert.equal(await recordStoryView(viewRequest(ip), "story-b"), true);
  assert.equal(await recordStoryView(viewRequest({ "x-forwarded-for": "203.0.113.8" }), "story-a"), true);
  assert.equal(update.mock.callCount(), 3);
});

test("a signed-in viewer is keyed by user id, not IP", async () => {
  increments();
  assert.equal(await recordStoryView(viewRequest({ "x-forwarded-for": "198.51.100.1" }), "story-c", "user-1"), true);
  assert.equal(await recordStoryView(viewRequest({ "x-forwarded-for": "198.51.100.2" }), "story-c", "user-1"), false);
});

test("only published stories are incremented, without touching updated_at", async () => {
  const update = increments();
  await recordStoryView(viewRequest(), "story-d");
  const [strings, ...values] = update.mock.calls[0].arguments as unknown as [TemplateStringsArray, ...unknown[]];
  const sql = strings.join("?");
  assert.match(sql, /SET view_count = view_count \+ 1/);
  assert.match(sql, /status = 'APPROVED'/);
  assert.doesNotMatch(sql, /updated_at/);
  assert.deepEqual(values, ["story-d"]);
});
