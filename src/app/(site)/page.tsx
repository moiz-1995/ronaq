import { HeroFx } from "@/components/motion/HeroFx";
import { Magnetic } from "@/components/motion/Magnetic";
import { Words } from "@/components/motion/Words";
import { Coverflow } from "@/components/motion/Coverflow";
import { ThreeMoves } from "@/components/home/ThreeMoves";
import { WhyBento } from "@/components/home/WhyBento";
import { CountUp } from "@/components/motion/CountUp";
import { TypingInput } from "@/components/motion/TypingInput";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import { db, schema as s } from "@/db";
import { getUser } from "@/lib/auth";
import { getActiveCities, getCategories, getCategoryCounts, getShortlistIds, hydrateVendorCards } from "@/lib/queries";
import { HeroStage } from "@/components/three/HeroStage";
import { Bunting, MelaSky } from "@/components/three/Lazy";
import { CraftArt } from "@/components/art/CraftArt";
import { VendorCard } from "@/components/vendor/VendorCard";
import { FoundingBadge } from "@/components/ui/badges";
import { Marquee } from "@/components/site/Marquee";

const OCCASIONS = ["Shaadi", "Mehndi", "Dholki", "Barat", "Walima", "Engagement", "Birthday", "Bridal shower", "Aqeeqa", "Eid"];
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
        <MelaSky />
        <HeroFx />
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
      <Marquee tone="blue" reverse items={OCCASIONS} />

      <ThreeMoves href={user ? "/launchpad" : "/signup?next=/launchpad"} />

      {/* CATEGORIES */}
      <section className="overflow-hidden bg-sand py-20">
        <div className="wrap">
          <p className="kicker">Marketplace</p>
          <Words text="Kya chahiye?" className="h-display mt-3 text-[clamp(2rem,5vw,3.6rem)]" />
        </div>
        <Coverflow label="Categories">
          {cats.map((c, i) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="card group block overflow-hidden shadow-[5px_5px_0_var(--color-ink)] transition-shadow hover:shadow-[8px_8px_0_var(--color-red)]">
              <div className="aspect-[5/4] overflow-hidden border-b-[3px] border-ink">
                <CraftArt kind={c.art} seed={i * 5 + 2} ratio={5 / 4} className="h-full w-full transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-3">
                <p className="font-display text-[15px] leading-tight">{c.name}</p>
                <p className="text-xs text-mute">{counts[c.id] ?? 0} {c.noun}</p>
              </div>
            </Link>
          ))}
        </Coverflow>
      </section>

      {/* FEATURED */}
      <section className="wrap py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Families love them</p>
            <Words text="Top-rated near you" className="h-display mt-3 text-[clamp(2rem,5vw,3.6rem)]" />
          </div>
          <Link href="/marketplace?sort=rating" className="btn">See all vendors <ArrowRight size={16} /></Link>
        </div>
        <div data-stagger suppressHydrationWarning className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((d, i) => <VendorCard key={d.vendor.id} data={d} saved={saved.has(d.vendor.id)} seed={i} />)}
        </div>
      </section>

      <WhyBento />

      {/* SELL */}
      <section data-stagger suppressHydrationWarning className="wrap py-16">
        <div className="relative overflow-hidden rounded-[32px] border-4 border-ink bg-blue text-sand shadow-[12px_12px_0_var(--color-red)]">
          <Bunting count={16} className="h-20" />
          <div className="grid items-center gap-8 px-6 pb-12 pt-4 sm:px-12 lg:grid-cols-[1.3fr_1fr]">
            <div className="min-w-0">
              <p className="kicker !text-sand">Dukaandaar ke liye</p>
              <h2 className="h-display mt-3 text-[clamp(2rem,5vw,3.6rem)]">Aap ka hunar, aap ki dukaan.</h2>
              <p className="mt-3 max-w-[52ch] text-lg text-sand/85">Apna kaam, rates aur ilaqe ek hi page par. Khareedar aap ko seedha message karte hain. Hamari team setup mein madad bhi karti hai.</p>
              <Magnetic className="mt-7"><Link href="/sell" className="btn btn-sand">Start selling <ArrowRight size={16} /></Link></Magnetic>
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
