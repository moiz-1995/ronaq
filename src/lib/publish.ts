import "server-only";
import { eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { foundingOnApproval } from "./domain";
import { getSetting } from "./settings";

/** The vendor fields that put a profile live, including a founding number while places remain. */
export async function publishFields(v: { founding: boolean; approvedAt: Date | null }) {
  const cap = await getSetting("foundingCap");
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(s.vendors).where(eq(s.vendors.founding, true));
  const f = foundingOnApproval(Number(n), cap, v.founding);
  return {
    status: "approved" as const,
    statusReason: null,
    approvedAt: v.approvedAt ?? new Date(),
    ...(f.number ? { founding: true, foundingNumber: f.number } : {}),
  };
}
