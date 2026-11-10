import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Eye, MousePointerClick, MessageCircle, Heart, Timer, Reply, ExternalLink, CalendarCheck, ArrowRight, Sparkles } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireVendorPage, vendorCompleteness, vendorMetrics, vendorTips } from "@/lib/seller";
import { vendorDemand } from "@/lib/queries";
import { timeAgo } from "@/lib/time";
import { StatusChip, FoundingBadge } from "@/components/ui/badges";
import { INQUIRY_STATUS_LABELS } from "@/lib/domain";
import { TestQueryButton } from "./TestQueryButton";
import { Confetti } from "@/components/ui/Confetti";

export const metadata = { title: "Meri Dukaan" };

const STATUS_COPY: Record<string, string> = {
  draft: "Aap ki dukaan abhi draft hai. Upar Publish dabayein aur khareedar aap ko dhoond sakenge.",
  pending: "Review ke liye bhej di gayi hai. Team aam taur par 2 din mein dekh leti hai, hum aap ko bata denge.",
  approved: "Mubarak ho! Aap ki dukaan live hai. Khareedar aap ko dhoond kar message kar sakte hain.",
  rejected: "Live hone se pehle kuch tabdeeli chahiye. Neeche note parhein, theek karein aur dobara bhejein.",
  suspended: "Aap ki dukaan abhi band hai aur marketplace mein nazar nahi aa rahi. support@ronaq.pk par rabta karein.",
};

