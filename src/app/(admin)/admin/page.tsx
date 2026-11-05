import { and, eq, gte, inArray, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireStaff } from "@/lib/auth";
import { getAllCategories, getCities } from "@/lib/queries";
import { AdminHeader, BarList, Tile } from "@/components/admin/ui";

export const metadata = { title: "Overview" };

/** FR-ADM-009: supply, activity, inquiry funnel and moderation — filterable by date, category and city. */
export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ days?: string; city?: string; category?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const days = [7, 30, 90, 365].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const since = new Date(Date.now() - days * 86400000);
  const [cities, cats] = await Promise.all([getCities(), getAllCategories()]);
  const cityF = sp.city && cities.some((c) => c.id === sp.city) ? sp.city : undefined;
  const catF = sp.category && cats.some((c) => c.id === sp.category) ? sp.category : undefined;

  const evConds = [gte(s.analyticsEvents.createdAt, since)];
  if (cityF) evConds.push(eq(s.analyticsEvents.cityId, cityF));
  if (catF) evConds.push(eq(s.analyticsEvents.categoryId, catF));
  const evCounts = await db.select({ name: s.analyticsEvents.name, n: sql<number>`count(*)` }).from(s.analyticsEvents).where(and(...evConds)).groupBy(s.analyticsEvents.name);
  const ev = (k: string) => Number(evCounts.find((e) => e.name === k)?.n ?? 0);

  const vendorRows = await db.select({ v: s.vendors, cat: s.vendorServices.categoryId }).from(s.vendors).leftJoin(s.vendorServices, eq(s.vendorServices.vendorId, s.vendors.id));
  const byVendor = new Map<string, { status: string; cityId: string | null; cats: Set<string>; founding: boolean; updated: number }>();
  for (const { v, cat } of vendorRows) {
    const x = byVendor.get(v.id) ?? { status: v.status, cityId: v.cityId, cats: new Set<string>(), founding: v.founding, updated: v.updatedAt.getTime() };
    if (cat) x.cats.add(cat);
    byVendor.set(v.id, x);
  }
  const vendors = [...byVendor.values()].filter((v) => (!cityF || v.cityId === cityF) && (!catF || v.cats.has(catF)));
  const approved = vendors.filter((v) => v.status === "approved");
  const stale = approved.filter((v) => v.updated < Date.now() - 90 * 86400000).length;

  const inqConds = [gte(s.inquiries.createdAt, since)];
  if (catF) inqConds.push(eq(s.inquiries.categoryId, catF));
  if (cityF) inqConds.push(inArray(s.inquiries.vendorId, db.select({ id: s.vendors.id }).from(s.vendors).where(eq(s.vendors.cityId, cityF))));
  const inqs = await db.select().from(s.inquiries).where(and(...inqConds));
  const responded = inqs.filter((i) => i.firstResponseAt);
  const within24 = responded.filter((i) => i.firstResponseAt!.getTime() - i.createdAt.getTime() < 86400000).length;

  const [[users], [newUsers], [openReports], [pendingReviews]] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(s.users),
    db.select({ n: sql<number>`count(*)` }).from(s.users).where(gte(s.users.createdAt, since)),
    db.select({ n: sql<number>`count(*)` }).from(s.reports).where(sql`${s.reports.status} in ('open','assigned')`),
    db.select({ n: sql<number>`count(*)` }).from(s.reviews).where(eq(s.reviews.status, "pending")),
  ]);
  const searches = ev("guest_search_performed") + ev("search_performed");

  return (
    <>
      <AdminHeader title="Overview" sub={`Last ${days} days${cityF ? ` · ${cities.find((c) => c.id === cityF)?.name}` : ""}${catF ? ` · ${cats.find((c) => c.id === catF)?.name}` : ""}`}>
        <form className="flex flex-wrap gap-2" aria-label="Filters">
          <select name="days" defaultValue={days} className="input !min-h-10 !w-auto !py-1.5 text-sm" aria-label="Date range">{[7, 30, 90, 365].map((d) => <option key={d} value={d}>Last {d} days</option>)}</select>
          <select name="city" defaultValue={cityF ?? ""} className="input !min-h-10 !w-auto !py-1.5 text-sm" aria-label="City"><option value="">All cities</option>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select name="category" defaultValue={catF ?? ""} className="input !min-h-10 !w-auto !py-1.5 text-sm" aria-label="Category"><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <button className="btn btn-sm btn-ink">Apply</button>
        </form>
      </AdminHeader>
      <div className="grid gap-6 p-4 sm:p-8">
        <section aria-label="Headline numbers" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Tile label="Live vendors" value={approved.length} hint={`${vendors.filter((v) => v.status === "pending").length} waiting review`} />
          <Tile label="Founding vendors" value={vendors.filter((v) => v.founding).length} />
          <Tile label="Users" value={Number(users.n)} hint={`+${Number(newUsers.n)} in period`} />
          <Tile label="Inquiries" value={inqs.length} />
          <Tile label="Replied in 24h" value={inqs.length ? `${Math.round((within24 / inqs.length) * 100)}%` : "—"} hint={`${responded.length} replied at all`} />
          <Tile label="Moderation queue" value={Number(openReports.n) + Number(pendingReviews.n)} hint={`${Number(openReports.n)} reports · ${Number(pendingReviews.n)} reviews`} />
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <BarList title="Marketplace funnel (events in period)" rows={[
            { label: "Searches", value: searches },
            { label: "Profile views", value: ev("vendor_profile_viewed") },
            { label: "Contact taps", value: ev("contact_cta_clicked") },
            { label: "Inquiries sent", value: ev("inquiry_created") },
            { label: "Vendor replies", value: ev("inquiry_response_sent") },
          ]} />
          <BarList title="Planner activation (events in period)" rows={[
            { label: "Sign-ups", value: ev("registration_completed") },
            { label: "Onboarding done", value: ev("onboarding_completed") },
            { label: "Launchpad started", value: ev("launchpad_started") },
            { label: "Launchpad done", value: ev("launchpad_completed") },
            { label: "Events created", value: ev("event_created") },
            { label: "Shortlist saves", value: ev("shortlist_added") },
          ]} />
          <BarList title="Live vendors by category" rows={cats.map((c) => ({ label: c.name, value: approved.filter((v) => v.cats.has(c.id)).length })).sort((a, b) => b.value - a.value)} />
          <BarList title="Live vendors by city" rows={cities.filter((c) => c.active || approved.some((v) => v.cityId === c.id)).map((c) => ({ label: c.name, value: approved.filter((v) => v.cityId === c.id).length })).sort((a, b) => b.value - a.value)} />
          <BarList title="Supply pipeline" rows={(["draft", "pending", "approved", "rejected", "suspended"] as const).map((st) => ({ label: st[0].toUpperCase() + st.slice(1), value: vendors.filter((v) => v.status === st).length }))} />
          <BarList title="Marketplace health" rows={[
            { label: "Stale (90+ days)", value: stale },
            { label: "Unanswered inquiries", value: inqs.filter((i) => !i.firstResponseAt && i.status !== "closed").length },
            { label: "Reports filed", value: ev("report_submitted") },
            { label: "Reports resolved", value: ev("report_resolved") },
          ]} />
        </div>
        <p className="text-xs text-mute">Analytics use pseudonymous IDs and never include message text or private event details (PRD §17–18).</p>
      </div>
    </>
  );
}
