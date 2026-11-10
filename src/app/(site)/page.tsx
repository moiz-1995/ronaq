import { Petals } from "@/components/motion/Petals";
import { CountUp } from "@/components/motion/CountUp";
import { TypingInput } from "@/components/motion/TypingInput";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowRight, CalendarHeart, ListChecks, Store, ShieldCheck, MessageCircle, BadgePercent } from "lucide-react";
import { db, schema as s } from "@/db";
import { getUser } from "@/lib/auth";
import { getActiveCities, getCategories, getCategoryCounts, getShortlistIds, hydrateVendorCards } from "@/lib/queries";
import { HeroStage } from "@/components/three/HeroStage";
import { Bunting } from "@/components/three/Lazy";
import { CraftArt } from "@/components/art/CraftArt";
import { VendorCard } from "@/components/vendor/VendorCard";
import { FoundingBadge } from "@/components/ui/badges";
import { Marquee } from "@/components/site/Marquee";

const SEARCH_EXAMPLES = ["Dhol wala…", "Daig chahiye…", "Bridal makeup…", "Mehndi artist…", "Photographer…"];

export default async function Home() {
  const [user, cities, cats, counts] = await Promise.all([getUser(), getActiveCities(), getCategories(), getCategoryCounts()]);
  const top = await db.select({ id: s.vendors.id }).from(s.vendors).where(eq(s.vendors.status, "approved")).orderBy(desc(s.vendors.ratingAvg), desc(s.vendors.ratingCount)).limit(8);
  const cards = await hydrateVendorCards(top.map((t) => t.id));
  const saved = await getShortlistIds(user?.id);

  return (
    <>
      {/* HERO */}
      <section className="dot-bg relative overflow-hidden text-sand">
        <Petals />
        <div className="wrap relative grid items-center gap-10 py-10 md:py-16 lg:grid-cols-[1.2fr_.9fr]">
          <div className="rise-row min-w-0">
            <h1 className="sticker-row flex flex-wrap gap-x-3.5 gap-y-2.5 font-display text-[clamp(2.5rem,7.2vw,5.8rem)] leading-[.98]">
              <span className="inline-block -rotate-2 rounded-[14px] bg-red px-4 pb-2 pt-1 text-sand">Shaadi</span>
              <span className="inline-block rotate-[1.5deg] rounded-[14px] bg-blue px-4 pb-2 pt-1 text-sand">Mehndi</span>
              <span className="inline-block -rotate-1 rounded-[14px] bg-sand px-4 pb-2 pt-1 text-ink">Birthday</span>
              <span className="inline-block">Apki <span className="text-[#ff6b72]">ronaq</span></span>
            </h1>
            <p className="mt-6 max-w-[48ch] text-lg text-sand/85">
              The local talent that makes Pindi and Islamabad celebrations loud, bright and delicious. Browse free, compare honest prices, message who you like.
            </p>
            <form action="/marketplace" className="mt-7 flex max-w-2xl flex-wrap gap-2.5 rounded-[20px] border-[3px] border-sand bg-paper p-2.5 text-ink">
              <label htmlFor="hq" className="sr-only">What are you looking for?</label>
              <TypingInput id="hq" name="q" phrases={SEARCH_EXAMPLES} className="min-w-0 flex-[1_1_200px] bg-transparent px-3 py-2.5 text-base outline-none" />
              <label htmlFor="hc" className="sr-only">City</label>
              <Select id="hc" name="city" className="min-w-0 flex-[0_1_160px] rounded-xl bg-sand px-3 py-2.5 font-medium" defaultValue={cities.find((c) => c.slug === "rawalpindi")?.id}>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <button className="btn btn-red !shadow-none" type="submit">Dhoondo</button>
            </form>
            <div className="mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
              <Link href="/marketplace" className="group rounded-2xl border-[3px] border-sand bg-blue p-4 transition hover:-translate-y-0.5">
                <span className="flex items-center justify-between font-display text-lg">Khareedar hain? <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></span>
                <span className="mt-1 block text-sm text-sand/90">Apne event ke liye dukaandaar dhoondein</span>
              </Link>
              <Link href="/sell" className="group rounded-2xl border-[3px] border-sand bg-red p-4 transition hover:-translate-y-0.5">
                <span className="flex items-center justify-between font-display text-lg">Dukaandaar hain? <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></span>
                <span className="mt-1 block text-sm text-sand/90">Apni dukaan banayein, bilkul free</span>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-sand/80">
              <p><b className="block font-display text-2xl text-sand">Free</b>khareedar ke liye, hamesha</p>
              <p><b className="block font-display text-2xl text-sand"><CountUp value={200} /></b>founding dukaandaar spots</p>
              <p><b className="block font-display text-2xl text-sand"><CountUp value={10} /></b>celebration categories</p>
            </div>
          </div>
          <HeroStage />
        </div>
        <div className="patti" />
      </section>

      <Marquee items={cats.map((c) => c.name)} />

      {/* LAUNCHPAD */}
      <section data-stagger suppressHydrationWarning className="wrap grid items-center gap-12 py-20 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="kicker">Event Launchpad</p>
          <h2 className="h-display mt-3 text-[clamp(2rem,5vw,3.6rem)]">Plan your ronaq in three moves.</h2>
          <p className="mt-3 max-w-[54ch] text-lg text-mute">A checklist, a date and a marketplace that already knows what you still need.</p>
          <ol className="mt-7 grid gap-3">
            {[
              { icon: ListChecks, t: "Pick a checklist", d: "Wedding, Mehndi, Birthday, or start blank.", c: "bg-sand" },
              { icon: CalendarHeart, t: "Lock the date", d: "Add dholki and walima nights as extra dates.", c: "bg-red text-sand" },
              { icon: Store, t: "Find vendors", d: "Message them, save quotes, mark them booked.", c: "bg-blue text-sand" },
            ].map(({ icon: I, t, d, c }, i) => (
              <li key={t} className="card flex items-center gap-4 p-4">
                <span className={`grid h-12 w-12 flex-none place-items-center rounded-full border-[3px] border-ink font-display ${c}`}>{i + 1}</span>
                <div><b className="flex items-center gap-2"><I size={16} /> {t}</b><p className="text-sm text-mute">{d}</p></div>
              </li>
            ))}
          </ol>
          <Link href={user ? "/launchpad" : "/signup?next=/launchpad"} className="btn btn-red mt-7">Start planning <ArrowRight size={16} /></Link>
        </div>
        <DashboardPreview />
      </section>

      {/* CATEGORIES */}
      <section className="bg-sand py-20">
        <div className="wrap">
          <p className="kicker">Marketplace</p>
          <h2 className="h-display mt-3 text-[clamp(2rem,5vw,3.6rem)]">Kya chahiye?</h2>
          <div data-stagger suppressHydrationWarning className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cats.map((c, i) => (
              <Link key={c.id} href={`/c/${c.slug}`} className="card group overflow-hidden shadow-[5px_5px_0_var(--color-ink)] transition hover:-translate-x-1 hover:-translate-y-1 hover:-rotate-1 hover:shadow-[8px_8px_0_var(--color-red)]">
                <div className="aspect-[5/4] overflow-hidden border-b-[3px] border-ink">
                  <CraftArt kind={c.art} seed={i * 5 + 2} ratio={5 / 4} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <p className="font-display text-[15px] leading-tight">{c.name}</p>
                  <p className="text-xs text-mute">{counts[c.id] ?? 0} {c.noun}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="wrap py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Families love them</p>
            <h2 className="h-display mt-3 text-[clamp(2rem,5vw,3.6rem)]">Top-rated near you</h2>
          </div>
          <Link href="/marketplace?sort=rating" className="btn">See all vendors <ArrowRight size={16} /></Link>
        </div>
        <div data-stagger suppressHydrationWarning className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((d, i) => <VendorCard key={d.vendor.id} data={d} saved={saved.has(d.vendor.id)} seed={i} />)}
        </div>
      </section>

      {/* TRUST */}
      <section data-stagger suppressHydrationWarning className="wrap grid gap-4 pb-6 sm:grid-cols-3">
        {[
          { icon: BadgePercent, t: "Honest price units", d: "Per person, per item or package, never mixed up. Custom quotes are clearly marked." },
          { icon: ShieldCheck, t: "Verified badges", d: "Badges show exactly what the Ronaq team has checked, and anyone can report a profile." },
          { icon: MessageCircle, t: "Your number stays private", d: "Message vendors in Ronaq and share only the event details you choose." },
        ].map(({ icon: I, t, d }) => (
          <div key={t} className="panel p-5">
            <I className="text-blue" />
            <h3 className="mt-3 font-display text-lg">{t}</h3>
            <p className="mt-1 text-sm text-mute">{d}</p>
          </div>
        ))}
      </section>

      {/* SELL */}
      <section data-stagger suppressHydrationWarning className="wrap py-16">
        <div className="relative overflow-hidden rounded-[32px] border-4 border-ink bg-blue text-sand shadow-[12px_12px_0_var(--color-red)]">
          <Bunting count={16} className="h-20" />
          <div className="grid items-center gap-8 px-6 pb-12 pt-4 sm:px-12 lg:grid-cols-[1.3fr_1fr]">
            <div className="min-w-0">
              <p className="kicker !text-sand">Dukaandaar ke liye</p>
              <h2 className="h-display mt-3 text-[clamp(2rem,5vw,3.6rem)]">Aap ka hunar, aap ki dukaan.</h2>
              <p className="mt-3 max-w-[52ch] text-lg text-sand/85">Apna kaam, rates aur ilaqe ek hi page par. Khareedar aap ko seedha message karte hain. Hamari team setup mein madad bhi karti hai.</p>
              <Link href="/sell" className="btn btn-sand mt-7">Start selling <ArrowRight size={16} /></Link>
            </div>
            <div>
              <p className="font-shade text-[clamp(5rem,13vw,9rem)] leading-[.85]"><CountUp value={200} /></p>
              <p className="mt-2 flex flex-wrap items-center gap-3">founding dukaandaar free list honge, aur badge hamesha rahega <FoundingBadge className="ml-2" /></p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function DashboardPreview() {
  const rows = [
    ["Mehndi artist", "Hina's Henna Studio", "BOOKED", "bg-green text-white"],
    ["Catering", "3 vendors shortlisted", "SHORTLISTED", "bg-red text-sand"],
    ["Photography", "Comparing packages", "SEARCHING", "bg-blue text-sand"],
    ["Stage decor", "Budget PKR 250,000", "NOT STARTED", "bg-white"],
  ];
  return (
    <div className="card relative bg-white p-6 shadow-[10px_10px_0_var(--color-blue)]" aria-label="Example dashboard">
      <div className="absolute inset-x-[-3px] top-[-3px] h-4 rounded-t-[20px] bg-[repeating-linear-gradient(90deg,var(--color-red)_0_22px,var(--color-sand)_22px_44px,var(--color-blue)_44px_66px)]" />
      <div className="mt-3 flex items-center justify-between text-sm font-bold">
        <span className="chip bg-ink text-sand">PRIMARY EVENT</span><span>Sat 26 Dec 2026</span>
      </div>
      <h3 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-none text-red">Shaadi ki Ronaq</h3>
      <p className="mt-1 flex items-baseline gap-2 font-bold"><span className="font-shade text-7xl leading-none text-blue">50</span> din baqi</p>
      <div className="mt-4 h-3.5 overflow-hidden rounded-lg border-[3px] border-ink"><div className="h-full w-[36%] bg-[repeating-linear-gradient(-45deg,var(--color-red)_0_8px,var(--color-blue)_8px_16px)]" /></div>
      <div className="mt-2 flex flex-wrap justify-between gap-1 text-[13px] font-medium"><span>4 of 11 services sorted</span><span>PKR 742,000 / 1,800,000</span></div>
      <ul className="mt-3">
        {rows.map(([a, b, st, c]) => (
          <li key={a} className="dashed-top flex items-center justify-between gap-3 py-2.5">
            <div>{a}<small className="block text-[13px] text-mute">{b}</small></div>
            <span className={`chip ${c}`}>{st}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-mute">Example. Your own dashboard appears after you sign up.</p>
    </div>
  );
}
