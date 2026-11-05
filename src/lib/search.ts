import "server-only";
import { and, eq, inArray, like, or } from "drizzle-orm";
import { db, schema as s } from "@/db";
import type { Attribute, PricingModel } from "@/db/schema";
import { comparePrice } from "./price";
import { servesArea } from "./domain";
import { getAreas } from "./queries";

export type SearchParams = {
  q?: string;
  city?: string; // city id
  area?: string; // area id
  category?: string; // category id
  mode?: string;
  min?: number;
  max?: number;
  date?: string; // YYYY-MM-DD
  quoteOk?: boolean; // include custom-quote vendors when a budget is set
  sort?: "relevance" | "price" | "rating" | "newest" | "distance";
  attrs?: Record<string, string[]>; // attribute key → selected values ("true" for booleans)
  page?: number;
  pageSize?: number;
};

export const PAGE_SIZE = 12;

/** Server-side search; the client only ever receives one page (PRD §16.1). */
export async function searchVendors(p: SearchParams, attrDefs: Attribute[] = []) {
  const conds = [eq(s.vendors.status, "approved"), eq(s.vendorServices.active, true)];
  if (p.city) conds.push(eq(s.vendors.cityId, p.city));
  if (p.category) conds.push(eq(s.vendorServices.categoryId, p.category));
  const q = p.q?.trim();
  if (q) {
    const pat = `%${q.replace(/[%_]/g, "")}%`;
    const catHits = await db.select({ id: s.categories.id }).from(s.categories).where(like(s.categories.name, pat));
    conds.push(
      or(
        like(s.vendors.name, pat),
        like(s.vendors.description, pat),
        like(s.vendorServices.title, pat),
        like(s.vendorServices.description, pat),
        ...(catHits.length ? [inArray(s.vendorServices.categoryId, catHits.map((c) => c.id))] : []),
      )!,
    );
  }
  const rows = await db
    .select({ vendor: s.vendors, service: s.vendorServices })
    .from(s.vendorServices)
    .innerJoin(s.vendors, eq(s.vendors.id, s.vendorServices.vendorId))
    .where(and(...conds));

  // one row per vendor: the best-matching service
  const byVendor = new Map<string, (typeof rows)[number]>();
  for (const r of rows) if (!byVendor.has(r.vendor.id)) byVendor.set(r.vendor.id, r);
  let list = [...byVendor.values()];

  const areas = await getAreas();
  const areaById = new Map(areas.map((a) => [a.id, a]));
  const target = p.area ? areaById.get(p.area) : undefined;

  if (target) {
    list = list.filter(({ vendor: v }) => {
      const home = v.areaId ? areaById.get(v.areaId) : undefined;
      return servesArea({ ...v, serviceAreaIds: v.serviceAreaIds ?? [], areaLat: home?.lat, areaLng: home?.lng }, target);
    });
  }
  if (p.mode) list = list.filter(({ vendor }) => vendor.modes?.includes(p.mode!));

  if (p.min != null || p.max != null) {
    list = list.filter(({ service }) => {
      if (service.pricingModel === "quote" || service.priceAmount == null) return !!p.quoteOk;
      return (p.min == null || service.priceAmount >= p.min) && (p.max == null || service.priceAmount <= p.max);
    });
  }

  if (p.attrs && Object.keys(p.attrs).length) {
    for (const [key, values] of Object.entries(p.attrs)) {
      if (!values.length) continue;
      const def = attrDefs.find((a) => a.key === key);
      list = list.filter(({ service }) => {
        const val = service.attributes?.[key];
        if (def?.type === "boolean") return val === true;
        if (def?.type === "number") return typeof val === "number" && val >= Number(values[0]);
        if (Array.isArray(val)) return values.some((x) => val.includes(x));
        return values.includes(String(val));
      });
    }
  }

  if (p.date && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && list.length) {
    const blocked = await db
      .select({ v: s.availability.vendorId })
      .from(s.availability)
      .where(and(eq(s.availability.date, p.date), eq(s.availability.status, "unavailable"), inArray(s.availability.vendorId, list.map((x) => x.vendor.id))));
    const set = new Set(blocked.map((b) => b.v));
    list = list.filter((x) => !set.has(x.vendor.id));
  }

  const sort = p.sort ?? "relevance";
  const score = (x: (typeof list)[number]) => {
    let sc = x.vendor.ratingAvg * Math.log10(10 + x.vendor.ratingCount);
    if (q && x.vendor.name.toLowerCase().includes(q.toLowerCase())) sc += 10;
    if (q && x.service.title.toLowerCase().includes(q.toLowerCase())) sc += 4;
    return sc;
  };
  if (sort === "price") list.sort((a, b) => comparePrice(a.service as { pricingModel: PricingModel; priceAmount: number | null }, b.service));
  else if (sort === "rating") list.sort((a, b) => b.vendor.ratingAvg - a.vendor.ratingAvg || b.vendor.ratingCount - a.vendor.ratingCount);
  else if (sort === "newest") list.sort((a, b) => (b.vendor.approvedAt?.getTime() ?? 0) - (a.vendor.approvedAt?.getTime() ?? 0));
  else if (sort === "distance" && target?.lat != null) {
    const d = (x: (typeof list)[number]) => {
      const h = x.vendor.areaId ? areaById.get(x.vendor.areaId) : undefined;
      return h?.lat != null ? Math.hypot(h.lat - target.lat!, (h.lng! - target.lng!) * 0.84) : 99;
    };
    list.sort((a, b) => d(a) - d(b));
  } else list.sort((a, b) => score(b) - score(a));

  const pageSize = p.pageSize ?? PAGE_SIZE;
  const page = Math.max(1, p.page ?? 1);
  const total = list.length;
  return { total, page, pages: Math.max(1, Math.ceil(total / pageSize)), items: list.slice((page - 1) * pageSize, page * pageSize) };
}

export function parseSearchParams(sp: Record<string, string | string[] | undefined>): SearchParams {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) as string | undefined;
  const num = (k: string) => { const v = one(k); return v && !isNaN(Number(v)) ? Number(v) : undefined; };
  const attrs: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (k.startsWith("a_") && v) attrs[k.slice(2)] = Array.isArray(v) ? v : [v];
  }
  return {
    q: one("q"), city: one("city"), area: one("area"), category: one("category"), mode: one("mode"),
    min: num("min"), max: num("max"), date: one("date"), quoteOk: one("quote") !== "0",
    sort: (one("sort") as SearchParams["sort"]) ?? "relevance", page: num("page"), attrs,
  };
}

export async function recordSearch(p: SearchParams, userId?: string | null) {
  const { track } = await import("./track");
  await track(userId ? "search_performed" : "guest_search_performed", { userId, cityId: p.city, categoryId: p.category, props: { hasQuery: !!p.q, sort: p.sort ?? "relevance" } });
  const filters = Object.keys(p.attrs ?? {}).length + (p.mode ? 1 : 0) + (p.min || p.max ? 1 : 0) + (p.area ? 1 : 0) + (p.date ? 1 : 0);
  if (filters) await track("filter_applied", { userId, cityId: p.city, categoryId: p.category, props: { count: filters } });
}

