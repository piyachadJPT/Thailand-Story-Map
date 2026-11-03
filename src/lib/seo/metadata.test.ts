import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMetadata } from "./metadata";

const base = { title: "ป่าช้าผีดุ", description: "เรื่องเล่า", path: "/story/lamphun/x" };

test("canonical and og:url are absolute", () => {
  const meta = buildMetadata(base);
  assert.equal(meta.alternates?.canonical, "http://localhost:3000/story/lamphun/x");
  assert.equal((meta.openGraph as { url: string }).url, "http://localhost:3000/story/lamphun/x");
});

test("title is left to the layout template and never repeats the site name", () => {
  assert.equal(buildMetadata(base).title, "ป่าช้าผีดุ");
  assert.equal(buildMetadata({ ...base, title: "ป่าช้าผีดุ | TSM" }).title, "ป่าช้าผีดุ");
  assert.equal(buildMetadata({ ...base, title: "ป่าช้าผีดุ | Thailand Story Map" }).title, "ป่าช้าผีดุ");
  assert.deepEqual(buildMetadata({ ...base, absoluteTitle: true }).title, { absolute: "ป่าช้าผีดุ" });
});

test("noindex sets robots; follow is opt-in", () => {
  assert.equal(buildMetadata(base).robots, undefined);
  assert.deepEqual(buildMetadata({ ...base, noindex: true }).robots, { index: false, follow: false });
  assert.deepEqual(buildMetadata({ ...base, noindex: true, follow: true }).robots, { index: false, follow: true });
});

test("description is cleaned and cut to 155 characters", () => {
  const meta = buildMetadata({ ...base, description: `  <p>${"เรื่องเล่าบ้านร้าง ".repeat(30)}</p>\n` });
  const description = meta.description as string;
  assert.ok(description.length <= 155);
  assert.ok(description.endsWith("…"));
  assert.equal(/[<>\n]/.test(description), false);
});

test("falls back to the site OG image, or uses the given one", () => {
  const og = buildMetadata(base).openGraph as { images: { url: string }[] };
  assert.equal(og.images[0].url, "http://localhost:3000/opengraph-image");
  const custom = buildMetadata({ ...base, image: { url: "/og/story/a/b", alt: "x" } }).openGraph as {
    images: { url: string }[];
  };
  assert.equal(custom.images[0].url, "http://localhost:3000/og/story/a/b");
});

test("article fields and Twitter card", () => {
  const meta = buildMetadata({
    ...base,
    type: "article",
    publishedTime: "2026-10-01T00:00:00.000Z",
    modifiedTime: "2026-10-02T00:00:00.000Z",
    section: "เรื่องลี้ลับ",
    authors: ["สมชาย"],
  });
  const og = meta.openGraph as Record<string, unknown>;
  assert.equal(og.type, "article");
  assert.equal(og.publishedTime, "2026-10-01T00:00:00.000Z");
  assert.equal(og.section, "เรื่องลี้ลับ");
  assert.deepEqual(og.authors, ["สมชาย"]);
  assert.equal((meta.twitter as { card: string }).card, "summary_large_image");
});
