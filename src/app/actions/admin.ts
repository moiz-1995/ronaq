"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import type { AttributeType, PricingModel } from "@/db/schema";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { audit, notify, track } from "@/lib/track";
import { publishFields } from "@/lib/publish";
import { getSetting, setSetting, type ReviewPolicy } from "@/lib/settings";
import { refreshRating } from "@/lib/ratings";
import { appUrl } from "@/lib/email";
import { createResetToken } from "@/lib/passwordReset";

type Result = { error?: string; message?: string; ok?: boolean } | undefined;
const str = (v: FormDataEntryValue | null, max = 300) => { const x = String(v ?? "").trim().slice(0, max); return x || null; };
const slugify = (x: string) => x.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

/** For customers and vendors only, so a staff login can't be taken over with a link. */
export async function createResetLink(_: unknown, form: FormData): Promise<{ error?: string; link?: string } | undefined> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const u = await db.query.users.findFirst({ where: eq(s.users.id, id) });
  if (!u || u.role !== "user") return { error: "Reset links are only for customer and vendor accounts." };
  const raw = await createResetToken(u.id, 24 * 60 * 60 * 1000);
  await audit({ actorId: admin.id, action: "user.reset_link_created", objectType: "user", objectId: u.id });
  return { link: `${appUrl()}/reset?token=${raw}` };
}

// ---------- vendors (FR-ADM-002, FR-SEL-006/007) ----------
export async function moderateVendor(_: unknown, form: FormData): Promise<Result> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const op = String(form.get("op"));
  const reason = str(form.get("reason"), 500);
  const v = await db.query.vendors.findFirst({ where: eq(s.vendors.id, id) });
  if (!v) return { error: "Vendor not found." };
  if ((op === "reject" || op === "suspend") && !reason) return { error: "Add a reason. The vendor sees it, and it's kept in the audit log." };
  const before = { status: v.status, founding: v.founding };
  if (op === "approve") {
    const live = await publishFields(v);
    await db.update(s.vendors).set({ ...live, profileReviewed: true, pendingChanges: false }).where(eq(s.vendors.id, id));
    if (v.status !== "approved") await notify(v.ownerId, { type: "vendor_approved", title: "Your profile is live! 🎉", body: live.foundingNumber ? `You're Founding Vendor #${live.foundingNumber}.` : undefined, href: "/seller" });
    await track("vendor_profile_approved", { userId: admin.id, cityId: v.cityId });
  } else if (op === "reject") {
    await db.update(s.vendors).set({ status: "rejected", statusReason: reason }).where(eq(s.vendors.id, id));
    await notify(v.ownerId, { type: "vendor_rejected", title: "Your profile needs changes", body: reason!, href: "/seller" });
  } else if (op === "suspend") {
    await db.update(s.vendors).set({ status: "suspended", statusReason: reason }).where(eq(s.vendors.id, id));
    await notify(v.ownerId, { type: "vendor_suspended", title: "Your profile has been suspended", body: reason!, href: "/seller" });
  } else if (op === "reinstate") {
    await db.update(s.vendors).set({ status: "approved", statusReason: null }).where(eq(s.vendors.id, id));
    await notify(v.ownerId, { type: "vendor_reinstated", title: "Your profile is live again", href: "/seller" });
  } else if (op === "clear_changes") {
    await db.update(s.vendors).set({ pendingChanges: false }).where(eq(s.vendors.id, id));
  } else if (op === "founding_on" || op === "founding_off") {
    let num: number | null = null;
    if (op === "founding_on") {
      const [{ m }] = await db.select({ m: sql<number>`coalesce(max(${s.vendors.foundingNumber}),0)` }).from(s.vendors);
      num = Number(m) + 1;
    }
    await db.update(s.vendors).set({ founding: op === "founding_on", foundingNumber: num }).where(eq(s.vendors.id, id));
  } else if (op === "featured_on" || op === "featured_off") {
    if (op === "featured_on" && !(await getSetting("featuredEnabled"))) return { error: "Featured placement is switched off in settings. It needs an approved policy first." };
    await db.update(s.vendors).set({ featured: op === "featured_on" }).where(eq(s.vendors.id, id));
  } else if (op === "verify") {
    await db.update(s.vendors).set({ phoneVerified: form.get("phoneVerified") === "on", emailVerified: form.get("emailVerified") === "on", profileReviewed: form.get("profileReviewed") === "on" }).where(eq(s.vendors.id, id));
  } else if (op === "claim_code") {
    const code = "RNQ-" + crypto.randomUUID().slice(0, 6).toUpperCase();
    await db.update(s.vendors).set({ claimCode: code }).where(eq(s.vendors.id, id));
    await audit({ actorId: admin.id, action: "vendor.claim_code", objectType: "vendor", objectId: id });
    revalidatePath(`/admin/vendors/${id}`);
    return { ok: true, message: `Claim code: ${code}. Share it with the vendor privately.` };
  } else return { error: "Unknown action." };
  const after = await db.query.vendors.findFirst({ where: eq(s.vendors.id, id) });
  await audit({ actorId: admin.id, action: `vendor.${op}`, objectType: "vendor", objectId: id, reason, before, after: { status: after?.status, founding: after?.founding } });
  revalidatePath(`/admin/vendors/${id}`);
  revalidatePath("/admin/vendors");
  revalidatePath(`/v/${v.slug}`);
  return { ok: true, message: "Done." };
}

