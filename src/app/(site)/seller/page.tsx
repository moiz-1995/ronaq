import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Eye, MousePointerClick, MessageCircle, Heart, Timer, Reply, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireVendorPage, vendorCompleteness, vendorMetrics } from "@/lib/seller";
import { timeAgo } from "@/lib/time";
import { StatusChip, FoundingBadge } from "@/components/ui/badges";
import { INQUIRY_STATUS_LABELS } from "@/lib/domain";
import { SubmitForReview } from "./SubmitForReview";
import { Confetti } from "@/components/ui/Confetti";

export const metadata = { title: "Business dashboard" };

const STATUS_COPY: Record<string, string> = {
  draft: "Your profile is a private draft. Complete the checklist and submit it for review.",
  pending: "Submitted! Our team usually reviews profiles within 2 working days. We'll notify you.",
  approved: "Your profile is live in the marketplace.",
  rejected: "Your profile needs changes before it can go live. See the note below, update it and submit again.",
  suspended: "Your profile is suspended and hidden from the marketplace. Contact support@ronaq.pk.",
};

export default async function SellerHome({ searchParams }: { searchParams: Promise<{ welcome?: string; claimed?: string }> }) {
  const { vendor } = await requireVendorPage();
  const sp = await searchParams;
  const [c, m, recent] = await Promise.all([
    vendorCompleteness(vendor.id),
    vendorMetrics(vendor.id),
    db.select({ i: s.inquiries, name: s.users.name }).from(s.inquiries).innerJoin(s.users, eq(s.users.id, s.inquiries.consumerId)).where(eq(s.inquiries.vendorId, vendor.id)).orderBy(desc(s.inquiries.lastMessageAt)).limit(5),
  ]);
  return (
    <div className="wrap grid gap-6 py-8">
      {(sp.welcome || sp.claimed) && (
        <div className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-blue p-6 text-sand">
          <Confetti />
          <p className="font-display text-2xl">{sp.claimed ? "Profile claimed. Welcome!" : "Your dukaan is open (as a draft)!"}</p>
          <p className="mt-1 text-sand/85">Next: add prices to your services and upload at least 3 photos of your work.</p>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card card-shadow bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="h-display text-2xl">Profile status</h1>
            <div className="flex items-center gap-3">{vendor.founding && <FoundingBadge number={vendor.foundingNumber} className="ml-3" />}<StatusChip status={vendor.status} /></div>
          </div>
          <p className="mt-2">{STATUS_COPY[vendor.status]}</p>
          {vendor.statusReason && <p className="mt-3 rounded-xl border-2 border-red bg-red-soft p-3 text-sm"><b>Note from Ronaq:</b> {vendor.statusReason}</p>}
          {vendor.pendingChanges && vendor.status === "approved" && <p className="mt-3 rounded-xl bg-sun/40 p-3 text-sm">Recent changes are waiting for a quick review. Your profile stays live meanwhile.</p>}
          <div className="mt-5">
            <div className="flex items-baseline justify-between"><p className="font-bold">Profile {c.percent}% complete</p><p className="text-sm text-mute">{c.done}/{c.total}</p></div>
            <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-ink"><div className="h-full bg-[repeating-linear-gradient(-45deg,var(--color-red)_0_8px,var(--color-blue)_8px_16px)]" style={{ width: `${c.percent}%` }} /></div>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {c.items.map((it) => (
                <li key={it.key} className={`flex items-center gap-2 text-sm ${it.done ? "text-mute line-through" : "font-medium"}`}>
                  {it.done ? <CheckCircle2 size={16} className="text-green" /> : <Circle size={16} className="text-red" />} {it.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {(vendor.status === "draft" || vendor.status === "rejected") && <SubmitForReview ready={c.ready} />}
            <Link href="/seller/profile" className="btn btn-sm">Edit profile</Link>
            <Link href={`/v/${vendor.slug}`} className="btn btn-sm">{vendor.status === "approved" ? "View live profile" : "Preview profile"} <ExternalLink size={14} /></Link>
          </div>
        </section>

        <section className="card bg-white p-6">
          <h2 className="font-display text-xl">Performance</h2>
          <p className="text-xs text-mute">All time · only your own data</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Metric icon={Eye} k="Profile views" v={m.views} />
            <Metric icon={MousePointerClick} k="Contact taps" v={m.contactClicks} />
            <Metric icon={MessageCircle} k="Inquiries" v={m.inquiries} />
            <Metric icon={Heart} k="Saved by families" v={m.saves} />
            <Metric icon={Reply} k="Response rate" v={m.responseRate == null ? "—" : `${m.responseRate}%`} />
            <Metric icon={Timer} k="Avg. first reply" v={m.avgResponseHours == null ? "—" : `${m.avgResponseHours} h`} />
          </dl>
        </section>
      </div>

      <section className="card bg-white p-6">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl">Latest inquiries</h2><Link href="/seller/inquiries" className="text-sm font-bold text-blue underline">All inquiries</Link></div>
        <ul className="mt-3">
          {recent.length === 0 && <li className="text-mute">No inquiries yet. Complete your profile and get it approved to start receiving them.</li>}
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
