import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";

/** Recompute a vendor's rating from published reviews only. */
export async function refreshRating(vendorId: string) {
  const [r] = await db
    .select({ avg: sql<number>`coalesce(avg(${s.reviews.rating}), 0)`, n: sql<number>`count(*)` })
    .from(s.reviews)
    .where(and(eq(s.reviews.vendorId, vendorId), eq(s.reviews.status, "published")));
  await db.update(s.vendors).set({ ratingAvg: Math.round(Number(r.avg) * 10) / 10, ratingCount: Number(r.n) }).where(eq(s.vendors.id, vendorId));
}
