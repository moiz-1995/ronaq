import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { db, schema as s } from "@/db";

/** Everything a planner view needs about one event: items, linked vendors, quotes and budget totals. */
export async function loadEventPlan(eventId: string) {
  const items = await db.select().from(s.checklistItems).where(eq(s.checklistItems.eventId, eventId)).orderBy(asc(s.checklistItems.sortOrder), asc(s.checklistItems.createdAt));
  const ids = items.map((i) => i.id);
  const [links, quotes] = ids.length
    ? await Promise.all([
        db.select().from(s.checklistVendors).where(inArray(s.checklistVendors.checklistItemId, ids)),
        db.select().from(s.quotes).where(inArray(s.quotes.checklistItemId, ids)).orderBy(asc(s.quotes.createdAt)),
      ])
    : [[], []];
  const vendorIds = [...new Set([...links.map((l) => l.vendorId), ...items.map((i) => i.selectedVendorId).filter(Boolean) as string[]])];
  const vendors = vendorIds.length ? await db.select({ id: s.vendors.id, name: s.vendors.name, slug: s.vendors.slug, coverImage: s.vendors.coverImage, logoImage: s.vendors.logoImage }).from(s.vendors).where(inArray(s.vendors.id, vendorIds)) : [];
  const sorted = items.filter((i) => i.status === "booked" || i.status === "completed").length;
  const plannedBudget = items.reduce((a, i) => a + (i.budget ?? 0), 0);
  // per item: committed quote if any, else lowest quote = estimate
  let committed = 0, estimated = 0;
  for (const it of items) {
    const q = quotes.filter((x) => x.checklistItemId === it.id);
    const c = q.filter((x) => x.committed).reduce((a, x) => a + x.amount, 0);
    if (c) committed += c;
    else if (q.length) estimated += Math.min(...q.map((x) => x.amount));
  }
  return { items, links, quotes, vendors, stats: { total: items.length, sorted, inProgress: items.filter((i) => i.status === "searching" || i.status === "shortlisted").length, plannedBudget, committed, estimated } };
}
export type EventPlan = Awaited<ReturnType<typeof loadEventPlan>>;
