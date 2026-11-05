"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import type { PricingModel } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { audit, notify, track } from "@/lib/track";
import { completeness, MATERIAL_FIELDS } from "@/lib/domain";
import { saveImage, UploadError } from "@/lib/storage";
import { getAttributes, getCategories } from "@/lib/queries";

type Result = { error?: string; message?: string; ok?: boolean } | undefined;
const str = (v: FormDataEntryValue | null, max = 200) => { const x = String(v ?? "").trim().slice(0, max); return x || null; };
const int = (v: FormDataEntryValue | null) => { const n = Number(String(v ?? "").replace(/[^\d]/g, "")); return String(v ?? "").trim() === "" || isNaN(n) ? null : n; };
const slugify = (x: string) => x.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "vendor";

async function requireVendor() {
  const user = await requireUser("/seller");
  const vendor = await db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, user.id) });
  if (!vendor) redirect("/seller/onboarding");
  return { user, vendor };
}

async function uniqueSlug(base: string, exceptId?: string) {
  let slug = slugify(base), n = 1;
  for (;;) {
    const hit = await db.query.vendors.findFirst({ where: eq(s.vendors.slug, slug) });
    if (!hit || hit.id === exceptId) return slug;
    slug = `${slugify(base)}-${++n}`;
  }
}

const refresh = (slug?: string) => { revalidatePath("/seller", "layout"); if (slug) revalidatePath(`/v/${slug}`); };

// ---------- onboarding (§9.1, FR-SEL-001/002) ----------
export async function startSelling(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/seller/onboarding");
  const existing = await db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, user.id) });
  if (existing) redirect("/seller");
  const name = str(form.get("name"), 80);
  const cityId = str(form.get("cityId"));
  const catSlugs = form.getAll("categories").map(String);
  if (!name) return { error: "Enter your business name." };
  if (!cityId) return { error: "Choose your city." };
  if (!catSlugs.length) return { error: "Choose at least one service category." };
  const cats = (await getCategories()).filter((c) => catSlugs.includes(c.slug));
  const [v] = await db.insert(s.vendors).values({
    ownerId: user.id, slug: await uniqueSlug(name), name, ownerName: str(form.get("ownerName"), 80) ?? user.name,
    description: str(form.get("description"), 2000), businessType: str(form.get("businessType"), 40),
    cityId, areaId: str(form.get("areaId")), servesWholeCity: form.get("servesWholeCity") === "on",
    serviceAreaIds: form.getAll("serviceAreaIds").map(String), serviceRadiusKm: int(form.get("serviceRadiusKm")),
    modes: form.getAll("modes").map(String), experienceYears: int(form.get("experienceYears")),
    phone: str(form.get("phone"), 20), whatsapp: str(form.get("whatsapp"), 20), email: user.email,
    emailVerified: user.emailVerified, referralSource: str(form.get("referralSource"), 60), status: "draft",
  }).returning();
  for (const c of cats) {
    await db.insert(s.vendorServices).values({ vendorId: v.id, categoryId: c.id, title: c.name, pricingModel: (c.priceModels?.[0] as PricingModel) ?? "quote" });
  }
  await db.update(s.users).set({ isSeller: true }).where(eq(s.users.id, user.id));
  await track("vendor_profile_created", { userId: user.id, cityId, props: { categories: cats.length } });
  redirect("/seller?welcome=1");
}

