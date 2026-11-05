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
          <div className="min-w-0">
            <p className="kicker !text-[#ff8a8f]">For vendors</p>
            <h1 className="h-display mt-3 text-[clamp(2.4rem,7vw,5.2rem)]">Your hunar, your own dukaan.</h1>
            <p className="mt-4 max-w-[50ch] text-lg text-sand/85">Henna artist, home caterer, decorator, baker or dhol wala? Get a proper storefront with your portfolio, prices and service areas, and receive inquiries from families planning real events.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={cta} className="btn btn-red !border-sand">{vendor ? "Go to my dashboard" : "Start selling"} <ArrowRight size={16} /></Link>
              <Link href="/sell/claim" className="btn btn-sand">I have a claim code</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div><p className="font-shade text-6xl leading-none">{left}</p><p className="text-sm text-sand/75">founding spots left of {cap}</p></div>
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
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="card grid gap-6 bg-sand p-6 sm:p-10 md:grid-cols-3">
          {[
            ["1", "Create your profile", "Tell us what you offer, where and how. About 5 minutes."],
            ["2", "Add prices & photos", "At least 3 photos of your own work. Prices or “custom quote”."],
            ["3", "Get reviewed & go live", "Our team checks your profile, usually within 2 working days."],
          ].map(([n, t, d]) => (
            <div key={n}><span className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-ink bg-red font-display text-sand">{n}</span><h3 className="mt-3 font-display text-lg">{t}</h3><p className="text-sm text-mute">{d}</p></div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-mute">Not comfortable with forms? Our team can set up your profile with you. Write to <b className="select-all">vendors@ronaq.pk</b>.</p>
      </section>
    </>
  );
}
