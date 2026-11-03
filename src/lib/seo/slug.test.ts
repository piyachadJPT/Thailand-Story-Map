import { test } from "node:test";
import assert from "node:assert/strict";
import { createStorySlug, randomSlugSuffix } from "./slug";

const SUFFIX = "k3x9qa";
const COMBINING = /^[ัิ-ฺ็-๎]/;
const wellFormed = (slug: string) => {
  assert.ok(!slug.includes("--"), `double dash: ${slug}`);
  assert.ok(!slug.startsWith("-") && !slug.endsWith("-"), `edge dash: ${slug}`);
};

test("Thai-only title", () => {
  assert.equal(createStorySlug("ตำนานพญานาค แม่น้ำโขง", SUFFIX), "ตำนานพญานาค-แม่น้ำโขง-k3x9qa");
});

test("Thai mixed with English and digits, lowercased", () => {
  assert.equal(createStorySlug("ผีโรงแรม Grand 1999", SUFFIX), "ผีโรงแรม-grand-1999-k3x9qa");
});

test("special characters and emoji become single dashes", () => {
  const slug = createStorySlug("  👻 บ้าน!!ร้าง??  (ตอนที่ 2) — จริงหรือ?  ", SUFFIX);
  assert.equal(slug, "บ้าน-ร้าง-ตอนที่-2-จริงหรือ-k3x9qa");
  wellFormed(slug);
});

test("long titles are cut to 60 characters on a word boundary", () => {
  const title = "ตำนานเล่าขานของหมู่บ้านริมแม่น้ำโขงที่ชาวบ้านเชื่อว่ามีพญานาคอาศัยอยู่ใต้น้ำมาหลายร้อยปี";
  const slug = createStorySlug(title, SUFFIX);
  const base = slug.slice(0, -(SUFFIX.length + 1));
  assert.ok(base.length <= 60, `base is ${base.length} chars`);
  assert.ok(title.startsWith(base));
  assert.ok(!COMBINING.test(title.slice(base.length)), "cut inside a syllable");
  wellFormed(slug);
});

test("a title with nothing usable becomes story-<id>", () => {
  assert.equal(createStorySlug("👻🔥✨", SUFFIX), "story-k3x9qa");
  assert.equal(createStorySlug("   ---   ", SUFFIX), "story-k3x9qa");
});

test("NFC: decomposed and composed input give the same slug", () => {
  const composed = createStorySlug("Café", SUFFIX);
  const decomposed = createStorySlug("Café", SUFFIX);
  assert.equal(composed, decomposed);
});

test("random suffix is 6 lowercase base36 characters", () => {
  for (let i = 0; i < 50; i++) assert.match(randomSlugSuffix(), /^[a-z0-9]{6}$/);
  assert.match(createStorySlug("เรื่องเล่า"), /^เรื่องเล่า-[a-z0-9]{6}$/);
});
