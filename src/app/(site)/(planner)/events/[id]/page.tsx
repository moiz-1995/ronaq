import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { CalendarDays, MapPin, Users, Pencil, Wallet } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { countdown, formatDate } from "@/lib/time";
import { eventHeading, guestLabel } from "@/lib/domain";
import { pkr } from "@/lib/price";
import { getCategories, getShortlistIds } from "@/lib/queries";
import { loadEventPlan } from "@/lib/planner";
import { CountdownDisplay } from "@/components/planner/Countdown";
import { Checklist } from "@/components/planner/Checklist";
import { MakePrimaryButton } from "@/components/planner/EventActions";

export const metadata = { title: "Event" };

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/events/${id}`);
  const ev = await db.query.events.findFirst({ where: and(eq(s.events.id, id), eq(s.events.userId, user.id)) });
  if (!ev) notFound();
  const [plan, cats, savedIds] = await Promise.all([loadEventPlan(ev.id), getCategories(), getShortlistIds(user.id)]);
  const shortlist = savedIds.size ? await db.select({ id: s.vendors.id, name: s.vendors.name, slug: s.vendors.slug, coverImage: s.vendors.coverImage, logoImage: s.vendors.logoImage }).from(s.vendors).where(inArray(s.vendors.id, [...savedIds])) : [];
  const budget = ev.budget ?? plan.stats.plannedBudget;
  const { committed, estimated, plannedBudget } = plan.stats;

  return (
    <div className="pb-10">
      <section className={`${ev.isPrimary ? "dot-bg text-sand" : "bg-sand"} border-b-4 border-ink`}>
        <div className="wrap grid gap-6 py-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="min-w-0">
            <Link href="/events" className="text-sm font-bold underline opacity-80">← All events</Link>
            <p className={`h-display mt-3 text-[clamp(2.2rem,6vw,4rem)] ${ev.isPrimary ? "text-[#ff6b72]" : "text-red"}`}>{eventHeading(ev)}</p>
            <h1 className="text-xl font-bold">{ev.name}</h1>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-85">
              <span className="inline-flex items-center gap-1"><CalendarDays size={15} /> {formatDate(ev.date)}{ev.time ? ` · ${ev.time}` : ""}</span>
              {ev.location && <span className="inline-flex items-center gap-1"><MapPin size={15} /> {ev.location}</span>}
              {ev.guestCount && <span className="inline-flex items-center gap-1"><Users size={15} /> {guestLabel(ev.guestCount)}</span>}
            </p>
            <div className="mt-4"><CountdownDisplay c={countdown(ev.date)} compact /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!ev.isPrimary && <MakePrimaryButton id={ev.id} />}
            <Link href={`/events/${ev.id}/edit`} className="btn btn-sm"><Pencil size={14} /> Edit</Link>
          </div>
        </div>
      </section>

      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="h-display text-2xl">Checklist</h2>
            <p className="text-sm font-bold">{plan.stats.sorted}/{plan.stats.total} sorted</p>
          </div>
          <Checklist
            eventId={ev.id}
            items={plan.items.map((i) => ({ id: i.id, label: i.label, status: i.status, categoryId: i.categoryId, notes: i.notes, budget: i.budget, deadline: i.deadline, selectedVendorId: i.selectedVendorId }))}
            links={plan.links}
            quotes={plan.quotes}
            vendors={plan.vendors}
            cats={cats.map((c) => ({ id: c.id, name: c.name, art: c.art }))}
            shortlist={shortlist}
            cityId={user.cityId}
          />
        </div>
        <aside className="grid content-start gap-4">
          <section className="card card-shadow bg-white p-5" aria-labelledby="budget">
            <h2 id="budget" className="flex items-center gap-2 font-display text-lg"><Wallet size={18} /> Budget</h2>
            <dl className="mt-3 grid gap-2 text-sm">
              <Row k="Overall budget" v={budget ? pkr(budget) : "Not set"} />
              <Row k="Planned per service" v={pkr(plannedBudget)} />
              <Row k="Committed (your records)" v={pkr(committed)} />
              <Row k="Estimated (best quotes)" v={pkr(estimated)} />
              <div className="dashed-top pt-2"><Row k="Remaining" v={budget ? pkr(budget - committed - estimated) : "—"} strong tone={budget && budget - committed - estimated < 0 ? "text-red" : "text-green"} /></div>
            </dl>
            {budget > 0 && (
              <div className="mt-3 flex h-4 overflow-hidden rounded-lg border-2 border-ink" aria-hidden>
                <div className="bg-green" style={{ width: `${Math.min(100, (committed / budget) * 100)}%` }} />
                <div className="bg-blue" style={{ width: `${Math.min(100, (estimated / budget) * 100)}%` }} />
              </div>
            )}
            <p className="mt-3 text-xs text-mute">These are your own records of quotes and commitments. Ronaq doesn&apos;t handle payments.</p>
          </section>
          <section className="panel p-5 text-sm">
            <h2 className="font-display">Tips</h2>
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-mute">
              <li>Tap an item to link vendors, record quotes and set deadlines.</li>
              <li>Message vendors from an item and they&apos;re linked automatically.</li>
              <li>Mark the vendor you chose as <b>Chosen</b>. The item moves to Booked.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, strong, tone }: { k: string; v: string; strong?: boolean; tone?: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-mute">{k}</dt><dd className={`tabular ${strong ? "font-display text-base" : "font-bold"} ${tone ?? ""}`}>{v}</dd></div>;
}