/** FR-SEL-006: assisted onboarding — ops creates a profile on the vendor's behalf. */
export async function adminCreateVendor(_: unknown, form: FormData): Promise<Result> {
  const admin = await requireAdmin();
  const name = str(form.get("name"), 80);
  const catId = str(form.get("categoryId"));
  const cityId = str(form.get("cityId"));
  if (!name || !catId || !cityId) return { error: "Name, category and city are required." };
  let slug = slugify(name), n = 1;
  while (await db.query.vendors.findFirst({ where: eq(s.vendors.slug, slug) })) slug = `${slugify(name)}-${++n}`;
  const cat = await db.query.categories.findFirst({ where: eq(s.categories.id, catId) });
  const [v] = await db.insert(s.vendors).values({
    slug, name, ownerName: str(form.get("ownerName"), 80), description: str(form.get("description"), 2000), cityId, areaId: str(form.get("areaId")),
    phone: str(form.get("phone"), 20), whatsapp: str(form.get("phone"), 20), modes: form.getAll("modes").map(String), servesWholeCity: true,
    createdById: admin.id, status: "draft", claimCode: "RNQ-" + crypto.randomUUID().slice(0, 6).toUpperCase(),
  }).returning();
  await db.insert(s.vendorServices).values({ vendorId: v.id, categoryId: catId, title: cat?.name ?? name, pricingModel: (cat?.priceModels?.[0] as PricingModel) ?? "quote" });
  await audit({ actorId: admin.id, action: "vendor.assisted_create", objectType: "vendor", objectId: v.id });
  redirect(`/admin/vendors/${v.id}`);
}

export async function adminEditVendor(_: unknown, form: FormData): Promise<Result> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const v = await db.query.vendors.findFirst({ where: eq(s.vendors.id, id) });
  if (!v) return { error: "Vendor not found." };
  const next = { name: str(form.get("name"), 80) ?? v.name, description: str(form.get("description"), 2000), ownerName: str(form.get("ownerName"), 80), phone: str(form.get("phone"), 20), whatsapp: str(form.get("whatsapp"), 20) };
  await db.update(s.vendors).set({ ...next, updatedAt: new Date() }).where(eq(s.vendors.id, id));
  await audit({ actorId: admin.id, action: "vendor.admin_edit", objectType: "vendor", objectId: id, before: { name: v.name, description: v.description, phone: v.phone }, after: next, reason: str(form.get("reason"), 300) });
  revalidatePath(`/admin/vendors/${id}`);
  return { ok: true, message: "Saved on the vendor's behalf. Logged in the audit trail." };
}

