"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, asc, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { checklistStatuses } from "@/db/schema";
import { requireUser, checkPassword, hashPassword } from "@/lib/auth";
import { track } from "@/lib/track";
import { getCategories, getTemplates } from "@/lib/queries";

type Result = { error?: string; message?: string; ok?: boolean } | undefined;
const money = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/[^\d]/g, ""));
  return n > 0 ? n : null;
};
const str = (v: FormDataEntryValue | null, max = 200) => {
  const x = String(v ?? "").trim().slice(0, max);
  return x || null;
};
const ymd = (v: FormDataEntryValue | null) => {
  const x = String(v ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : null;
};

// ---------- ownership guards ----------
async function ownEvent(userId: string, eventId: string) {
  const ev = await db.query.events.findFirst({ where: and(eq(s.events.id, eventId), eq(s.events.userId, userId)) });
  if (!ev) throw new Error("Event not found");
  return ev;
}
async function ownItem(userId: string, itemId: string) {
  const item = await db.query.checklistItems.findFirst({ where: eq(s.checklistItems.id, itemId) });
  if (!item) throw new Error("Item not found");
  const ev = await ownEvent(userId, item.eventId);
  return { item, ev };
}
const refreshEvent = (id: string) => { revalidatePath(`/events/${id}`); revalidatePath("/dashboard"); revalidatePath("/events"); };

// ---------- onboarding (§6.2) ----------
export async function saveOnboarding(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/onboarding");
  const name = str(form.get("name"), 80);
  const cityId = str(form.get("cityId"));
  if (!name) return { error: "Tell us your name." };
  if (!cityId) return { error: "Choose your city." };
  const planning = form.get("planningEvent");
  await db.update(s.users).set({
    name, cityId,
    interests: form.getAll("interests").map(String).slice(0, 20),
    planningEvent: planning === "yes" ? true : planning === "no" ? false : null,
    heardFrom: str(form.get("heardFrom"), 60) === "Other" ? `Other: ${str(form.get("heardOther"), 60) ?? ""}` : str(form.get("heardFrom"), 60),
    onboardedAt: new Date(),
  }).where(eq(s.users.id, user.id));
  await track("onboarding_completed", { userId: user.id, cityId });
  redirect(planning === "yes" ? "/launchpad" : String(form.get("next") || "/marketplace"));
}

export async function skipOnboarding(next: string) {
  const user = await requireUser("/onboarding");
  await db.update(s.users).set({ onboardedAt: new Date() }).where(eq(s.users.id, user.id));
  await track("onboarding_skipped", { userId: user.id });
  redirect(next.startsWith("/") ? next : "/marketplace");
}

// ---------- Launchpad (§7.1) ----------
export async function launchpadChecklist(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/launchpad");
  const templateSlug = String(form.get("template") ?? "custom");
  const tpl = (await getTemplates()).find((t) => t.slug === templateSlug);
  const cats = await getCategories();
  const picked = form.getAll("item").map(String); // "label|categorySlug"
  const custom = String(form.get("custom") ?? "").split(/\n|,/).map((x) => x.trim()).filter(Boolean).slice(0, 30);
  const items = [
    ...picked.map((p) => { const [label, slug] = p.split("|"); return { label: label.slice(0, 80), categoryId: cats.find((c) => c.slug === slug)?.id ?? null }; }),
    ...custom.map((label) => ({ label: label.slice(0, 80), categoryId: null })),
  ];
  if (!items.length) return { error: "Add at least one service or task, or skip this step." };

  let ev = await db.query.events.findFirst({ where: and(eq(s.events.userId, user.id), eq(s.events.isPrimary, true)) });
  if (!ev) {
    [ev] = await db.insert(s.events).values({
      userId: user.id, name: tpl && tpl.slug !== "custom" ? `My ${tpl.name.split(" /")[0].toLowerCase()}` : "My event",
      type: tpl?.eventType ?? "custom", label: tpl?.label || null, isPrimary: true,
    }).returning();
    await track("event_created", { userId: user.id, props: { via: "launchpad" } });
    await track("primary_event_set", { userId: user.id });
  }
  const existing = await db.select({ label: s.checklistItems.label }).from(s.checklistItems).where(eq(s.checklistItems.eventId, ev.id));
  const have = new Set(existing.map((e) => e.label.toLowerCase()));
  const fresh = items.filter((i) => !have.has(i.label.toLowerCase()));
  if (fresh.length) {
    await db.insert(s.checklistItems).values(fresh.map((i, k) => ({ eventId: ev!.id, label: i.label, categoryId: i.categoryId, sortOrder: existing.length + k })));
    await track("checklist_item_added", { userId: user.id, props: { count: fresh.length } });
  }
  await db.update(s.users).set({ launchpadStep: Math.max(user.launchpadStep, 2) }).where(eq(s.users.id, user.id));
  await track("launchpad_started", { userId: user.id });
  redirect("/launchpad?step=2");
}

export async function launchpadDates(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/launchpad");
  const ev = await db.query.events.findFirst({ where: and(eq(s.events.userId, user.id), eq(s.events.isPrimary, true)) });
  const name = str(form.get("name"), 80);
  if (!name) return { error: "Give your event a name, e.g. “Ayesha & Bilal's wedding”." };
  const values = {
    name, type: String(form.get("type") ?? "custom"), label: str(form.get("label"), 28),
    date: ymd(form.get("date")), time: str(form.get("time"), 10), location: str(form.get("location"), 120),
    guestCount: money(form.get("guestCount")), budget: money(form.get("budget")), description: str(form.get("description"), 1000),
  };
  if (ev) await db.update(s.events).set(values).where(eq(s.events.id, ev.id));
  else await db.insert(s.events).values({ ...values, userId: user.id, isPrimary: true });
  // optional secondary dates
  const names = form.getAll("secName").map(String);
  const dates = form.getAll("secDate").map(String);
  const sec = names.map((n, i) => ({ name: n.trim().slice(0, 80), date: /^\d{4}-\d{2}-\d{2}$/.test(dates[i] ?? "") ? dates[i] : null })).filter((x) => x.name);
  if (sec.length) await db.insert(s.events).values(sec.map((x) => ({ userId: user.id, name: x.name, date: x.date, type: guessType(x.name), label: null })));
  await db.update(s.users).set({ launchpadStep: Math.max(user.launchpadStep, 3) }).where(eq(s.users.id, user.id));
  redirect("/launchpad?step=3");
}

function guessType(name: string) {
  const n = name.toLowerCase();
  for (const t of ["mehndi", "barat", "walima", "dholki", "engagement", "birthday", "aqeeqa"]) if (n.includes(t)) return t;
  if (n.includes("mangni")) return "engagement";
  return "custom";
}

export async function launchpadSkipTo(step: number) {
  const user = await requireUser("/launchpad");
  await db.update(s.users).set({ launchpadStep: Math.max(user.launchpadStep, step) }).where(eq(s.users.id, user.id));
  redirect(step >= 4 ? "/marketplace" : `/launchpad?step=${step}`);
}

export async function finishLaunchpad() {
  const user = await requireUser("/launchpad");
  await db.update(s.users).set({ launchpadStep: 4 }).where(eq(s.users.id, user.id));
  await track("launchpad_completed", { userId: user.id });
  redirect("/marketplace?from=launchpad");
}

// ---------- events (FR-EVT-001/002/003) ----------
const eventSchema = z.object({ name: z.string().trim().min(1, "Give the event a name.").max(80) });

export async function saveEvent(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/events");
  const parsed = eventSchema.safeParse({ name: form.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const id = str(form.get("id"));
  const values = {
    name: parsed.data.name, type: String(form.get("type") ?? "custom"), label: str(form.get("label"), 28),
    date: ymd(form.get("date")), time: str(form.get("time"), 10), location: str(form.get("location"), 120),
    guestCount: money(form.get("guestCount")), budget: money(form.get("budget")), description: str(form.get("description"), 1000),
  };
  let eventId = id;
  if (id) {
    await ownEvent(user.id, id);
    await db.update(s.events).set(values).where(eq(s.events.id, id));
  } else {
    const hasPrimary = await db.query.events.findFirst({ where: and(eq(s.events.userId, user.id), eq(s.events.isPrimary, true)) });
    const [ev] = await db.insert(s.events).values({ ...values, userId: user.id, isPrimary: !hasPrimary }).returning();
    eventId = ev.id;
    await track("event_created", { userId: user.id });
    const tpl = (await getTemplates()).find((t) => t.slug === form.get("template"));
    if (tpl?.items?.length) {
      const cats = await getCategories();
      await db.insert(s.checklistItems).values(tpl.items.map((it, k) => ({ eventId: ev.id, label: it.label, categoryId: cats.find((c) => c.slug === it.categorySlug)?.id ?? null, sortOrder: k })));
    }
  }
  if (form.get("makePrimary") === "on") await setPrimaryInner(user.id, eventId!);
  refreshEvent(eventId!);
  redirect(`/events/${eventId}`);
}

async function setPrimaryInner(userId: string, eventId: string) {
  await ownEvent(userId, eventId);
  await db.update(s.events).set({ isPrimary: false }).where(and(eq(s.events.userId, userId), ne(s.events.id, eventId)));
  await db.update(s.events).set({ isPrimary: true }).where(eq(s.events.id, eventId));
  await track("primary_event_set", { userId });
}

export async function setPrimary(eventId: string) {
  const user = await requireUser("/events");
  await setPrimaryInner(user.id, eventId);
  refreshEvent(eventId);
}

export async function deleteEvent(eventId: string) {
  const user = await requireUser("/events");
  const ev = await ownEvent(user.id, eventId);
  const items = await db.select({ id: s.checklistItems.id }).from(s.checklistItems).where(eq(s.checklistItems.eventId, eventId));
  if (items.length) {
    const ids = items.map((i) => i.id);
    await db.delete(s.checklistVendors).where(inArray(s.checklistVendors.checklistItemId, ids));
    await db.delete(s.quotes).where(inArray(s.quotes.checklistItemId, ids));
  }
  await db.delete(s.checklistItems).where(eq(s.checklistItems.eventId, eventId));
  await db.delete(s.reminders).where(eq(s.reminders.eventId, eventId));
  await db.delete(s.events).where(eq(s.events.id, eventId));
  if (ev.isPrimary) {
    const next = await db.query.events.findFirst({ where: eq(s.events.userId, user.id), orderBy: asc(s.events.date) });
    if (next) await db.update(s.events).set({ isPrimary: true }).where(eq(s.events.id, next.id));
  }
  revalidatePath("/events");
  redirect("/events");
}

// ---------- checklist (FR-EVT-008…013) ----------
export async function addChecklistItem(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/events");
  const eventId = String(form.get("eventId"));
  await ownEvent(user.id, eventId);
  const label = str(form.get("label"), 80);
  const categoryId = str(form.get("categoryId"));
  const cats = await getCategories();
  const cat = cats.find((c) => c.id === categoryId);
  if (!label && !cat) return { error: "Type a task or choose a service." };
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(s.checklistItems).where(eq(s.checklistItems.eventId, eventId));
  await db.insert(s.checklistItems).values({ eventId, label: label ?? cat!.name, categoryId: cat?.id ?? null, sortOrder: Number(n), budget: money(form.get("budget")) });
  await track("checklist_item_added", { userId: user.id, props: { custom: !cat } });
  refreshEvent(eventId);
  return { ok: true };
}

export async function updateChecklistItem(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/events");
  const { item } = await ownItem(user.id, String(form.get("id")));
  const label = str(form.get("label"), 80);
  if (!label) return { error: "The item needs a name." };
  await db.update(s.checklistItems).set({
    label, notes: str(form.get("notes"), 1000), budget: money(form.get("budget")), deadline: ymd(form.get("deadline")),
  }).where(eq(s.checklistItems.id, item.id));
  const deadline = ymd(form.get("deadline"));
  if (deadline && form.get("remind") === "on") {
    await db.insert(s.reminders).values({ userId: user.id, eventId: item.eventId, checklistItemId: item.id, title: `Deadline: ${label}`, dueDate: deadline });
  }
  refreshEvent(item.eventId);
  return { ok: true, message: "Saved." };
}

export async function setItemStatus(itemId: string, status: string) {
  const user = await requireUser("/events");
  if (!(checklistStatuses as readonly string[]).includes(status)) return;
  const { item } = await ownItem(user.id, itemId);
  await db.update(s.checklistItems).set({ status: status as (typeof checklistStatuses)[number] }).where(eq(s.checklistItems.id, itemId));
  await track("checklist_item_status_changed", { userId: user.id, props: { to: status } });
  refreshEvent(item.eventId);
}

export async function moveItem(itemId: string, dir: -1 | 1) {
  const user = await requireUser("/events");
  const { item } = await ownItem(user.id, itemId);
  const list = await db.select().from(s.checklistItems).where(eq(s.checklistItems.eventId, item.eventId)).orderBy(asc(s.checklistItems.sortOrder), asc(s.checklistItems.createdAt));
  const i = list.findIndex((x) => x.id === itemId);
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((x, k) => db.update(s.checklistItems).set({ sortOrder: k }).where(eq(s.checklistItems.id, x.id))));
  refreshEvent(item.eventId);
}

export async function deleteItem(itemId: string) {
  const user = await requireUser("/events");
  const { item } = await ownItem(user.id, itemId);
  await db.delete(s.checklistVendors).where(eq(s.checklistVendors.checklistItemId, itemId));
  await db.delete(s.quotes).where(eq(s.quotes.checklistItemId, itemId));
  await db.delete(s.checklistItems).where(eq(s.checklistItems.id, itemId));
  refreshEvent(item.eventId);
}

export async function linkVendor(itemId: string, vendorId: string) {
  const user = await requireUser("/events");
  const { item } = await ownItem(user.id, itemId);
  await db.insert(s.checklistVendors).values({ checklistItemId: itemId, vendorId }).onConflictDoNothing();
  if (item.status === "not_started" || item.status === "searching") await db.update(s.checklistItems).set({ status: "shortlisted" }).where(eq(s.checklistItems.id, itemId));
  await db.insert(s.shortlist).values({ userId: user.id, vendorId }).onConflictDoNothing();
  refreshEvent(item.eventId);
}

export async function unlinkVendor(itemId: string, vendorId: string) {
  const user = await requireUser("/events");
  const { item } = await ownItem(user.id, itemId);
  await db.delete(s.checklistVendors).where(and(eq(s.checklistVendors.checklistItemId, itemId), eq(s.checklistVendors.vendorId, vendorId)));
  if (item.selectedVendorId === vendorId) await db.update(s.checklistItems).set({ selectedVendorId: null }).where(eq(s.checklistItems.id, itemId));
  refreshEvent(item.eventId);
}

export async function selectVendor(itemId: string, vendorId: string | null) {
  const user = await requireUser("/events");
  const { item } = await ownItem(user.id, itemId);
  await db.update(s.checklistItems).set({ selectedVendorId: vendorId, status: vendorId ? (item.status === "completed" ? "completed" : "booked") : item.status }).where(eq(s.checklistItems.id, itemId));
  refreshEvent(item.eventId);
}

// ---------- quotes (FR-EVT-011) ----------
export async function addQuote(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/events");
  const { item } = await ownItem(user.id, String(form.get("itemId")));
  const amount = money(form.get("amount"));
  if (!amount) return { error: "Enter the quoted amount in PKR." };
  const vendorId = str(form.get("vendorId"));
  let vendorName = str(form.get("vendorName"), 80);
  if (vendorId) vendorName = (await db.query.vendors.findFirst({ where: eq(s.vendors.id, vendorId) }))?.name ?? vendorName;
  await db.insert(s.quotes).values({
    userId: user.id, checklistItemId: item.id, vendorId, vendorName, amount,
    unit: str(form.get("unit"), 30) ?? "total", notes: str(form.get("notes"), 500),
    quoteDate: ymd(form.get("quoteDate")), validUntil: ymd(form.get("validUntil")), committed: form.get("committed") === "on",
  });
  refreshEvent(item.eventId);
  return { ok: true, message: "Quote recorded." };
}

export async function deleteQuote(quoteId: string) {
  const user = await requireUser("/events");
  const q = await db.query.quotes.findFirst({ where: and(eq(s.quotes.id, quoteId), eq(s.quotes.userId, user.id)) });
  if (!q) return;
  const { item } = await ownItem(user.id, q.checklistItemId);
  await db.delete(s.quotes).where(eq(s.quotes.id, quoteId));
  refreshEvent(item.eventId);
}

export async function toggleQuoteCommitted(quoteId: string) {
  const user = await requireUser("/events");
  const q = await db.query.quotes.findFirst({ where: and(eq(s.quotes.id, quoteId), eq(s.quotes.userId, user.id)) });
  if (!q) return;
  const { item } = await ownItem(user.id, q.checklistItemId);
  await db.update(s.quotes).set({ committed: !q.committed }).where(eq(s.quotes.id, quoteId));
  refreshEvent(item.eventId);
}

// ---------- reminders (FR-EVT-007) ----------
export async function addReminder(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/calendar");
  const title = str(form.get("title"), 120);
  const dueDate = ymd(form.get("dueDate"));
  if (!title || !dueDate) return { error: "Add a title and a date." };
  const eventId = str(form.get("eventId"));
  if (eventId) await ownEvent(user.id, eventId);
  await db.insert(s.reminders).values({ userId: user.id, title, dueDate, eventId });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true, message: "Reminder added." };
}

export async function toggleReminder(id: string) {
  const user = await requireUser("/calendar");
  const r = await db.query.reminders.findFirst({ where: and(eq(s.reminders.id, id), eq(s.reminders.userId, user.id)) });
  if (!r) return;
  await db.update(s.reminders).set({ done: !r.done }).where(eq(s.reminders.id, id));
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function deleteReminder(id: string) {
  const user = await requireUser("/calendar");
  await db.delete(s.reminders).where(and(eq(s.reminders.id, id), eq(s.reminders.userId, user.id)));
  revalidatePath("/calendar");
}

// ---------- account (FR-CUS-006) ----------
export async function updateProfile(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/account");
  const name = str(form.get("name"), 80);
  if (!name) return { error: "Your name can't be empty." };
  const phone = str(form.get("phone"), 20);
  if (phone && !/^[+\d][\d\s-]{6,}$/.test(phone)) return { error: "Enter a valid phone number, e.g. 0300 1234567." };
  await db.update(s.users).set({
    name, phone, cityId: str(form.get("cityId")), interests: form.getAll("interests").map(String),
    remindersEnabled: form.get("remindersEnabled") === "on",
  }).where(eq(s.users.id, user.id));
  revalidatePath("/account");
  return { ok: true, message: "Profile saved." };
}

export async function changePassword(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/account");
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (!(await checkPassword(current, user.passwordHash))) return { error: "Your current password isn't right." };
  if (next.length < 8) return { error: "Use at least 8 characters for the new password." };
  await db.update(s.users).set({ passwordHash: await hashPassword(next) }).where(eq(s.users.id, user.id));
  return { ok: true, message: "Password changed." };
}

export async function markAllNotificationsRead() {
  const user = await requireUser("/notifications");
  await db.update(s.notifications).set({ readAt: new Date() }).where(and(eq(s.notifications.userId, user.id), isNull(s.notifications.readAt)));
  revalidatePath("/notifications");
}
