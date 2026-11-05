import "server-only";
import { and, eq, isNull, lte } from "drizzle-orm";
import { db, schema as s } from "@/db";
import type { User } from "@/db/schema";
import { countdown, todayPKT } from "./time";
import { eventHeading } from "./domain";

/**
 * FR-EVT-007: in-app reminders. Runs lazily when the user opens the app (no paid cron needed):
 * due user-set reminders, plus automatic nudges 30, 7 and 1 day(s) before each event.
 * Push/email delivery can hook in here later.
 */
export async function runDueReminders(user: User) {
  if (!user.remindersEnabled) return;
  const today = todayPKT();
  const due = await db.select().from(s.reminders).where(and(eq(s.reminders.userId, user.id), eq(s.reminders.done, false), lte(s.reminders.dueDate, today), isNull(s.reminders.notifiedAt)));
  for (const r of due) {
    await db.insert(s.notifications).values({ userId: user.id, type: "reminder", title: r.title, body: r.dueDate === today ? "Due today" : "Overdue", href: r.eventId ? `/events/${r.eventId}` : "/calendar" });
    await db.update(s.reminders).set({ notifiedAt: new Date() }).where(eq(s.reminders.id, r.id));
  }
  const evs = await db.select().from(s.events).where(eq(s.events.userId, user.id));
  for (const ev of evs) {
    const c = countdown(ev.date);
    if (c.state !== "future" && c.state !== "today") continue;
    const days = c.state === "today" ? 0 : c.days;
    const mark = [30, 7, 1, 0].find((d) => d === days);
    if (mark === undefined) continue;
    const key = `event_${mark}:${ev.id}:${ev.date}`;
    const exists = await db.query.notifications.findFirst({ where: and(eq(s.notifications.userId, user.id), eq(s.notifications.type, key)) });
    if (exists) continue;
    const title = mark === 0 ? `Today is ${ev.name}! Mubarak ho 🎉` : `${mark} day${mark > 1 ? "s" : ""} to ${ev.name}`;
    await db.insert(s.notifications).values({ userId: user.id, type: key, title, body: `${eventHeading(ev)}: check what's left on your checklist.`, href: `/events/${ev.id}` });
  }
}
