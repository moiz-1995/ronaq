import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MODE_COOKIE } from "@/lib/mode";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { ArrowRight, CalendarDays, Heart, MessageCircle, Rocket, Bell, MapPin, Plus } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { getMyVendor, getShortlistIds, hydrateVendorCards } from "@/lib/queries";
import { countdown, formatDate, todayPKT } from "@/lib/time";
import { eventHeading, STATUS_LABELS } from "@/lib/domain";
import { pkr, pkrShort } from "@/lib/price";
import { loadEventPlan } from "@/lib/planner";
import { runDueReminders } from "@/lib/reminders";
import { CountdownDisplay } from "@/components/planner/Countdown";
import { StatusChip } from "@/components/ui/badges";
import { Picture } from "@/components/art/CraftArt";
import { Bunting, GiftBox } from "@/components/three/Lazy";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requireUser("/dashboard");
  if ((await cookies()).get(MODE_COOKIE)?.value === "vendor" && (await getMyVendor(user.id))) redirect("/seller");
  await runDueReminders(user);
  const events = await db.select().from(s.events).where(eq(s.events.userId, user.id)).orderBy(asc(s.events.date));
  const primary = events.find((e) => e.isPrimary) ?? null;
  const secondary = events.filter((e) => e.id !== primary?.id);
  const plan = primary ? await loadEventPlan(primary.id) : null;
  const c = countdown(primary?.date);
  const [inbox, reminders, savedIds, vendor] = await Promise.all([
    db.select().from(s.inquiries).where(eq(s.inquiries.consumerId, user.id)).orderBy(desc(s.inquiries.lastMessageAt)).limit(3),
    db.select().from(s.reminders).where(and(eq(s.reminders.userId, user.id), eq(s.reminders.done, false), gte(s.reminders.dueDate, todayPKT()))).orderBy(asc(s.reminders.dueDate)).limit(4),
    getShortlistIds(user.id),
    getMyVendor(user.id),
  ]);
  const savedCards = await hydrateVendorCards([...savedIds].slice(0, 4));
  const inboxVendors = inbox.length ? await hydrateVendorCards(inbox.map((i) => i.vendorId)) : [];
  const pct = plan && plan.stats.total ? Math.round((plan.stats.sorted / plan.stats.total) * 100) : 0;
  const budget = primary?.budget ?? plan?.stats.plannedBudget ?? 0;
  const recorded = (plan?.stats.committed ?? 0) + (plan?.stats.estimated ?? 0);

  return (
    <div className="pb-10">
      {/* HERO */}
      <section className="dot-bg relative overflow-hidden text-sand">
        <Bunting count={16} className="relative h-14" />
        <div className="wrap relative grid gap-8 pb-10 pt-2 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div className="min-w-0">
            <p className="text-sm text-sand/70">Assalam o alaikum, {user.name.split(" ")[0]}</p>
            <h1 className="h-display mt-2 text-[clamp(2.4rem,7vw,5rem)] text-[#ff6b72]">{eventHeading(primary)}</h1>
            {primary ? (
              <>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sand/80">
                  <span className="font-bold text-sand">{primary.name}</span>
                  {primary.date && <span className="inline-flex items-center gap-1"><CalendarDays size={15} /> {formatDate(primary.date)}</span>}
                  {primary.location && <span className="inline-flex items-center gap-1"><MapPin size={15} /> {primary.location}</span>}
                </p>
                <div className="mt-6"><CountdownDisplay c={c} /></div>
              </>
            ) : (
              <p className="mt-3 max-w-[48ch] text-lg text-sand/80">Set up your first event and we&apos;ll count down with you, track every service and keep your quotes in one place.</p>
            )}
          </div>
          {primary && plan ? (
            <div className="card min-w-0 bg-paper p-5 text-ink shadow-[8px_8px_0_var(--color-red)]">
              <div className="flex items-baseline justify-between"><p className="font-display">Checklist</p><p className="text-sm font-bold">{plan.stats.sorted} of {plan.stats.total} sorted</p></div>
              <div className="mt-2 h-4 overflow-hidden rounded-lg border-[3px] border-ink bg-white"><div className="h-full bg-[repeating-linear-gradient(-45deg,var(--color-red)_0_8px,var(--color-blue)_8px_16px)] transition-[width] duration-700" style={{ width: `${pct}%` }} /></div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <Stat n={plan.stats.sorted} t="booked" c="bg-green text-white" />
                <Stat n={plan.stats.inProgress} t="in progress" c="bg-blue text-sand" />
                <Stat n={plan.stats.total - plan.stats.sorted - plan.stats.inProgress} t="to start" c="bg-white" />
              </div>
              {budget > 0 && (
                <div className="dashed-top mt-4 pt-3 text-sm">
                  <div className="flex justify-between"><span className="text-mute">Budget</span><b>{pkr(budget)}</b></div>
                  <div className="flex justify-between"><span className="text-mute">Recorded so far</span><b>{pkr(recorded)}</b></div>
                  <div className="flex justify-between"><span className="text-mute">Remaining</span><b className={budget - recorded < 0 ? "text-red" : "text-green"}>{pkr(budget - recorded)}</b></div>
                  <p className="mt-1 text-[11px] text-mute">From quotes you recorded. Not payments.</p>
                </div>
              )}
              <Link href={`/events/${primary.id}`} className="btn btn-red btn-sm mt-4 w-full">Open checklist <ArrowRight size={14} /></Link>
            </div>
          ) : (
            <div className="grid place-items-center"><GiftBox className="h-52 w-52" /></div>
          )}
        </div>
        <div className="patti" />
      </section>

      <div data-stagger suppressHydrationWarning className="wrap mt-8 grid gap-6">
        {!user.onboardedAt && (
          <Banner icon={Bell} text="Finish your profile so we can show vendors in your city." href="/onboarding" cta="Finish profile" />
        )}
        {user.launchpadStep < 4 && (
          <Banner icon={Rocket} text={user.launchpadStep === 0 ? "Start with the Launchpad: checklist, date, marketplace. Takes 2 minutes." : `Launchpad is ${Math.round(((user.launchpadStep - 1) / 3) * 100)}% done. Pick up where you left off.`} href="/launchpad" cta={user.launchpadStep === 0 ? "Start Launchpad" : "Resume"} tone="red" />
        )}
        {vendor && <Banner icon={Rocket} text={`You also run ${vendor.name} on Ronaq.`} href="/seller" cta="Business dashboard" />}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* next up */}
          <section className="card bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl">Next up</h2>
              {primary && <Link href={`/events/${primary.id}`} className="text-sm font-bold text-blue underline">Full checklist</Link>}
            </div>
            {!plan || plan.items.length === 0 ? (
              <p className="mt-3 text-mute">Nothing on your checklist yet. <Link href="/launchpad" className="font-bold text-red underline">Build one</Link>.</p>
            ) : (
              <ul className="mt-3">
                {plan.items.filter((i) => i.status !== "completed" && i.status !== "booked").slice(0, 6).map((i) => (
                  <li key={i.id} className="dashed-top flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{i.label}</p>
                      <p className="text-xs text-mute">{i.budget ? `Budget ${pkrShort(i.budget)}` : "No budget set"}{i.deadline ? ` · due ${formatDate(i.deadline, { day: "numeric", month: "short" })}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusChip status={i.status} label={STATUS_LABELS[i.status]} />
                      {i.categoryId && i.status !== "booked" && <Link href={`/marketplace?category=${i.categoryId}${user.cityId ? `&city=${user.cityId}` : ""}`} className="btn btn-sm">Find</Link>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="grid content-start gap-6">
            <section className="card bg-white p-5">
              <div className="flex items-center justify-between"><h2 className="font-display text-xl">Your events</h2><Link href="/events/new" className="btn btn-sm"><Plus size={14} /> Add</Link></div>
              <ul className="mt-3 grid gap-2">
                {events.length === 0 && <li className="text-mute">No events yet.</li>}
                {[...(primary ? [primary] : []), ...secondary].map((e) => {
                  const ec = countdown(e.date);
                  return (
                    <li key={e.id}>
                      <Link href={`/events/${e.id}`} className="flex items-center justify-between gap-3 rounded-xl border-2 border-ink/15 p-3 hover:border-ink">
                        <div className="min-w-0"><p className="truncate font-bold">{e.name} {e.isPrimary && <span className="chip ml-1 bg-red text-sand">PRIMARY</span>}</p><p className="text-xs text-mute">{formatDate(e.date)}</p></div>
                        <span className="flex-none text-sm font-bold">{ec.state === "future" ? `${ec.days}d` : ec.state === "today" ? "Today" : ec.state === "past" ? "Done" : "—"}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link href="/calendar" className="mt-3 inline-block text-sm font-bold text-blue underline">Open calendar</Link>
            </section>

            {reminders.length > 0 && (
              <section className="card bg-white p-5">
                <h2 className="font-display text-xl">Reminders</h2>
                <ul className="mt-2 grid gap-1 text-sm">{reminders.map((r) => <li key={r.id} className="flex justify-between gap-2"><span>{r.title}</span><span className="text-mute">{formatDate(r.dueDate, { day: "numeric", month: "short" })}</span></li>)}</ul>
              </section>
            )}

            <section className="card bg-white p-5">
              <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-xl"><MessageCircle size={18} /> Messages</h2><Link href="/inbox" className="text-sm font-bold text-blue underline">All</Link></div>
              <ul className="mt-3 grid gap-2">
                {inbox.length === 0 && <li className="text-sm text-mute">No conversations yet.</li>}
                {inbox.map((i) => {
                  const v = inboxVendors.find((x) => x.vendor.id === i.vendorId);
                  return (
                    <li key={i.id}><Link href={`/inbox/${i.id}`} className="flex items-center justify-between gap-2 rounded-xl p-2 hover:bg-sand">
                      <span className="truncate font-medium">{v?.vendor.name}</span>
                      {i.consumerUnread > 0 ? <span className="rounded-full bg-red px-2 text-xs font-bold text-sand">{i.consumerUnread} new</span> : <StatusChip status={i.status} />}
                    </Link></li>
                  );
                })}
              </ul>
            </section>
          </div>
        </div>

        <section className="card bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-xl"><Heart size={18} /> Shortlist</h2><Link href="/shortlist" className="text-sm font-bold text-blue underline">See all</Link></div>
          {savedCards.length === 0 ? <p className="mt-2 text-mute">Tap the heart on any vendor to save them here.</p> : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {savedCards.map((d, i) => (
                <li key={d.vendor.id}><Link href={`/v/${d.vendor.slug}`} className="block overflow-hidden rounded-2xl border-[3px] border-ink transition hover:-translate-y-1">
                  <div className="aspect-[4/3]"><Picture src={d.vendor.coverImage} alt="" fallbackKind={d.category?.art} seed={i + 40} ratio={4 / 3} className="h-full w-full" /></div>
                  <p className="truncate border-t-[3px] border-ink bg-white p-2 text-sm font-bold">{d.vendor.name}</p>
                </Link></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ n, t, c }: { n: number; t: string; c: string }) {
  return <div className={`rounded-xl border-2 border-ink p-2 ${c}`}><b className="block font-display text-2xl">{n}</b>{t}</div>;
}

function Banner({ icon: I, text, href, cta, tone = "blue" }: { icon: typeof Bell; text: string; href: string; cta: string; tone?: "blue" | "red" }) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border-[3px] border-ink p-4 ${tone === "red" ? "bg-red-soft" : "bg-blue-soft"}`}>
      <p className="flex items-center gap-2 font-medium"><I size={18} className={tone === "red" ? "text-red" : "text-blue"} /> {text}</p>
      <Link href={href} className={`btn btn-sm ${tone === "red" ? "btn-red" : "btn-blue"}`}>{cta}</Link>
    </div>
  );
}
