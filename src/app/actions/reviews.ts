"use server";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { reviewEligibility } from "@/lib/domain";
import { refreshRating } from "@/lib/ratings";
import { notify } from "@/lib/track";

const schema = z.object({
  vendorId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Choose a star rating.").max(5),
  text: z.string().trim().max(1500).optional(),
  occasion: z.string().trim().max(60).optional(),
  evidence: z.string().trim().max(500).optional(),
});

export async function createReview(_: unknown, form: FormData): Promise<{ error?: string } | undefined> {
  const user = await requireUser();
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const vendor = await db.query.vendors.findFirst({ where: eq(s.vendors.id, d.vendorId) });
  if (!vendor) return { error: "Vendor not found." };
  const policy = await getSetting("reviewPolicy");
  const inq = await db.query.inquiries.findFirst({ where: and(eq(s.inquiries.consumerId, user.id), eq(s.inquiries.vendorId, vendor.id)) });
  const replies = inq ? Number((await db.select({ n: sql<number>`count(*)` }).from(s.messages).where(and(eq(s.messages.inquiryId, inq.id), eq(s.messages.senderRole, "vendor"))))[0].n) : 0;
  const mine = await db.query.reviews.findFirst({ where: and(eq(s.reviews.authorId, user.id), eq(s.reviews.vendorId, vendor.id)) });
  const el = reviewEligibility(policy, { signedIn: true, isOwner: vendor.ownerId === user.id, alreadyReviewed: !!mine, hasInquiry: !!inq, vendorReplies: replies });
  if (!el.allowed) return { error: el.reason };
  if (el.basis === "admin_evidence" && !d.evidence) return { error: "Tell us briefly how you used this vendor (date, event) so our team can check it." };
  const svc = await db.query.vendorServices.findFirst({ where: eq(s.vendorServices.vendorId, vendor.id) });
  await db.insert(s.reviews).values({
    authorId: user.id, vendorId: vendor.id, inquiryId: inq?.id ?? null, rating: d.rating,
    text: [d.text, d.evidence ? `\n\n[Evidence for Ronaq team: ${d.evidence}]` : ""].join("").trim() || null,
    occasion: d.occasion || null, categoryId: svc?.categoryId ?? null, basis: el.basis!, status: el.startsAs,
  });
  if (el.startsAs === "published") {
    await refreshRating(vendor.id);
    await notify(vendor.ownerId, { type: "review_new", title: `New ${d.rating}★ review`, body: d.text?.slice(0, 100), href: `/v/${vendor.slug}#rev` });
  }
  redirect(`/v/${vendor.slug}?reviewed=${el.startsAs}#rev`);
}