// ---------- categories & attributes (FR-ADM-003/004) ----------
export async function saveCategory(_: unknown, form: FormData): Promise<Result> {
  const admin = await requireAdmin();
  const id = str(form.get("id"));
  const name = str(form.get("name"), 60);
  if (!name) return { error: "Category needs a name." };
  const slug = slugify(str(form.get("slug"), 60) ?? name);
  if (!slug) return { error: "Slug can only contain letters, numbers and dashes." };
  const clash = await db.query.categories.findFirst({ where: eq(s.categories.slug, slug) });
  if (clash && clash.id !== id) return { error: `Another category already uses the slug “${slug}”.` };
  const priceModels = form.getAll("priceModels").map(String);
  if (!priceModels.length) return { error: "Pick at least one pricing model." };
  const values = { name, slug, description: str(form.get("description"), 300), noun: str(form.get("noun"), 20) ?? "vendors", art: str(form.get("art"), 20) ?? "henna", priceModels, active: form.get("active") === "on", sortOrder: Number(form.get("sortOrder") ?? 0) || 0 };
  if (id) await db.update(s.categories).set(values).where(eq(s.categories.id, id));
  const row = id ? { id } : (await db.insert(s.categories).values(values).returning())[0];
  await audit({ actorId: admin.id, action: id ? "category.update" : "category.create", objectType: "category", objectId: row.id, after: values });
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/categories/${row.id}`);
  return { ok: true, message: "Category saved." };
}

export async function saveAttribute(_: unknown, form: FormData): Promise<Result> {
  const admin = await requireAdmin();
  const id = str(form.get("id"));
  const categoryId = String(form.get("categoryId"));
  const label = str(form.get("label"), 60);
  const type = String(form.get("type")) as AttributeType;
  if (!label) return { error: "Attribute needs a label." };
  if (!["select", "multiselect", "boolean", "number", "text"].includes(type)) return { error: "Choose a type." };
  const key = slugify(str(form.get("key"), 40) ?? label).replace(/-/g, "_");
  const options = String(form.get("options") ?? "").split(/\n|,/).map((o) => o.trim()).filter(Boolean);
  if ((type === "select" || type === "multiselect") && options.length < 2) return { error: "Choice attributes need at least two options." };
  const clash = await db.query.attributes.findFirst({ where: and(eq(s.attributes.categoryId, categoryId), eq(s.attributes.key, key)) });
  if (clash && clash.id !== id) return { error: `This category already has an attribute with key “${key}”.` };
  const values = {
    categoryId, key, label, type, options, unit: str(form.get("unit"), 20), help: str(form.get("help"), 200),
    required: form.get("required") === "on", filterable: form.get("filterable") === "on", showOnProfile: form.get("showOnProfile") === "on", vendorDeclared: form.get("vendorDeclared") === "on",
    sortOrder: Number(form.get("sortOrder") ?? 0) || 0,
  };
  if (id) await db.update(s.attributes).set(values).where(eq(s.attributes.id, id));
  else await db.insert(s.attributes).values(values);
  await audit({ actorId: admin.id, action: id ? "attribute.update" : "attribute.create", objectType: "attribute", objectId: id ?? key, after: values });
  revalidatePath(`/admin/categories/${categoryId}`);
  return { ok: true, message: "Attribute saved. It's live in seller forms and filters now. No app release needed." };
}

export async function deleteAttribute(id: string) {
  const admin = await requireAdmin();
  const a = await db.query.attributes.findFirst({ where: eq(s.attributes.id, id) });
  if (!a) return;
  await db.delete(s.attributes).where(eq(s.attributes.id, id));
  await audit({ actorId: admin.id, action: "attribute.delete", objectType: "attribute", objectId: id, before: a });
  revalidatePath(`/admin/categories/${a.categoryId}`);
}

export async function saveTemplate(_: unknown, form: FormData): Promise<Result> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const items = String(form.get("items") ?? "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, cat] = l.split("|").map((x) => x.trim());
    return { label: label.slice(0, 80), categorySlug: cat || undefined };
  });
  await db.update(s.templates).set({ name: str(form.get("name"), 60) ?? "Template", label: str(form.get("label"), 28) ?? "", items }).where(eq(s.templates.id, id));
  await audit({ actorId: admin.id, action: "template.update", objectType: "template", objectId: id, after: { items: items.length } });
  revalidatePath("/admin/templates");
  return { ok: true, message: "Template saved." };
}

// ---------- reports & moderation (FR-ADM-005/006/007) ----------
export async function handleReport(_: unknown, form: FormData): Promise<Result> {
  const staff = await requireStaff();
  const id = String(form.get("id"));
  const op = String(form.get("op"));
  const r = await db.query.reports.findFirst({ where: eq(s.reports.id, id) });
  if (!r) return { error: "Report not found." };
  const resolution = str(form.get("resolution"), 500);
  if (op === "assign") await db.update(s.reports).set({ status: "assigned", assigneeId: staff.id, updatedAt: new Date() }).where(eq(s.reports.id, id));
  else if (op === "resolve" || op === "dismiss") {
    if (!resolution) return { error: "Write what you found or did. It's kept with the report." };
    await db.update(s.reports).set({ status: op === "resolve" ? "resolved" : "dismissed", resolution, assigneeId: r.assigneeId ?? staff.id, updatedAt: new Date() }).where(eq(s.reports.id, id));
    await track("report_resolved", { userId: staff.id, props: { outcome: op } });
  } else if (op === "hide_target") {
    if (!resolution) return { error: "Give a reason for hiding this content." };
    if ((r.targetType === "vendor" || r.targetType === "user") && staff.role !== "admin") return { error: "Only admins can suspend accounts. Assign this report to an admin." };
    await hideTarget(r.targetType, r.targetId, resolution, staff.id);
    await db.update(s.reports).set({ status: "resolved", resolution: `Content hidden: ${resolution}`, assigneeId: staff.id, updatedAt: new Date() }).where(eq(s.reports.id, id));
  }
  await audit({ actorId: staff.id, action: `report.${op}`, objectType: "report", objectId: id, reason: resolution });
  revalidatePath("/admin/reports");
  return { ok: true, message: "Updated." };
}

async function hideTarget(type: string, id: string, reason: string, actorId: string) {
  if (type === "review") return setReviewStatusInner(id, "hidden", reason, actorId);
  if (type === "portfolio") return setPortfolioStatusInner(id, "hidden", reason, actorId);
  if (type === "message") {
    await db.update(s.messages).set({ body: "[Message removed by Ronaq moderators]" }).where(eq(s.messages.id, id));
    return;
  }
  if (type === "vendor") {
    await db.update(s.vendors).set({ status: "suspended", statusReason: reason }).where(eq(s.vendors.id, id));
    return;
  }
  if (type === "user") await db.update(s.users).set({ status: "suspended" }).where(eq(s.users.id, id));
  void actorId;
}

async function setReviewStatusInner(id: string, status: "published" | "hidden", reason: string | null, actorId: string) {
  const r = await db.query.reviews.findFirst({ where: eq(s.reviews.id, id) });
  if (!r) return;
  await db.update(s.reviews).set({ status, moderationReason: reason }).where(eq(s.reviews.id, id));
  await refreshRating(r.vendorId);
  await audit({ actorId, action: `review.${status}`, objectType: "review", objectId: id, reason, before: { status: r.status }, after: { status } });
}

async function setPortfolioStatusInner(id: string, status: "visible" | "hidden" | "removed", reason: string | null, actorId: string) {
  const p = await db.query.portfolioItems.findFirst({ where: eq(s.portfolioItems.id, id) });
  if (!p) return;
  await db.update(s.portfolioItems).set({ status, moderationReason: status === "visible" ? null : reason }).where(eq(s.portfolioItems.id, id));
  const v = await db.query.vendors.findFirst({ where: eq(s.vendors.id, p.vendorId) });
  if (status !== "visible") await notify(v?.ownerId, { type: "portfolio_hidden", title: "A portfolio photo was hidden", body: reason ?? undefined, href: "/seller/portfolio" });
  await audit({ actorId, action: `portfolio.${status}`, objectType: "portfolio", objectId: id, reason, before: { status: p.status }, after: { status } });
}

export async function moderateReview(_: unknown, form: FormData): Promise<Result> {
  const staff = await requireStaff();
  const status = String(form.get("status")) as "published" | "hidden";
  const reason = str(form.get("reason"), 300);
  if (status === "hidden" && !reason) return { error: "Give a reason for hiding the review." };
  await setReviewStatusInner(String(form.get("id")), status, reason, staff.id);
  revalidatePath("/admin/reviews");
  return { ok: true, message: status === "published" ? "Review published." : "Review hidden." };
}

export async function moderatePortfolio(_: unknown, form: FormData): Promise<Result> {
  const staff = await requireStaff();
  const status = String(form.get("status")) as "visible" | "hidden" | "removed";
  const reason = str(form.get("reason"), 300);
  if (status !== "visible" && !reason) return { error: "Give a reason. The vendor will see it." };
  await setPortfolioStatusInner(String(form.get("id")), status, reason, staff.id);
  revalidatePath("/admin/portfolio");
  return { ok: true };
}

// ---------- users (FR-ADM-001) ----------
export async function moderateUser(_: unknown, form: FormData): Promise<Result> {
  const admin = await requireAdmin();
  const id = String(form.get("id"));
  const op = String(form.get("op"));
  const reason = str(form.get("reason"), 300);
  if (id === admin.id) return { error: "You can't change your own account here." };
  const u = await db.query.users.findFirst({ where: eq(s.users.id, id) });
  if (!u) return { error: "User not found." };
  if (op === "suspend") { if (!reason) return { error: "Give a reason." }; await db.update(s.users).set({ status: "suspended" }).where(eq(s.users.id, id)); }
  else if (op === "reactivate") await db.update(s.users).set({ status: "active" }).where(eq(s.users.id, id));
  else if (op === "role") {
    const role = String(form.get("role")) as "user" | "moderator" | "admin";
    if (!["user", "moderator", "admin"].includes(role)) return { error: "Invalid role." };
    await db.update(s.users).set({ role }).where(eq(s.users.id, id));
  }
  await audit({ actorId: admin.id, action: `user.${op}`, objectType: "user", objectId: id, reason, before: { status: u.status, role: u.role } });
  revalidatePath("/admin/users");
  return { ok: true, message: "Updated." };
}

// ---------- settings ----------
export async function saveSettings(_: unknown, form: FormData): Promise<Result> {
  const admin = await requireAdmin();
  const before = { reviewPolicy: await getSetting("reviewPolicy"), foundingCap: await getSetting("foundingCap"), featuredEnabled: await getSetting("featuredEnabled") };
  const basis = String(form.get("basis")) as ReviewPolicy["basis"];
  if (!["inquiry", "account", "admin_evidence"].includes(basis)) return { error: "Choose a review rule." };
  const cap = Number(form.get("foundingCap"));
  if (!Number.isInteger(cap) || cap < 0 || cap > 10000) return { error: "Founding cap must be a whole number." };
  const reviewPolicy: ReviewPolicy = { basis, premoderate: form.get("premoderate") === "on", minMessages: Math.max(0, Number(form.get("minMessages")) || 0) };
  await setSetting("reviewPolicy", reviewPolicy);
  await setSetting("foundingCap", cap);
  await setSetting("featuredEnabled", form.get("featuredEnabled") === "on");
  const activeCities = form.getAll("activeCities").map(String);
  const cities = await db.select().from(s.cities);
  for (const c of cities) await db.update(s.cities).set({ active: activeCities.includes(c.id) }).where(eq(s.cities.id, c.id));
  await audit({ actorId: admin.id, action: "settings.update", objectType: "settings", before, after: { reviewPolicy, foundingCap: cap, featuredEnabled: form.get("featuredEnabled") === "on", activeCities: activeCities.length } });
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}