export default async function SellerHome({ searchParams }: { searchParams: Promise<{ welcome?: string; claimed?: string }> }) {
  const { vendor } = await requireVendorPage();
  const sp = await searchParams;
  const [c, tips, m, demand, recent] = await Promise.all([
    vendorCompleteness(vendor.id),
    vendorTips(vendor.id),
    vendorMetrics(vendor.id),
    vendorDemand(vendor.id, vendor.ownerId),
    db.select({ i: s.inquiries, name: s.users.name }).from(s.inquiries).innerJoin(s.users, eq(s.users.id, s.inquiries.consumerId)).where(eq(s.inquiries.vendorId, vendor.id)).orderBy(desc(s.inquiries.lastMessageAt)).limit(5),
  ]);
  return (
    <div data-stagger suppressHydrationWarning className="wrap grid gap-6 py-8">
      {(sp.welcome || sp.claimed) && (
        <div className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-blue p-6 text-sand">
          <Confetti />
          <p className="font-display text-2xl">{sp.claimed ? "Profile claim ho gayi. Khush aamdeed!" : "Mubarak ho! Aap ki dukaan live hai"}</p>
          <p className="mt-1 text-sand/85">Khareedar ab aap ko marketplace mein dekh sakte hain. Neeche ke tips se aur zyada queries milengi.</p>
          <Link href={`/v/${vendor.slug}`} className="btn btn-sm mt-4 w-fit">Apni live dukaan dekhein <ExternalLink size={14} /></Link>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card card-shadow bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="h-display text-2xl">Dukaan ka status</h1>
            <div className="flex items-center gap-3">{vendor.founding && <FoundingBadge number={vendor.foundingNumber} className="ml-3" />}<StatusChip status={vendor.status} /></div>
          </div>
          <p className="mt-2">{STATUS_COPY[vendor.status]}</p>
          {vendor.statusReason && <p className="mt-3 rounded-xl border-2 border-red bg-red-soft p-3 text-sm"><b>Ronaq team ka note:</b> {vendor.statusReason}</p>}
          {vendor.pendingChanges && vendor.status === "approved" && <p className="mt-3 rounded-xl bg-sun/40 p-3 text-sm">Team aap ki tabdeeli dekh rahi hai. Tab tak dukaan live rahegi.</p>}
          <div className="mt-5">
            <div className="flex items-baseline justify-between"><p className="font-bold">Profile {tips.percent}% mukammal</p><p className="text-sm text-mute">{tips.done}/{tips.total}</p></div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink"><div className="bar-fill h-full bg-[repeating-linear-gradient(-45deg,var(--color-red)_0_8px,var(--color-blue)_8px_16px)]" style={{ width: `${tips.percent}%` }} /></div>
            {tips.tips.length > 0 ? (
              <>
                <h2 className="mt-5 flex items-center gap-2 font-display text-base"><Sparkles size={16} className="text-red" /> Dukaan ko aur behtar banayein</h2>
                <ul data-stagger suppressHydrationWarning className="mt-2 grid gap-2 sm:grid-cols-2">
                  {tips.tips.map((t) => (
                    <li key={t.key}><Link href={t.href} className="group flex h-full items-start justify-between gap-2 rounded-xl border-2 border-ink/15 p-3 transition hover:border-ink hover:bg-sand">
                      <span><span className="block text-sm font-bold">{t.title}</span><span className="block text-xs text-mute">{t.why}</span></span>
                      <ArrowRight size={16} className="mt-0.5 flex-none text-red transition-transform group-hover:translate-x-0.5" />
                    </Link></li>
                  ))}
                </ul>
              </>
            ) : <p className="mt-3 text-sm font-bold text-green">Shabash! Aap ki profile mukammal hai.</p>}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/seller/profile" className="btn btn-sm">Profile edit karein</Link>
            <Link href={`/v/${vendor.slug}`} className="btn btn-sm">{vendor.status === "approved" ? "Live dukaan dekhein" : "Preview dekhein"} <ExternalLink size={14} /></Link>
          </div>
        </section>

        <section className="card bg-white p-6">
          <h2 className="font-display text-xl">Dukaan ka haal</h2>
          <p className="text-xs text-mute">Sirf aap ka apna data</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Metric icon={Eye} k="Profile dekhi gayi" v={m.views} />
            <Metric icon={MousePointerClick} k="Contact dabaya" v={m.contactClicks} />
            <Metric icon={MessageCircle} k="Queries" v={m.inquiries} />
            <Metric icon={Heart} k="Shortlist hue (30 din)" v={demand.shortlisted} />
            <Metric icon={CalendarCheck} k="Book hue (30 din)" v={demand.booked} />
            <Metric icon={Reply} k="Jawab ki rate" v={m.responseRate == null ? "—" : `${m.responseRate}%`} />
            <Metric icon={Timer} k="Pehla jawab" v={m.avgResponseHours == null ? "—" : `${m.avgResponseHours} h`} />
          </dl>
        </section>
      </div>

      <section className="card flex flex-wrap items-center justify-between gap-4 border-dashed bg-sand/50 p-6">
        <div className="min-w-[240px] flex-1">
          <h2 className="font-display text-xl">Khud test karein</h2>
          <p className="mt-1 text-sm text-mute">Dekhna hai queries kaise aati hain? Apne aap ko test query bhejein, jawab dein, phir khareedar view mein apna jawab dekhein. Yeh kisi aur ko nazar nahi aati aur aap ke numbers mein shamil nahi hoti.</p>
        </div>
        <TestQueryButton />
      </section>

      <section className="card bg-white p-6">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">Nayi queries</h2><Link href="/seller/inquiries" className="text-sm font-bold text-blue underline">Saari queries</Link></div>
        <ul className="mt-3">
          {recent.length === 0 && <li className="text-mute">Abhi koi query nahi. Jaise hi koi khareedar message karega, yahan nazar aayegi.</li>}
          {recent.map(({ i, name }) => (
            <li key={i.id}><Link href={`/seller/inquiries/${i.id}`} className={`dashed-top flex items-center justify-between gap-3 py-3 ${i.vendorUnread ? "font-bold" : ""}`}>
              <span className="min-w-0"><span className="block truncate">{name}{i.shared?.service ? ` · ${i.shared.service}` : ""}</span><span className="text-xs font-normal text-mute">{timeAgo(i.lastMessageAt)}</span></span>
              <span className="flex items-center gap-2">{i.vendorUnread > 0 && <span className="rounded-full bg-red px-2 text-xs text-sand">{i.vendorUnread} new</span>}<StatusChip status={i.status} label={INQUIRY_STATUS_LABELS[i.status]} /></span>
            </Link></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Metric({ icon: I, k, v }: { icon: typeof Eye; k: string; v: number | string }) {
  return (
    <div className="rounded-xl border-2 border-ink/10 p-3">
      <dt className="flex items-center gap-1.5 text-xs text-mute"><I size={14} /> {k}</dt>
      <dd className="mt-1 font-display text-2xl tabular">{v}</dd>
    </div>
  );
}
