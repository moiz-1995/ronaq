import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { CalendarDays, Plus, MapPin } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { countdown, formatDate } from "@/lib/time";
import { eventHeading } from "@/lib/domain";
import { CountdownDisplay } from "@/components/planner/Countdown";
import { GiftBox } from "@/components/three/Lazy";

export const metadata = { title: "Events" };

export default async function EventsPage() {
  const user = await requireUser("/events");
  const events = await db.select().from(s.events).where(eq(s.events.userId, user.id)).orderBy(asc(s.events.date));
  return (
    <div className="wrap py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="kicker">Planner</p><h1 className="h-display mt-2 text-4xl">Your events</h1></div>
        <div className="flex gap-2"><Link href="/calendar" className="btn"><CalendarDays size={16} /> Calendar</Link><Link href="/events/new" className="btn btn-red"><Plus size={16} /> New event</Link></div>
      </div>
      {events.length === 0 ? (
        <div className="card mt-8 grid place-items-center gap-3 p-10 text-center">
          <GiftBox className="h-44 w-44" />
          <h2 className="font-display text-2xl">No events yet</h2>
          <p className="text-mute">Start with the Launchpad, or create an event directly.</p>
          <div className="flex gap-2"><Link href="/launchpad" className="btn btn-red">Open Launchpad</Link><Link href="/events/new" className="btn">New event</Link></div>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <li key={e.id}>
              <Link href={`/events/${e.id}`} className={`card block h-full p-5 transition hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)] ${e.isPrimary ? "dot-bg text-sand" : "bg-white"}`}>
                {e.isPrimary && <span className="chip mb-3 bg-red text-sand">PRIMARY</span>}
                <p className={`font-display text-2xl leading-tight ${e.isPrimary ? "text-[#ff6b72]" : "text-red"}`}>{eventHeading(e)}</p>
                <p className="mt-1 font-bold">{e.name}</p>
                <p className={`mt-1 flex flex-wrap gap-3 text-sm ${e.isPrimary ? "text-sand/75" : "text-mute"}`}>
                  <span className="inline-flex items-center gap-1"><CalendarDays size={14} /> {formatDate(e.date)}</span>
                  {e.location && <span className="inline-flex items-center gap-1"><MapPin size={14} /> {e.location}</span>}
                </p>
                <div className="mt-4"><CountdownDisplay c={countdown(e.date)} compact /></div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
