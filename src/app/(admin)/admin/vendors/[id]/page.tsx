import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getAllCategories, getAreas, getCities } from "@/lib/queries";
import { completeness } from "@/lib/domain";
import { displayPrice } from "@/lib/price";
import { formatDateTime } from "@/lib/time";
import { getSetting } from "@/lib/settings";
import { moderateVendor } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/ui";
import { OpForm } from "@/components/admin/OpForm";
import { StatusChip } from "@/components/ui/badges";
import { Picture } from "@/components/art/CraftArt";
import { VendorEditForm, VerifyForm } from "./forms";

export const metadata = { title: "Vendor" };

export default async function AdminVendor({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const v = await db.query.vendors.findFirst({ where: eq(s.vendors.id, id) });
  if (!v) notFound();
  const [services, portfolio, cats, areas, cities, owner, logs, [{ n: inq }], featuredEnabled] = await Promise.all([
    db.select().from(s.vendorServices).where(eq(s.vendorServices.vendorId, id)),
    db.select().from(s.portfolioItems).where(eq(s.portfolioItems.vendorId, id)).orderBy(asc(s.portfolioItems.sortOrder)),
    getAllCategories(), getAreas(), getCities(),
    v.ownerId ? db.query.users.findFirst({ where: eq(s.users.id, v.ownerId) }) : Promise.resolve(null),
    db.select({ a: s.auditLog, actor: s.users.name }).from(s.auditLog).leftJoin(s.users, eq(s.users.id, s.auditLog.actorId)).where(and(eq(s.auditLog.objectType, "vendor"), eq(s.auditLog.objectId, id))).orderBy(desc(s.auditLog.createdAt)).limit(30),
    db.select({ n: sql<number>`count(*)` }).from(s.inquiries).where(eq(s.inquiries.vendorId, id)),
    getSetting("featuredEnabled"),
  ]);
  const c = completeness({ ...v, services, portfolioCount: portfolio.filter((p) => p.status === "visible").length });
  const hidden = { id };
  return (
    <>
      <AdminHeader title={v.name} sub={`${cities.find((x) => x.id === v.cityId)?.name ?? "No city"} · ${areas.find((a) => a.id === v.areaId)?.name ?? "no area"} · ${owner ? `owner ${owner.email}` : "unclaimed (created by Ronaq ops)"}`}>
        <div className="flex items-center gap-2"><StatusChip status={v.status} /><Link href={`/v/${v.slug}`} className="btn btn-sm" target="_blank">Preview <ExternalLink size={14} /></Link></div>
      </AdminHeader>
      <div className="grid gap-6 p-4 sm:p-8 xl:grid-cols-[1fr_380px]">
        <div className="grid min-w-0 content-start gap-6">
          {v.statusReason && <p className="rounded-xl border-2 border-red bg-red-soft p-3 text-sm"><b>Current note to vendor:</b> {v.statusReason}</p>}
          {v.pendingChanges && <p className="rounded-xl bg-sun/40 p-3 text-sm">This live profile has <b>material changes</b> waiting for a look (see audit history). Approve again or clear the flag.</p>}
          <section className="rounded-2xl border-2 border-ink/10 bg-white p-5">
            <h2 className="font-display">Completeness · {c.percent}%</h2>
            <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">{c.items.map((i) => <li key={i.key}>{i.done ? "✅" : "⬜️"} {i.label}</li>)}</ul>
          </section>
          <section className="rounded-2xl border-2 border-ink/10 bg-white p-5">
            <h2 className="font-display">Profile</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-[220px_1fr]">
              <div className="aspect-[4/3] overflow-hidden rounded-xl border-2 border-ink"><Picture src={v.coverImage} alt="Cover" fallbackKind={cats.find((x) => x.id === services[0]?.categoryId)?.art} seed={7} ratio={4 / 3} className="h-full w-full" /></div>
              <dl className="grid gap-1 text-sm">
                <div><dt className="inline text-mute">Description: </dt><dd className="inline">{v.description ?? "—"}</dd></div>
                <div><dt className="inline text-mute">Type: </dt><dd className="inline">{v.businessType ?? "—"}, {v.experienceYears ?? "?"} yrs</dd></div>
                <div><dt className="inline text-mute">Modes: </dt><dd className="inline">{v.modes?.join(", ") || "—"}</dd></div>
                <div><dt className="inline text-mute">Serves: </dt><dd className="inline">{v.servesWholeCity ? "whole city" : `${v.serviceAreaIds?.length ?? 0} areas${v.serviceRadiusKm ? `, ${v.serviceRadiusKm} km radius` : ""}`}</dd></div>
                <div><dt className="inline text-mute">Phone: </dt><dd className="inline">{v.phone ?? "—"} {v.revealContact ? "(shown to families)" : "(private)"}</dd></div>
                <div><dt className="inline text-mute">Inquiries: </dt><dd className="inline">{Number(inq)} · views {v.views} · rating {v.ratingAvg} ({v.ratingCount})</dd></div>
              </dl>
            </div>
          </section>
          <section className="rounded-2xl border-2 border-ink/10 bg-white p-5">
            <h2 className="font-display">Services</h2>
            <ul className="mt-2 grid gap-2 text-sm">
              {services.map((x) => { const p = displayPrice(x.pricingModel, x.priceAmount); return <li key={x.id} className="flex justify-between gap-3 border-t border-ink/10 pt-2"><span><b>{x.title}</b> · {cats.find((cc) => cc.id === x.categoryId)?.name}</span><span>{p.lead} {p.amount} {p.unit}</span></li>; })}
            </ul>
          </section>
          <section className="rounded-2xl border-2 border-ink/10 bg-white p-5">
            <h2 className="font-display">Portfolio ({portfolio.length})</h2>
            <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">{portfolio.map((p) => <li key={p.id} className="relative aspect-square overflow-hidden rounded-lg border-2 border-ink"><Picture src={p.imageUrl} alt={p.caption ?? ""} className="h-full w-full" />{p.status !== "visible" && <span className="absolute inset-x-0 bottom-0 bg-ink/80 text-center text-[10px] text-sand">{p.status}</span>}</li>)}</ul>
          </section>
          <section className="rounded-2xl border-2 border-ink/10 bg-white p-5">
            <h2 className="font-display">Edit on the vendor&apos;s behalf</h2>
            <p className="text-xs text-mute">Assisted onboarding (FR-SEL-006). Every change is logged with your name.</p>
            <VendorEditForm v={{ id: v.id, name: v.name, description: v.description, ownerName: v.ownerName, phone: v.phone, whatsapp: v.whatsapp }} />
          </section>
          <section className="rounded-2xl border-2 border-ink/10 bg-white p-5">
            <h2 className="font-display">Audit history</h2>
            <ul className="mt-2 grid gap-1 text-sm">
              {logs.length === 0 && <li className="text-mute">No actions yet.</li>}
              {logs.map(({ a, actor }) => <li key={a.id} className="border-t border-ink/10 pt-1"><span className="text-mute">{formatDateTime(a.createdAt)}</span> · <b>{a.action}</b> by {actor ?? "system"}{a.reason ? `: “${a.reason}”` : ""}</li>)}
            </ul>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-2xl border-[3px] border-ink bg-white p-5">
            <h2 className="font-display">Decision</h2>
            <div className="mt-3 grid gap-3">
              {(v.status === "pending" || v.status === "draft" || v.status === "rejected" || v.pendingChanges) && (
                <OpForm action={moderateVendor} hidden={{ ...hidden, op: "approve" }} label={v.pendingChanges && v.status === "approved" ? "Approve changes" : "Approve & publish"} className="btn btn-sm btn-blue" confirm={!c.ready} />
              )}
              {!c.ready && v.status !== "approved" && <p className="text-xs text-red">Profile is incomplete. Approve only if you&apos;ve checked it with the vendor.</p>}
              {(v.status === "pending" || v.status === "draft") && <OpForm action={moderateVendor} hidden={{ ...hidden, op: "reject" }} label="Send back with changes" reason="What should the vendor fix?" />}
              {v.status === "approved" && <OpForm action={moderateVendor} hidden={{ ...hidden, op: "suspend" }} label="Suspend" reason="Reason for suspension (vendor sees this)" className="btn btn-sm btn-red" />}
              {v.status === "suspended" && <OpForm action={moderateVendor} hidden={{ ...hidden, op: "reinstate" }} label="Reinstate" />}
              {v.pendingChanges && <OpForm action={moderateVendor} hidden={{ ...hidden, op: "clear_changes" }} label="Clear change flag" />}
            </div>
          </section>
          <section className="rounded-2xl border-2 border-ink/10 bg-white p-5">
            <h2 className="font-display">Founding &amp; placement</h2>
            <p className="mt-1 text-sm">{v.founding ? `Founding vendor #${v.foundingNumber ?? "?"}` : "Not a founding vendor"}. First approvals become founding automatically until the cap is reached.</p>
            <div className="mt-3 grid gap-2">
              <OpForm action={moderateVendor} hidden={{ ...hidden, op: v.founding ? "founding_off" : "founding_on" }} label={v.founding ? "Remove founding status" : "Make founding vendor"} confirm />
              <OpForm action={moderateVendor} hidden={{ ...hidden, op: v.featured ? "featured_off" : "featured_on" }} label={v.featured ? "Remove featured" : "Feature (shows “Sponsored”)"} />
              {!featuredEnabled && <p className="text-xs text-mute">Featured placement is off in Settings (not active in MVP).</p>}
            </div>
          </section>
          <section className="rounded-2xl border-2 border-ink/10 bg-white p-5">
            <h2 className="font-display">Verification badges</h2>
            <VerifyForm id={v.id} phone={v.phoneVerified} email={v.emailVerified} reviewed={v.profileReviewed} />
          </section>
          {!v.ownerId && (
            <section className="rounded-2xl border-2 border-ink/10 bg-white p-5">
              <h2 className="font-display">Claim code</h2>
              <p className="mt-1 text-sm">{v.claimCode ? <>Current code: <b className="select-all font-mono">{v.claimCode}</b></> : "No code yet."} The vendor enters it at /sell/claim to take over this profile.</p>
              <div className="mt-2"><OpForm action={moderateVendor} hidden={{ ...hidden, op: "claim_code" }} label={v.claimCode ? "Generate a new code" : "Generate code"} /></div>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
