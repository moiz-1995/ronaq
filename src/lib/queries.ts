import "server-only";
import { and, asc, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { cache } from "react";
import { db, schema as s } from "@/db";
import type { User } from "@/db/schema";
import { notificationAudience } from "./mode";

export const getCities = cache(async () => db.select().from(s.cities).orderBy(asc(s.cities.sortOrder)));
export const getActiveCities = cache(async () => db.select().from(s.cities).where(eq(s.cities.active, true)).orderBy(asc(s.cities.sortOrder)));
export const getAreas = cache(async (cityId?: string) =>
  cityId ? db.select().from(s.areas).where(eq(s.areas.cityId, cityId)).orderBy(asc(s.areas.name)) : db.select().from(s.areas).orderBy(asc(s.areas.name)),
);
export const getCategories = cache(async () => db.select().from(s.categories).where(eq(s.categories.active, true)).orderBy(asc(s.categories.sortOrder)));
export const getAllCategories = cache(async () => db.select().from(s.categories).orderBy(asc(s.categories.sortOrder)));
export const getCategoryBySlug = cache(async (slug: string) => db.query.categories.findFirst({ where: eq(s.categories.slug, slug) }));
export const getAttributes = cache(async (categoryId: string) =>
  db.select().from(s.attributes).where(eq(s.attributes.categoryId, categoryId)).orderBy(asc(s.attributes.sortOrder)),
);
export const getTemplates = cache(async () => db.select().from(s.templates).orderBy(asc(s.templates.sortOrder)));

/** Vendor counts per category (approved only). */
export const getCategoryCounts = cache(async () => {
  const rows = await db
    .select({ categoryId: s.vendorServices.categoryId, n: sql<number>`count(distinct ${s.vendorServices.vendorId})` })
    .from(s.vendorServices)
    .innerJoin(s.vendors, eq(s.vendors.id, s.vendorServices.vendorId))
    .where(and(eq(s.vendors.status, "approved"), eq(s.vendorServices.active, true)))
    .groupBy(s.vendorServices.categoryId);
  return Object.fromEntries(rows.map((r) => [r.categoryId, Number(r.n)])) as Record<string, number>;
});

export const getMyVendor = cache(async (userId: string) => db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, userId) }));

export const getBadgeCounts = cache(async (user: User) => {
  const unread = await db.select({ type: s.notifications.type, href: s.notifications.href }).from(s.notifications).where(and(eq(s.notifications.userId, user.id), isNull(s.notifications.readAt)));
  const forVendor = unread.filter((x) => notificationAudience(x) === "vendor").length, forCustomer = unread.filter((x) => notificationAudience(x) === "customer").length;
  const [c] = await db.select({ n: sql<number>`coalesce(sum(${s.inquiries.consumerUnread}),0)` }).from(s.inquiries).where(eq(s.inquiries.consumerId, user.id));
  let vendorUnread = 0;
  const v = await getMyVendor(user.id);
  if (v) {
    const [x] = await db.select({ n: sql<number>`coalesce(sum(${s.inquiries.vendorUnread}),0)` }).from(s.inquiries).where(eq(s.inquiries.vendorId, v.id));
    vendorUnread = Number(x.n);
  }
  return { notifications: unread.length, notifVendor: forVendor, notifCustomer: forCustomer, inbox: Number(c.n), vendorInbox: vendorUnread };
});

export async function getPrimaryEvent(userId: string) {
  return db.query.events.findFirst({ where: and(eq(s.events.userId, userId), eq(s.events.isPrimary, true)) });
}

export async function getShortlistIds(userId: string | undefined | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await db.select({ v: s.shortlist.vendorId }).from(s.shortlist).where(eq(s.shortlist.userId, userId));
  return new Set(rows.map((r) => r.v));
}

/** Load the display bits a vendor card needs. */
export async function hydrateVendorCards(vendorIds: string[]) {
  if (!vendorIds.length) return [];
  const [vs, svcs, cats, areaRows, cityRows] = await Promise.all([
    db.select().from(s.vendors).where(inArray(s.vendors.id, vendorIds)),
    db.select().from(s.vendorServices).where(and(inArray(s.vendorServices.vendorId, vendorIds), eq(s.vendorServices.active, true))).orderBy(desc(s.vendorServices.createdAt)),
    getAllCategories(),
    getAreas(),
    getCities(),
  ]);
  const byId = new Map(vs.map((v) => [v.id, v]));
  return vendorIds
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((v) => {
      const services = svcs.filter((x) => x.vendorId === v!.id);
      const main = services[0];
      const cat = cats.find((c) => c.id === main?.categoryId);
      return {
        vendor: v!,
        service: main ?? null,
        category: cat ?? null,
        areaName: areaRows.find((a) => a.id === v!.areaId)?.name ?? null,
        cityName: cityRows.find((c) => c.id === v!.cityId)?.name ?? null,
      };
    });
}
export type VendorCardData = Awaited<ReturnType<typeof hydrateVendorCards>>[number];

/** Last 30 days: how many families shortlisted or marked this vendor as booked. A vendor's own account doesn't count. */
export async function vendorDemand(vendorId: string, ownerId: string | null) {
  const since = new Date(Date.now() - 30 * 86400000);
  const [[short], [booked]] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(s.shortlist).where(and(eq(s.shortlist.vendorId, vendorId), gte(s.shortlist.createdAt, since), sql`${s.shortlist.userId} is not ${ownerId}`)),
    db.select({ n: sql<number>`count(distinct ${s.checklistItems.eventId})` }).from(s.checklistItems).innerJoin(s.events, eq(s.events.id, s.checklistItems.eventId))
      .where(and(eq(s.checklistItems.selectedVendorId, vendorId), gte(s.checklistItems.bookedAt, since), inArray(s.checklistItems.status, ["booked", "completed"]), sql`${s.events.userId} is not ${ownerId}`)),
  ]);
  return { shortlisted: Number(short.n), booked: Number(booked.n) };
}
