import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Eye, MousePointerClick, MessageCircle, Heart, Timer, Reply, ExternalLink, CalendarCheck, ArrowRight, Sparkles } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireVendorPage, vendorMetrics, vendorTips } from "@/lib/seller";
import { vendorDemand } from "@/lib/queries";
import { timeAgo } from "@/lib/time";
import { StatusChip, FoundingBadge } from "@/components/ui/badges";
import { INQUIRY_STATUS_LABELS } from "@/lib/domain";
import { TestQueryButton } from "./TestQueryButton";
import { ShowStatusButton, StatusCard } from "./StatusCard";
import { cookies } from "next/headers";
import { STATUS_HIDDEN_COOKIE } from "@/lib/mode";
import { Confetti } from "@/components/ui/Confetti";

export const metadata = { title: "My Dukaan" };

const STATUS_COPY: Record<string, string> = {
  draft: "Your dukaan is still a draft. Upar Publish dabayein aur customers aap ko dhoond sakenge.",
  pending: "Sent for review. Team usually 2 din mein dekh leti hai, we'll let you know.",
  approved: "Mubarak ho! Your dukaan is live. Customers aap ko dhoond kar message kar sakte hain.",
  rejected: "A few changes are needed before going live. Neeche note parhein, update karein aur dobara bhejein.",
  suspended: "Your dukaan is suspended and hidden from the marketplace. Contact support@ronaq.pk.",
};

export default async function SellerHome({ searchParams }: { searchParams: Promise<{ welcome?: string; claimed?: string }> }) {
  const { vendor } = await requireVendorPage();
  const sp = await searchParams;
  const statusHidden = (await cookies()).get(STATUS_HIDDEN_COOKIE)?.value === "1";
  const [tips, m, demand, recent] = await Promise.all([
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
          <p className="font-display text-2xl">{sp.claimed ? "Profile claimed. Khush aamdeed!" : "Mubarak ho! Your dukaan is live"}</p>
          <p className="mt-1 text-sand/85">Customers can now find you in the marketplace. Neeche diye tips se aur zyada queries milengi.</p>
          <Link href={`/v/${vendor.slug}`} className="btn btn-sm mt-4 w-fit">View my live dukaan <ExternalLink size={14} /></Link>
        </div>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <section className="card card-shadow bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="h-display text-[clamp(1.8rem,4vw,2.6rem)]">Overview</h1>
              <p className="text-sm text-mute">How your dukaan is doing. Only you can see this.</p>
            </div>
            <ShowStatusButton initiallyHidden={statusHidden} />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            <Metric icon={Eye} k="Profile views" v={m.views} />
            <Metric icon={MousePointerClick} k="Contact taps" v={m.contactClicks} />
            <Metric icon={MessageCircle} k="Queries" v={m.inquiries} />
            <Metric icon={Heart} k="Shortlisted (30 days)" v={demand.shortlisted} />
            <Metric icon={CalendarCheck} k="Booked (30 days)" v={demand.booked} />
            <Metric icon={Reply} k="Response rate" v={m.responseRate == null ? "—" : `${m.responseRate}%`} />
            <Metric icon={Timer} k="Avg. first reply" v={m.avgResponseHours == null ? "—" : `${m.avgResponseHours} h`} />
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/seller/profile" className="btn btn-sm">Edit profile</Link>
            <Link href={`/v/${vendor.slug}`} className="btn btn-sm">{vendor.status === "approved" ? "View live dukaan" : "Preview"} <ExternalLink size={14} /></Link>
          </div>
        </section>

        <StatusCard initiallyHidden={statusHidden}>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <h2 className="font-display text-base">Profile status</h2>
            <StatusChip status={vendor.status} />
          </div>
          {vendor.founding && <div className="mt-2"><FoundingBadge number={vendor.foundingNumber} className="ml-3" /></div>}
          <p className="mt-2 text-sm">{STATUS_COPY[vendor.status]}</p>
          {vendor.statusReason && <p className="mt-2 rounded-xl border-2 border-red bg-red-soft p-2.5 text-sm"><b>Note from Ronaq:</b> {vendor.statusReason}</p>}
          {vendor.pendingChanges && vendor.status === "approved" && <p className="mt-2 rounded-xl bg-sun/40 p-2.5 text-sm">Our team is checking your changes. Tab tak dukaan live rahegi.</p>}
          <div className="mt-4">
            <div className="flex items-baseline justify-between text-sm"><p className="font-bold">Profile {tips.percent}% complete</p><p className="text-mute">{tips.done}/{tips.total}</p></div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full border-2 border-ink"><div className="bar-fill h-full bg-[repeating-linear-gradient(-45deg,var(--color-red)_0_8px,var(--color-blue)_8px_16px)]" style={{ width: `${tips.percent}%` }} /></div>
          </div>
          {tips.tips.length > 0 ? (
            <ul className="mt-3 grid gap-1.5">
              {tips.tips.slice(0, 3).map((t) => (
                <li key={t.key}><Link href={t.href} className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-bold hover:bg-sand">
                  <span className="flex items-center gap-1.5"><Sparkles size={13} className="flex-none text-red" /> {t.title}</span>
                  <ArrowRight size={14} className="flex-none text-red transition-transform group-hover:translate-x-0.5" />
                </Link></li>
              ))}
              {tips.tips.length > 3 && <li className="px-2 text-xs text-mute">+{tips.tips.length - 3} more tips. Fill them in from your profile.</li>}
            </ul>
          ) : <p className="mt-3 text-sm font-bold text-green">Shabash! Your profile is complete.</p>}
        </StatusCard>
      </div>

      <section className="card flex flex-wrap items-center justify-between gap-4 border-dashed bg-sand/50 p-6">
        <div className="min-w-[240px] flex-1">
          <h2 className="font-display text-xl">Test it yourself</h2>
          <p className="mt-1 text-sm text-mute">Dekhna hai queries kaise aati hain? Send yourself a test query, reply, phir customer view mein apna reply dekhein. Only you can see it, aur yeh aap ke numbers mein count nahi hoti.</p>
        </div>
        <TestQueryButton />
      </section>

      <section className="card bg-white p-6">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">Latest queries</h2><Link href="/seller/inquiries" className="text-sm font-bold text-blue underline">All queries</Link></div>
        <ul className="mt-3">
          {recent.length === 0 && <li className="text-mute">No queries yet. Jaise hi koi customer message karega, it will show up here.</li>}
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
    <div className="rounded-2xl border-2 border-ink/10 bg-paper/50 p-4">
      <dt className="flex items-center gap-1.5 text-xs font-bold text-mute"><I size={15} className="text-red" /> {k}</dt>
      <dd className="mt-2 font-display text-3xl tabular">{v}</dd>
    </div>
  );
}
