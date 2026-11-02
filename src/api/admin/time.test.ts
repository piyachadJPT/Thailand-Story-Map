import { test } from "node:test";
import assert from "node:assert/strict";
import { bangkokDayKey, bangkokDayStart, fillDailySeries, percentChange, rangeBounds } from "./time";

test("days follow Asia/Bangkok, not UTC", () => {
  // 18:30 UTC on 1 Jan is 01:30 on 2 Jan in Bangkok.
  assert.equal(bangkokDayKey(new Date("2026-01-01T18:30:00Z")), "2026-01-02");
  assert.equal(bangkokDayKey(new Date("2026-01-01T16:59:59Z")), "2026-01-01");
  assert.equal(bangkokDayStart("2026-01-02").toISOString(), "2026-01-01T17:00:00.000Z");
});

test("range bounds cover today plus the previous days, with an equal previous window", () => {
  const now = new Date("2026-03-10T03:00:00Z"); // 10:00 in Bangkok
  const { start, previousStart } = rangeBounds(7, now);
  assert.equal(bangkokDayKey(start), "2026-03-04");
  assert.equal(start.toISOString(), "2026-03-03T17:00:00.000Z");
  assert.equal(bangkokDayKey(previousStart), "2026-02-25");
});

test("missing days are filled with zero", () => {
  const start = bangkokDayStart("2026-03-01");
  const series = fillDailySeries(
    [
      { day: "2026-03-01", published: 2, other: 1 },
      { day: "2026-03-03", published: 4, other: 0 },
    ],
    start,
    4,
    ["published", "other"] as const
  );
  assert.deepEqual(series, [
    { day: "2026-03-01", published: 2, other: 1 },
    { day: "2026-03-02", published: 0, other: 0 },
    { day: "2026-03-03", published: 4, other: 0 },
    { day: "2026-03-04", published: 0, other: 0 },
  ]);
});

test("percent change, including a previous window of zero", () => {
  assert.deepEqual(percentChange(15, 10), { percent: 50, isNew: false });
  assert.deepEqual(percentChange(5, 10), { percent: -50, isNew: false });
  assert.deepEqual(percentChange(3, 0), { percent: null, isNew: true });
  assert.deepEqual(percentChange(0, 0), { percent: null, isNew: false });
});
