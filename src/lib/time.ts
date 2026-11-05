// All calendar logic runs in Pakistan Standard Time (UTC+5), per PRD §16.1.
export const TZ = "Asia/Karachi";

/** Today's date in PKT as YYYY-MM-DD. */
export function todayPKT(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function toUTCDay(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
}

/** Whole days from today (PKT) to `date`. Negative when the date has passed. */
export function daysBetween(fromYmd: string, toYmd: string): number {
  return Math.round(toUTCDay(toYmd) - toUTCDay(fromYmd));
}

export type Countdown =
  | { state: "none" }
  | { state: "future"; days: number }
  | { state: "today"; days: 0 }
  | { state: "past"; daysAgo: number };

/** FR-EVT-005: never negative; past dates move to a post-event state. */
export function countdown(date: string | null | undefined, now: Date = new Date()): Countdown {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { state: "none" };
  const d = daysBetween(todayPKT(now), date);
  if (d > 0) return { state: "future", days: d };
  if (d === 0) return { state: "today", days: 0 };
  return { state: "past", daysAgo: -d };
}

export function formatDate(ymd: string | null | undefined, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", year: "numeric" }): string {
  if (!ymd) return "Date not set";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatDateTime(t: Date | number): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(t));
}

export function timeAgo(t: Date | number, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(t).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return formatDateTime(t);
}

/** Build a month grid (weeks starting Monday) for a YYYY-MM. */
export function monthGrid(year: number, month1: number): string[][] {
  const first = new Date(Date.UTC(year, month1 - 1, 1));
  const startOffset = (first.getUTCDay() + 6) % 7;
  const start = new Date(first.getTime() - startOffset * 86400000);
  const weeks: string[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: string[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start.getTime() + (w * 7 + d) * 86400000);
      row.push(day.toISOString().slice(0, 10));
    }
    weeks.push(row);
    if (w >= 4 && new Date(start.getTime() + (w * 7 + 7) * 86400000).getUTCMonth() !== month1 - 1) break;
  }
  return weeks;
}
