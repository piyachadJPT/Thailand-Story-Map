import { test } from "node:test";
import assert from "node:assert/strict";
import { shapeThaiForOg } from "./og-thai";

const code = (text: string) => [...text].map((c) => c.codePointAt(0)!.toString(16));

test("tone marks above an upper vowel use the raised glyph", () => {
  assert.deepEqual(code(shapeThaiForOg("ที่")), ["e17", "e35", "f748"]);
  assert.deepEqual(code(shapeThaiForOg("เรื่อง")), ["e40", "e23", "e37", "f748", "e2d", "e07"]);
  assert.deepEqual(code(shapeThaiForOg("น้ำ")), ["e19", "f749", "e33"]);
});

test("tall consonants shift their marks left", () => {
  assert.deepEqual(code(shapeThaiForOg("ป่า")), ["e1b", "f848", "e32"]);
  assert.deepEqual(code(shapeThaiForOg("ปี")), ["e1b", "f835"]);
});

test("plain text, Latin and digits pass through unchanged", () => {
  for (const text of ["เล่า", "ลำพูน", "Thailand Story Map 77", ""]) {
    assert.equal(shapeThaiForOg(text), text);
  }
});

test("every original character keeps a visible glyph (nothing is dropped)", () => {
  const text = "เรื่องลี้ลับ ที่นี่ ป่าช้า ทั่วไทย พระที่นั่ง ญู ฐุ";
  assert.equal([...shapeThaiForOg(text)].length, [...text].length);
});
