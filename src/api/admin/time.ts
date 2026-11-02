/** Asia/Bangkok is UTC+7 all year (no daylight saving). */
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD of an instant, as seen in Bangkok. */
export function bangkokDayKey(date: Date) {
  return new Date(date.getTime() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}

/** The instant a Bangkok calendar day (YYYY-MM-DD) begins. */
export function bangkokDayStart(dayKey: string) {
  return new Date(Date.parse(`${dayKey}T00:00:00.000Z`) - BANGKOK_OFFSET_MS);
}

/**
 * Current window = the last `days` Bangkok days including today.
 * Previous window = the same number of days right before it.
 */
export function rangeBounds(days: number, now = new Date()) {
  const todayStart = bangkokDayStart(bangkokDayKey(now));
  const start = new Date(todayStart.getTime() - (days - 1) * DAY_MS);
  const previousStart = new Date(start.getTime() - days * DAY_MS);
  return { start, previousStart, end: now };
}

/** Day keys from `start` for `days` days. */
export function dayKeys(start: Date, days: number) {
  return Array.from({ length: days }, (_, index) =>
    bangkokDayKey(new Date(start.getTime() + index * DAY_MS))
  );
}

/** Zero-fills a sparse per-day series so every day in the window is present. */
export function fillDailySeries<K extends string>(
  rows: ({ day: string } & Record<K, number>)[],
  start: Date,
  days: number,
  fields: readonly K[]
) {
  const byDay = new Map(rows.map((row) => [row.day, row]));
  return dayKeys(start, days).map((day) => {
    const row = byDay.get(day);
    const point = { day } as { day: string } & Record<K, number>;
    for (const field of fields) {
      (point as Record<string, number | string>)[field] = Number(row?.[field] ?? 0);
    }
    return point;
  });
}

/** % change vs the previous window; `isNew` when the previous window was 0. */
export function percentChange(current: number, previous: number) {
  if (previous === 0) return { percent: null, isNew: current > 0 };
  return { percent: Math.round(((current - previous) / previous) * 1000) / 10, isNew: false };
}
