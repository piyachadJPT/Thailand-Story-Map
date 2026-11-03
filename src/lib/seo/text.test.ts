import { test } from "node:test";
import assert from "node:assert/strict";
import { plainText, truncateThai } from "./text";

const segmenter = new Intl.Segmenter("th", { granularity: "word" });
const words = (text: string) => [...segmenter.segment(text)].map((part) => part.segment);
/** Thai vowels/tone marks that must never start or be cut away from their consonant. */
const COMBINING = /^[ัิ-ฺ็-๎]/;

test("short text is returned unchanged, without an ellipsis", () => {
  assert.equal(truncateThai("ตำนานพญานาค", 155), "ตำนานพญานาค");
});

test("cuts on a Thai word boundary and adds …", () => {
  const text = "ตำนานพญานาคแม่น้ำโขงที่หนองคาย";
  const out = truncateThai(text, 12);
  assert.equal(out, "ตำนานพญานาค…");
  assert.ok(out.length <= 12);
  const kept = out.slice(0, -1);
  // The kept part is exactly a run of whole words from the start.
  let joined = "";
  for (const word of words(text)) {
    if (joined.length >= kept.length) break;
    joined += word;
  }
  assert.equal(joined, kept);
});

test("never separates vowels or tone marks from their consonant", () => {
  const text = "ที่นี่มีเรื่องเล่าน่ากลัวเกี่ยวกับผู้หญิงในชุดไทยที่เดินอยู่ริมน้ำทุกคืนวันพระ";
  for (let max = 4; max < text.length; max++) {
    const out = truncateThai(text, max);
    assert.ok(out.length <= max, `length ${out.length} > ${max}`);
    const rest = text.slice(out.length - 1);
    assert.ok(!COMBINING.test(rest), `cut before a combining mark at max=${max}: ${out}`);
  }
});

test("an overlong single word falls back to whole grapheme clusters", () => {
  const out = truncateThai("น้ำ".repeat(20), 8);
  assert.ok(out.endsWith("…"));
  assert.ok(!COMBINING.test("น้ำ".repeat(20).slice(out.length - 1)));
});

test("collapses whitespace and strips markup first", () => {
  assert.equal(plainText("  <b>เรื่อง</b>\n\n  ผี   **ดุ**  "), "เรื่อง ผี ดุ");
  assert.equal(truncateThai("ก\n\n\nข   ค", 50), "ก ข ค");
});
