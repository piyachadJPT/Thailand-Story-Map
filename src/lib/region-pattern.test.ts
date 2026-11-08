import { test } from "node:test";
import assert from "node:assert/strict";
import { regionLai } from "./region-pattern";
import { regionOrder } from "./thai-provinces";

test("every region has its own pattern", () => {
  const classes = regionOrder.map((region) => regionLai(region));
  assert.equal(new Set(classes).size, regionOrder.length);
});

test("อีสานและตะวันออกไม่สับสนกัน", () => {
  assert.equal(regionLai("ภาคตะวันออกเฉียงเหนือ"), "lai-isan");
  assert.equal(regionLai("ภาคตะวันออก"), "lai-east");
});

test("unknown region falls back to the central pattern", () => {
  assert.equal(regionLai("ภาคอื่น"), "lai-central");
});
