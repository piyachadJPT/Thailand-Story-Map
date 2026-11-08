import { test } from "node:test";
import assert from "node:assert/strict";
import { thaiOrdinal, toThaiDigits } from "./thai-digits";

test("toThaiDigits converts every Arabic digit", () => {
  assert.equal(toThaiDigits(1234567890), "๑๒๓๔๕๖๗๘๙๐");
});

test("toThaiDigits keeps non-digit characters", () => {
  assert.equal(toThaiDigits("พ.ศ. 2569"), "พ.ศ. ๒๕๖๙");
});

test("thaiOrdinal pads to two digits", () => {
  assert.equal(thaiOrdinal(1), "๐๑");
  assert.equal(thaiOrdinal(12), "๑๒");
  assert.equal(thaiOrdinal(105), "๑๐๕");
});
