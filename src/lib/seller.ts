import "server-only";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "./auth";
import { completeness, profileTips } from "./domain";

export async function requireVendorPage(path = "/seller") {
  const user = await requireUser(path);
  const vendor = await db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, user.id) });
  if (!vendor) redirect("/seller/onboarding");
  return { user, vendor };
}

export async function vendorCompleteness(vendorId: string) {
  const vendor = (await db.query.vendors.findFirst({ where: eq(s.vendors.id, vendorId) }))!;
  const services = await db.select().from(s.vendorServices).where(eq(s.vendorServices.vendorId, vendorId));
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(s.portfolioItems).where(and(eq(s.portfolioItems.vendorId, vendorId), eq(s.portfolioItems.status, "visible")));
  return completeness({ ...vendor, services, portfolioCount: Number(n) });
}

/** FR-SEL-011: metrics come only from this vendor's own data. */
export async function vendorMetrics(vendorId: string) {
  const v = (await db.query.vendors.findFirst({ where: eq(s.vendors.id, vendorId) }))!;
  const inqs = await db.select().from(s.inquiries).where(eq(s.inquiries.vendorId, vendorId));
  const responded = inqs.filter((i) => i.firstResponseAt);
  const avgH = responded.length ? responded.reduce((a, i) => a + Math.max(0, i.firstResponseAt!.getTime() - i.createdAt.getTime()), 0) / responded.length / 3600000 : null;
  const [{ n: saves }] = await db.select({ n: sql<number>`count(*)` }).from(s.shortlist).where(eq(s.shortlist.vendorId, vendorId));
  return {
    views: v.views, contactClicks: v.contactClicks, inquiries: inqs.length, saves: Number(saves),
    responseRate: inqs.length ? Math.round((responded.length / inqs.length) * 100) : null,
    avgResponseHours: avgH == null ? null : Math.round(avgH * 10) / 10,
    unread: inqs.reduce((a, i) => a + i.vendorUnread, 0),
  };
}

export async function vendorTips(vendorId: string) {
  const vendor = (await db.query.vendors.findFirst({ where: eq(s.vendors.id, vendorId) }))!;
  const services = await db.select().from(s.vendorServices).where(eq(s.vendorServices.vendorId, vendorId));
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(s.portfolioItems).where(and(eq(s.portfolioItems.vendorId, vendorId), eq(s.portfolioItems.status, "visible")));
  return profileTips({ ...vendor, services, portfolioCount: Number(n) });
}
