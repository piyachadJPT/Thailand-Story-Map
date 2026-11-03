import { test } from "node:test";
import assert from "node:assert/strict";
import { BACKOFFICE_PATH } from "@/config/backoffice";
import { isIndexable } from "./env";
import { buildRobots } from "./robots";

test("production allows crawling except the API, and points to the sitemap", () => {
  const robots = buildRobots(true);
  assert.deepEqual(robots.rules, { userAgent: "*", allow: "/", disallow: ["/api/"] });
  assert.equal(robots.sitemap, "http://localhost:3000/sitemap.xml");
});

test("preview / staging / dev block everything", () => {
  assert.deepEqual(buildRobots(false).rules, { userAgent: "*", disallow: "/" });
  assert.equal(buildRobots(false).sitemap, undefined);
});

test("robots never names the backoffice or private pages", () => {
  for (const indexable of [true, false]) {
    const text = JSON.stringify(buildRobots(indexable));
    assert.equal(text.includes(BACKOFFICE_PATH), false);
    assert.equal(text.includes("backoffice"), false);
    for (const page of ["/login", "/my-stories", "/story/edit"]) assert.equal(text.includes(page), false);
  }
});

test("indexable only on the production deployment", () => {
  assert.equal(isIndexable({ NODE_ENV: "production" }), true);
  assert.equal(isIndexable({ NODE_ENV: "production", VERCEL_ENV: "production" }), true);
  assert.equal(isIndexable({ NODE_ENV: "production", VERCEL_ENV: "preview" }), false);
  assert.equal(isIndexable({ NODE_ENV: "development" }), false);
  assert.equal(isIndexable({ NODE_ENV: "production", NEXT_PUBLIC_NOINDEX: "true" }), false);
});
