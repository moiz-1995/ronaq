"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { notify, track } from "@/lib/track";
import { loadThreadFor } from "@/lib/threads";

const inquirySchema = z.object({
  vendorId: z.string().min(1),
  eventId: z.string().optional(),
  checklistItemId: z.string().optional(),
  message: z.string().trim().min(10, "Write a short message (at least 10 characters) so the vendor knows what you need.").max(2000),
  service: z.string().trim().max(120).optional(),
});

/** FR-COM-001/002: the consumer chooses exactly which event details to share. */
export async function createInquiry(_: unknown, form: FormData): Promise<{ error?: string } | undefined> {
  const user = await requireUser();
  const parsed = inquirySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const vendor = await db.query.vendors.findFirst({ where: eq(s.vendors.id, d.vendorId) });
  if (!vendor || vendor.status !== "approved") return { error: "This vendor isn't taking inquiries right now." };
  if (vendor.ownerId === user.id) return { error: "You can't send an inquiry to your own business." };

  let ev = null;
  if (d.eventId) {
    ev = await db.query.events.findFirst({ where: and(eq(s.events.id, d.eventId), eq(s.events.userId, user.id)) });
  }
  const share = (k: string) => form.get(`share_${k}`) === "on";
  const shared: Record<string, string | number | undefined> = {};
  if (ev) {
    if (share("name")) shared.eventName = ev.name;
    if (share("date") && ev.date) shared.eventDate = ev.date;
    if (share("location") && ev.location) shared.location = ev.location;
    if (share("guests") && ev.guestCount) shared.guestCount = ev.guestCount;
  }
  const budget = Number(String(form.get("budget") ?? "").replace(/[^\d]/g, ""));
  if (share("budget") && budget > 0) shared.budget = budget;
  if (d.service) shared.service = d.service;

  const svc = await db.query.vendorServices.findFirst({ where: eq(s.vendorServices.vendorId, vendor.id) });
  const now = new Date();
  const [inq] = await db.insert(s.inquiries).values({
    consumerId: user.id, vendorId: vendor.id, eventId: ev?.id ?? null, checklistItemId: d.checklistItemId || null,
    categoryId: svc?.categoryId ?? null, shared, status: "sent", source: d.checklistItemId ? "checklist" : "profile",
    vendorUnread: 1, consumerUnread: 0, lastMessageAt: now,
  }).returning();
  await db.insert(s.messages).values({ inquiryId: inq.id, senderId: user.id, senderRole: "consumer", body: d.message, createdAt: now });

  // link to checklist: vendor joins the item's shortlist and status moves forward
  if (d.checklistItemId) {
    const item = await db.query.checklistItems.findFirst({ where: eq(s.checklistItems.id, d.checklistItemId) });
    if (item && item.eventId === ev?.id) {
      await db.insert(s.checklistVendors).values({ checklistItemId: item.id, vendorId: vendor.id }).onConflictDoNothing();
      if (item.status === "not_started") await db.update(s.checklistItems).set({ status: "searching" }).where(eq(s.checklistItems.id, item.id));
    }
  }
  await notify(vendor.ownerId, { type: "inquiry_new", title: `New inquiry from ${user.name}`, body: d.message.slice(0, 120), href: `/seller/inquiries/${inq.id}` });
  await track("inquiry_created", { userId: user.id, cityId: vendor.cityId, categoryId: svc?.categoryId, props: { source: inq.source } });
  redirect(`/inbox/${inq.id}?sent=1`);
}

export async function sendMessage(_: unknown, form: FormData): Promise<{ error?: string; ok?: boolean } | undefined> {
  const user = await requireUser();
  const inquiryId = String(form.get("inquiryId") ?? "");
  const body = String(form.get("body") ?? "").trim();
  if (!body) return { error: "Write a message first." };
  if (body.length > 2000) return { error: "Messages can be up to 2,000 characters." };
  const t = await loadThreadFor(inquiryId, user.id);
  if (!t) return { error: "We couldn't find this conversation." };
  if (t.inq.status === "closed") return { error: "This conversation is closed. Reopen it to send a message." };
  const now = new Date();
  await db.insert(s.messages).values({ inquiryId, senderId: user.id, senderRole: t.role, body, createdAt: now });
  if (t.role === "vendor") {
    await db.update(s.inquiries).set({
      consumerUnread: sql`${s.inquiries.consumerUnread} + 1`, lastMessageAt: now, status: "responded",
      firstResponseAt: t.inq.firstResponseAt ?? now,
    }).where(eq(s.inquiries.id, inquiryId));
    await notify(t.inq.consumerId, { type: "inquiry_reply", title: `${t.vendor.name} replied`, body: body.slice(0, 120), href: `/inbox/${inquiryId}` });
    await track("inquiry_response_sent", { userId: user.id, props: { first: !t.inq.firstResponseAt } });
  } else {
    await db.update(s.inquiries).set({ vendorUnread: sql`${s.inquiries.vendorUnread} + 1`, lastMessageAt: now }).where(eq(s.inquiries.id, inquiryId));
    await notify(t.vendor.ownerId, { type: "inquiry_message", title: `New message from ${user.name}`, body: body.slice(0, 120), href: `/seller/inquiries/${inquiryId}` });
  }
  revalidatePath(`/inbox/${inquiryId}`);
  revalidatePath(`/seller/inquiries/${inquiryId}`);
  return { ok: true };
}

export async function setInquiryClosed(inquiryId: string, closed: boolean) {
  const user = await requireUser();
  const t = await loadThreadFor(inquiryId, user.id);
  if (!t) return;
  await db.update(s.inquiries).set({ status: closed ? "closed" : t.inq.firstResponseAt ? "responded" : "sent" }).where(eq(s.inquiries.id, inquiryId));
  revalidatePath(`/inbox/${inquiryId}`);
  revalidatePath(`/seller/inquiries/${inquiryId}`);
}
