// Working hours are stored as readable text ("10:00 AM – 9:00 PM" or "Flexible"). Pure so it can be unit-tested.
export const FLEXIBLE_HOURS = "Flexible";

function slot(minutes: number): string {
  const m = minutes % 1440, h = Math.floor(m / 60);
  return `${h % 12 || 12}:${String(m % 60).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

/** Every half hour from 6:00 AM through 3:00 AM the next morning, for late functions. */
export const TIME_SLOTS: string[] = Array.from({ length: 43 }, (_, i) => slot(360 + i * 30));

export function formatHours(from: string, to: string): string {
  return `${from} – ${to}`;
}

const normal = (h: string, m: string | undefined, ap: string) => `${Number(h)}:${m ?? "00"} ${ap.toUpperCase()}`;

export type ParsedHours = { flexible: true } | { from: string; to: string } | { legacy: string } | null;

/** Reads a saved value back into the picker. Older free-text values come back as legacy. */
export function parseHours(text: string | null | undefined): ParsedHours {
  const t = text?.trim();
  if (!t) return null;
  if (/^flexible/i.test(t)) return { flexible: true };
  const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:–|-|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (m) {
    const from = normal(m[1], m[2], m[3]), to = normal(m[4], m[5], m[6]);
    if (TIME_SLOTS.includes(from) && TIME_SLOTS.includes(to)) return { from, to };
  }
  return { legacy: t };
}
