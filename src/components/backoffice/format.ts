/** Number and date formatting for the backoffice: th-TH, Asia/Bangkok. */
const TIME_ZONE = "Asia/Bangkok";
const LOCALE = "th-TH";

const numberFormat = new Intl.NumberFormat(LOCALE);
const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});
const dateFormat = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, dateStyle: "medium" });
const dayShortFormat = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, day: "numeric", month: "short" });
const timeFormat = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit" });
const hourFormat = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "numeric", hourCycle: "h23" });
const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto", style: "short" });

type DateInput = string | number | Date;
const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

export const formatNumber = (value: number) => numberFormat.format(value);

/** 12,400 → "12.4K"; small numbers keep their commas. */
export const formatCompact = (value: number) =>
  Math.abs(value) >= 10_000 ? compactFormat.format(value) : numberFormat.format(value);

export const formatDateTime = (value: DateInput) => dateTimeFormat.format(toDate(value));
export const formatDate = (value: DateInput) => dateFormat.format(toDate(value));
export const formatTime = (value: DateInput) => timeFormat.format(toDate(value));

/** "2026-03-04" (a Bangkok day key) → "4 มี.ค." */
export const formatDayKey = (dayKey: string) => dayShortFormat.format(new Date(`${dayKey}T12:00:00+07:00`));

/** "3 ชม. ที่แล้ว" */
export function formatRelative(value: DateInput, now = Date.now()) {
  const seconds = Math.round((toDate(value).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 45) return "เมื่อสักครู่";
  if (abs < 3600) return relativeFormat.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return relativeFormat.format(Math.round(seconds / 3600), "hour");
  if (abs < 30 * 86_400) return relativeFormat.format(Math.round(seconds / 86_400), "day");
  if (abs < 365 * 86_400) return relativeFormat.format(Math.round(seconds / (30 * 86_400)), "month");
  return relativeFormat.format(Math.round(seconds / (365 * 86_400)), "year");
}

/** Waiting time: "5 ชม.", "2 วัน" */
export function formatDuration(hours: number) {
  if (hours < 1) return "ไม่ถึง 1 ชม.";
  if (hours < 48) return `${formatNumber(Math.floor(hours))} ชม.`;
  return `${formatNumber(Math.floor(hours / 24))} วัน`;
}

export function hoursSince(value: DateInput, now = Date.now()) {
  return (now - toDate(value).getTime()) / 3_600_000;
}

export function greeting(now = new Date()) {
  const hour = Number(hourFormat.format(now));
  if (hour < 12) return "สวัสดีตอนเช้า";
  if (hour < 17) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
}

/** Bangkok day key ("YYYY-MM-DD") of an instant. */
export function dayKeyOf(value: DateInput) {
  return new Date(toDate(value).getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
}

/** "วันนี้", "เมื่อวาน" or a full date, for grouping timelines. */
export function dayHeading(dayKey: string, now = new Date()) {
  const today = dayKeyOf(now);
  const yesterday = dayKeyOf(now.getTime() - 86_400_000);
  if (dayKey === today) return "วันนี้";
  if (dayKey === yesterday) return "เมื่อวาน";
  return dateFormat.format(new Date(`${dayKey}T12:00:00+07:00`));
}

/** Short browser/OS label from a user agent: "Chrome · macOS". */
export function describeUserAgent(userAgent: string | null) {
  if (!userAgent) return "ไม่ทราบอุปกรณ์";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "เบราว์เซอร์อื่น";
  const os = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "ระบบอื่น";
  return `${browser} · ${os}`;
}