// ---------- profile (FR-SEL-010) ----------
export async function saveVendorProfile(_: unknown, form: FormData): Promise<Result> {
  const { user, vendor } = await requireVendor();
  const name = str(form.get("name"), 80);
  if (!name) return { error: "Your business name can't be empty." };
  const next: Partial<typeof s.vendors.$inferInsert> = {
    name, ownerName: str(form.get("ownerName"), 80), description: str(form.get("description"), 2000),
    businessType: str(form.get("businessType"), 40), cityId: str(form.get("cityId")), areaId: str(form.get("areaId")),
    servesWholeCity: form.get("servesWholeCity") === "on", serviceAreaIds: form.getAll("serviceAreaIds").map(String),
    serviceRadiusKm: int(form.get("serviceRadiusKm")), modes: form.getAll("modes").map(String),
    experienceYears: int(form.get("experienceYears")), phone: str(form.get("phone"), 20), whatsapp: str(form.get("whatsapp"), 20),
    revealContact: form.get("revealContact") === "on", workingHours: str(form.get("workingHours"), 60),
    advanceNoticeDays: int(form.get("advanceNoticeDays")), capacity: int(form.get("capacity")), updatedAt: new Date(),
  };
  try {
    const cover = form.get("cover") as File | null;
    if (cover && cover.size) next.coverImage = await saveImage(cover, "covers");
    const logo = form.get("logo") as File | null;
    if (logo && logo.size) next.logoImage = await saveImage(logo, "logos");
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
  if (form.get("removeCover") === "on") next.coverImage = null;
  if (form.get("removeLogo") === "on") next.logoImage = null;
  // material changes to a live profile go back to the review queue (profile stays live meanwhile)
  const material = vendor.status === "approved" && MATERIAL_FIELDS.some((k) => k in next && (next as Record<string, unknown>)[k] !== (vendor as Record<string, unknown>)[k]);
  if (material) next.pendingChanges = true;
  if (name !== vendor.name) next.slug = await uniqueSlug(name, vendor.id);
  await db.update(s.vendors).set(next).where(eq(s.vendors.id, vendor.id));
  if (material) await audit({ actorId: user.id, action: "vendor.material_change", objectType: "vendor", objectId: vendor.id, before: pick(vendor), after: pick({ ...vendor, ...next }) });
  refresh(next.slug ?? vendor.slug);
  return { ok: true, message: material ? "Saved. Our team will take a quick look at the changes. Your profile stays live meanwhile." : "Profile saved." };
}

function pick(v: Record<string, unknown>) {
  return Object.fromEntries(MATERIAL_FIELDS.map((k) => [k, v[k]]));
}

// ---------- services (FR-SEL-002/003) ----------
export async function addService(_: unknown, form: FormData): Promise<Result> {
  const { vendor } = await requireVendor();
  const cat = (await getCategories()).find((c) => c.id === form.get("categoryId"));
  if (!cat) return { error: "Choose a category." };
  const [svc] = await db.insert(s.vendorServices).values({ vendorId: vendor.id, categoryId: cat.id, title: cat.name, pricingModel: (cat.priceModels?.[0] as PricingModel) ?? "quote" }).returning();
  refresh(vendor.slug);
  redirect(`/seller/services/${svc.id}`);
}

export async function saveService(_: unknown, form: FormData): Promise<Result> {
  const { vendor } = await requireVendor();
  const svc = await db.query.vendorServices.findFirst({ where: and(eq(s.vendorServices.id, String(form.get("id"))), eq(s.vendorServices.vendorId, vendor.id)) });
  if (!svc) return { error: "Service not found." };
  const title = str(form.get("title"), 100);
  if (!title) return { error: "Give the service a title." };
  const model = String(form.get("pricingModel")) as PricingModel;
  const amount = int(form.get("priceAmount"));
  if (model !== "quote" && !amount) return { error: "Enter a price, or choose “Custom quote”." };
  const defs = await getAttributes(svc.categoryId);
  const attrs: Record<string, string | string[] | boolean | number> = {};
  for (const a of defs) {
    const key = `attr_${a.key}`;
    if (a.type === "boolean") attrs[a.key] = form.get(key) === "on";
    else if (a.type === "multiselect") attrs[a.key] = form.getAll(key).map(String).filter((x) => a.options?.includes(x));
    else if (a.type === "number") { const n = int(form.get(key)); if (n != null) attrs[a.key] = n; }
    else { const v = str(form.get(key), 200); if (v) attrs[a.key] = v; }
    if (a.required && (attrs[a.key] == null || attrs[a.key] === "" || (Array.isArray(attrs[a.key]) && !(attrs[a.key] as string[]).length))) return { error: `“${a.label}” is required.` };
  }
  await db.update(s.vendorServices).set({
    title, description: str(form.get("description"), 1500), pricingModel: model, priceAmount: model === "quote" ? null : amount,
    minOrder: str(form.get("minOrder"), 100), occasions: form.getAll("occasions").map(String), attributes: attrs, active: form.get("active") === "on",
  }).where(eq(s.vendorServices.id, svc.id));
  refresh(vendor.slug);
  return { ok: true, message: "Service saved." };
}

export async function deleteService(serviceId: string) {
  const { vendor } = await requireVendor();
  const count = await db.select({ n: sql<number>`count(*)` }).from(s.vendorServices).where(eq(s.vendorServices.vendorId, vendor.id));
  if (Number(count[0].n) <= 1) return;
  await db.delete(s.vendorServices).where(and(eq(s.vendorServices.id, serviceId), eq(s.vendorServices.vendorId, vendor.id)));
  await db.update(s.portfolioItems).set({ serviceId: null }).where(eq(s.portfolioItems.serviceId, serviceId));
  refresh(vendor.slug);
  redirect("/seller/services");
}

// ---------- portfolio (FR-MKT-011) ----------
export async function uploadPortfolio(_: unknown, form: FormData): Promise<Result> {
  const { user, vendor } = await requireVendor();
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "Choose at least one photo." };
  if (files.length > 10) return { error: "Upload up to 10 photos at a time." };
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(s.portfolioItems).where(eq(s.portfolioItems.vendorId, vendor.id));
  if (Number(n) + files.length > 60) return { error: "You can have up to 60 portfolio photos. Remove some first." };
  try {
    let k = Number(n);
    for (const f of files) {
      const url = await saveImage(f, "portfolio");
      await db.insert(s.portfolioItems).values({
        vendorId: vendor.id, serviceId: str(form.get("serviceId")), imageUrl: url, caption: str(form.get("caption"), 120),
        tags: String(form.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8), priceExample: str(form.get("priceExample"), 80), sortOrder: k++,
      });
    }
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
  await track("portfolio_uploaded", { userId: user.id, props: { count: files.length } });
  refresh(vendor.slug);
  return { ok: true, message: `${files.length} photo${files.length > 1 ? "s" : ""} added.` };
}

export async function updatePortfolioItem(_: unknown, form: FormData): Promise<Result> {
  const { vendor } = await requireVendor();
  await db.update(s.portfolioItems).set({
    caption: str(form.get("caption"), 120), priceExample: str(form.get("priceExample"), 80), serviceId: str(form.get("serviceId")),
    tags: String(form.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
  }).where(and(eq(s.portfolioItems.id, String(form.get("id"))), eq(s.portfolioItems.vendorId, vendor.id)));
  refresh(vendor.slug);
  return { ok: true, message: "Saved." };
}

export async function deletePortfolioItem(id: string) {
  const { vendor } = await requireVendor();
  await db.delete(s.portfolioItems).where(and(eq(s.portfolioItems.id, id), eq(s.portfolioItems.vendorId, vendor.id)));
  refresh(vendor.slug);
}

export async function movePortfolioItem(id: string, dir: -1 | 1) {
  const { vendor } = await requireVendor();
  const list = await db.select().from(s.portfolioItems).where(eq(s.portfolioItems.vendorId, vendor.id)).orderBy(asc(s.portfolioItems.sortOrder));
  const i = list.findIndex((x) => x.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((x, k) => db.update(s.portfolioItems).set({ sortOrder: k }).where(eq(s.portfolioItems.id, x.id))));
  refresh(vendor.slug);
}

// ---------- availability (FR-MKT-007, vendor-provided) ----------
export async function cycleAvailability(date: string) {
  const { vendor } = await requireVendor();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const cur = await db.query.availability.findFirst({ where: and(eq(s.availability.vendorId, vendor.id), eq(s.availability.date, date)) });
  if (!cur) await db.insert(s.availability).values({ vendorId: vendor.id, date, status: "limited" });
  else if (cur.status === "limited") await db.update(s.availability).set({ status: "unavailable" }).where(and(eq(s.availability.vendorId, vendor.id), eq(s.availability.date, date)));
  else await db.delete(s.availability).where(and(eq(s.availability.vendorId, vendor.id), eq(s.availability.date, date)));
  refresh(vendor.slug);
}

// ---------- submit for review (FR-SEL-005) ----------
export async function submitForReview() {
  const { user, vendor } = await requireVendor();
  const services = await db.select().from(s.vendorServices).where(eq(s.vendorServices.vendorId, vendor.id));
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(s.portfolioItems).where(and(eq(s.portfolioItems.vendorId, vendor.id), eq(s.portfolioItems.status, "visible")));
  const c = completeness({ ...vendor, services, portfolioCount: Number(n) });
  if (!c.ready || (vendor.status !== "draft" && vendor.status !== "rejected")) return;
  await db.update(s.vendors).set({ status: "pending", statusReason: null, updatedAt: new Date() }).where(eq(s.vendors.id, vendor.id));
  await audit({ actorId: user.id, action: "vendor.submitted", objectType: "vendor", objectId: vendor.id });
  await track("vendor_profile_submitted", { userId: user.id, cityId: vendor.cityId });
  const staff = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.role, "admin"));
  for (const a of staff) await notify(a.id, { type: "admin_vendor_pending", title: `${vendor.name} submitted for review`, href: `/admin/vendors/${vendor.id}` });
  refresh(vendor.slug);
}

// ---------- claim an ops-created profile (FR-SEL-006) ----------
export async function claimProfile(_: unknown, form: FormData): Promise<Result> {
  const user = await requireUser("/sell/claim");
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  if (!code) return { error: "Enter the claim code our team gave you." };
  const v = await db.query.vendors.findFirst({ where: eq(s.vendors.claimCode, code) });
  if (!v || v.ownerId) return { error: "That code isn't valid or has already been used. Check it with the Ronaq team." };
  const mine = await db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, user.id) });
  if (mine) return { error: "Your account already manages a business. Contact support to merge profiles." };
  await db.update(s.vendors).set({ ownerId: user.id, claimCode: null, email: v.email ?? user.email }).where(eq(s.vendors.id, v.id));
  await db.update(s.users).set({ isSeller: true }).where(eq(s.users.id, user.id));
  await audit({ actorId: user.id, action: "vendor.claimed", objectType: "vendor", objectId: v.id });
  redirect("/seller?claimed=1");
}
