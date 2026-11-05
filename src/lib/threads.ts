import "server-only";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";

/** Load a conversation if, and only if, the user is one of its two parties. */
export async function loadThreadFor(inquiryId: string, userId: string) {
  const inq = await db.query.inquiries.findFirst({ where: eq(s.inquiries.id, inquiryId) });
  if (!inq) return null;
  const vendor = await db.query.vendors.findFirst({ where: eq(s.vendors.id, inq.vendorId) });
  const role = inq.consumerId === userId ? "consumer" : vendor?.ownerId === userId ? "vendor" : null;
  if (!role || !vendor) return null;
  return { inq, vendor, role } as const;
}

/** Opening a thread clears your unread count; a vendor opening it marks it delivered. */
export async function markThreadRead(inquiryId: string, role: "consumer" | "vendor") {
  const inq = await db.query.inquiries.findFirst({ where: eq(s.inquiries.id, inquiryId) });
  if (!inq) return;
  if (role === "consumer") await db.update(s.inquiries).set({ consumerUnread: 0 }).where(eq(s.inquiries.id, inquiryId));
  else await db.update(s.inquiries).set({ vendorUnread: 0, status: inq.status === "sent" ? "delivered" : inq.status }).where(eq(s.inquiries.id, inquiryId));
}
