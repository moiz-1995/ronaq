import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { ArrowRight, Camera, MessageCircle, BarChart3, Users, ShieldCheck, Wallet } from "lucide-react";
import { db, schema as s } from "@/db";
import { getUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { getMyVendor } from "@/lib/queries";
import { Stall, Bunting } from "@/components/three/Lazy";
import { FoundingBadge } from "@/components/ui/badges";
import { Marquee } from "@/components/site/Marquee";
import { CountUp } from "@/components/motion/CountUp";

export const metadata = { title: "Start selling" };

export default async function SellPage() {
  const user = await getUser();
  const vendor = user ? await getMyVendor(user.id) : null;
  const cap = await getSetting("foundingCap");
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(s.vendors).where(eq(s.vendors.founding, true));
  const left = Math.max(0, cap - Number(n));
  const cta = vendor ? "/seller" : user ? "/seller/onboarding" : "/signup?as=seller&next=/seller/onboarding";
  return (
    <>
      <section className="dot-bg relative overflow-hidden text-sand">
        <Bunting count={18} className="h-16" />
        <div className="wrap grid items-center gap-8 pb-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="rise-row min-w-0">
            <p className="kicker !text-[#ff8a8f]">Dukaandaar ke liye</p>
            <h1 className="h-display mt-3 text-[clamp(2.4rem,7vw,5.2rem)]">Aap ka hunar, aap ki dukaan.</h1>
            <p className="mt-4 max-w-[50ch] text-lg text-sand/85">Mehndi artist, ghar ka khana, decorator, baker ya dhol wala? Apni online dukaan banayein, apna kaam aur rates dikhayein, aur shaadi ya function plan karne wale khareedar se seedha queries paayein.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={cta} className="btn btn-red !border-sand">{vendor ? "Go to my dashboard" : "Start selling"} <ArrowRight size={16} /></Link>
              <Link href="/sell/claim" className="btn btn-sand">Claim code hai?</Link>
            </div>
            <p className="mt-3 max-w-[56ch] text-sm text-sand/80"><b>Claim code kya hai?</b> Agar Ronaq team ne aap ke liye profile banayi hai to woh aap ko ek code dete hain. Is code se woh profile aap ke account mein aa jati hai. Khud dukaan bana rahe hain to code ki zaroorat nahi.</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div><p className="font-shade text-6xl leading-none"><CountUp value={left} /></p><p className="text-sm text-sand/75">founding spots left of {cap}</p></div>
              <FoundingBadge className="ml-4" />
            </div>
          </div>
          <Stall className="h-[340px] w-full sm:h-[420px]" />
        </div>
        <div className="patti" />
      </section>
      <Marquee tone="blue" items={["Free listing for founding vendors", "No commission", "Families message you directly", "We help you set up", "Your number stays private"]} />
      <section className="wrap py-16">
        <h2 className="h-display text-[clamp(2rem,5vw,3.4rem)]">What you get</h2>
        <div data-stagger suppressHydrationWarning className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { i: Camera, t: "A beautiful profile", d: "Your best work up front, with honest prices, the areas you cover and how you work." },
            { i: MessageCircle, t: "Real inquiries", d: "Families send the date, guest count and budget they choose to share. Reply from your phone." },
            { i: Users, t: "Found by the right people", d: "Show up when families in your area search your category, with filters that fit your craft." },
            { i: BarChart3, t: "See what's working", d: "Profile views, contact taps, inquiries and your response time." },
            { i: ShieldCheck, t: "Trust badges", d: "Phone, email and profile-reviewed badges, plus the Founding Vendor badge for early members." },
            { i: Wallet, t: "No commission", d: "Ronaq doesn't take a cut. You agree prices and payment directly with families." },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="card p-5 shadow-[5px_5px_0_var(--color-ink)]"><I className="text-red" /><h3 className="mt-3 font-display text-lg">{t}</h3><p className="mt-1 text-sm text-mute">{d}</p></div>
          ))}
        </div>
      </section>
      <section className="wrap pb-16">
        <div data-stagger suppressHydrationWarning className="card grid gap-6 bg-sand p-6 sm:p-10 md:grid-cols-3">
          {[
            ["1", "Apni dukaan banayein", "Batayein aap kya kaam karte hain aur kahan. Sirf 5 minute."],
            ["2", "Foran publish karein", "Form mukammal hote hi dukaan live. Shuru mein photos zaroori nahi."],
            ["3", "Aur behtar banayein", "Photos, rates aur pichla kaam jab chahein add karein. Hum batayenge kya bharna hai."],
          ].map(([n, t, d]) => (
            <div key={n}><span className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-ink bg-red font-display text-sand">{n}</span><h3 className="mt-3 font-display text-lg">{t}</h3><p className="text-sm text-mute">{d}</p></div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-mute">Not comfortable with forms? Our team can set up your profile with you. Write to <b className="select-all">vendors@ronaq.pk</b>.</p>
      </section>
    </>
  );
}
