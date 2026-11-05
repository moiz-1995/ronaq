import Link from "next/link";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { formatDate, monthGrid, todayPKT, countdown } from "@/lib/time";
import { ReminderForm, ReminderToggle } from "./Reminders";

export const metadata = { title: "Calendar" };

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const user = await requireUser("/calendar");
  const { m } = await searchParams;
  const today = todayPKT();
  const [y, mo] = (m && /^\d{4}-\d{2}$/.test(m) ? m : today.slice(0, 7)).split("-").map(Number);
  const grid = monthGrid(y, mo);
  const prev = mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
  const [events, reminders, deadlines] = await Promise.all([
    db.select().from(s.events).where(eq(s.events.userId, user.id)).orderBy(asc(s.events.date)),
    db.select().from(s.reminders).where(eq(s.reminders.userId, user.id)).orderBy(asc(s.reminders.dueDate)),
    db.select({ id: s.checklistItems.id, label: s.checklistItems.label, deadline: s.checklistItems.deadline, eventId: s.checklistItems.eventId })
      .from(s.checklistItems).innerJoin(s.events, eq(s.events.id, s.checklistItems.eventId))
      .where(and(eq(s.events.userId, user.id), isNotNull(s.checklistItems.deadline))),
  ]);
  const monthName = formatDate(`${y}-${String(mo).padStart(2, "0")}-01`, { month: "long", year: "numeric" });
  const upcoming = events.filter((e) => e.date && e.date >= today);

  return (
    <div className="wrap py-10">
      <p className="kicker">Planner</p>
      <h1 className="h-display mt-2 text-4xl">Calendar</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="card card-shadow min-w-0 overflow-hidden bg-white" aria-label={monthName}>
          <header className="flex items-center justify-between border-b-[3px] border-ink bg-ink p-3 text-sand">
            <Link href={`/calendar?m=${prev}`} className="rounded-lg p-2 hover:bg-white/10" aria-label="Previous month"><ChevronLeft /></Link>
            <h2 className="font-display text-xl">{monthName}</h2>
            <Link href={`/calendar?m=${next}`} className="rounded-lg p-2 hover:bg-white/10" aria-label="Next month"><ChevronRight /></Link>
          </header>
          <div className="grid grid-cols-7 border-b-2 border-ink/10 text-center text-xs font-bold text-mute">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {grid.flat().map((d) => {
              const inMonth = Number(d.slice(5, 7)) === mo;
              const evs = events.filter((e) => e.date === d);
              const rem = reminders.filter((r) => r.dueDate === d && !r.done);
              const dl = deadlines.filter((x) => x.deadline === d);
              return (
                <div key={d} className={`min-h-[84px] border-b border-r border-ink/10 p-1.5 sm:min-h-[104px] ${inMonth ? "" : "bg-paper text-ink/30"} ${d === today ? "bg-blue-soft" : ""}`}>
                  <p className={`text-xs font-bold ${d === today ? "inline-grid h-6 w-6 place-items-center rounded-full bg-blue text-sand" : ""}`}>{Number(d.slice(8))}</p>
                  <ul className="mt-1 grid gap-0.5">
                    {evs.map((e) => <li key={e.id}><Link href={`/events/${e.id}`} className={`block truncate rounded px-1 py-0.5 text-[11px] font-bold ${e.isPrimary ? "bg-red text-sand" : "bg-ink text-sand"}`}>{e.name}</Link></li>)}
                    {dl.map((x) => <li key={x.id}><Link href={`/events/${x.eventId}`} className="block truncate rounded bg-sun/60 px-1 py-0.5 text-[11px]">⏰ {x.label}</Link></li>)}
                    {rem.map((r) => <li key={r.id} className="truncate rounded bg-blue-soft px-1 py-0.5 text-[11px]">🔔 {r.title}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="p-3 text-xs text-mute">All dates in Pakistan time (PKT). <span className="ml-2 rounded bg-red px-1 text-sand">primary</span> <span className="rounded bg-ink px-1 text-sand">other events</span> <span className="rounded bg-sun/60 px-1">deadlines</span> <span className="rounded bg-blue-soft px-1">reminders</span></p>
        </section>

        <aside className="grid content-start gap-5">
          <section className="card bg-white p-5">
            <h2 className="font-display text-lg">Coming up</h2>
            <ul className="mt-3 grid gap-2">
              {upcoming.length === 0 && <li className="text-sm text-mute">No upcoming events. <Link href="/events/new" className="underline">Add one</Link>.</li>}
              {upcoming.map((e) => {
                const c = countdown(e.date);
                return (
                  <li key={e.id}><Link href={`/events/${e.id}`} className="flex justify-between gap-2 rounded-xl border-2 border-ink/10 p-2.5 hover:border-ink">
                    <span className="min-w-0"><b className="block truncate">{e.name}</b><small className="text-mute">{formatDate(e.date)}</small></span>
                    <span className="flex-none text-sm font-bold">{c.state === "future" ? `${c.days} days` : c.state === "today" ? "Today" : ""}</span>
                  </Link></li>
                );
              })}
            </ul>
          </section>
          <section className="card bg-white p-5">
            <h2 className="font-display text-lg">Reminders</h2>
            {!user.remindersEnabled && <p className="mt-2 rounded-lg bg-sand p-2 text-xs">Reminders are turned off in your <Link href="/account" className="underline">settings</Link>.</p>}
            <ul className="mt-3 grid gap-1">
              {reminders.filter((r) => r.dueDate >= today || !r.done).map((r) => <ReminderToggle key={r.id} r={{ id: r.id, title: r.title, dueDate: r.dueDate, done: r.done }} />)}
            </ul>
            <ReminderForm events={events.map((e) => ({ id: e.id, name: e.name }))} />
          </section>
        </aside>
      </div>
    </div>
  );
}
