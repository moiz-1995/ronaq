import Link from "next/link";
import { Suspense } from "react";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { SearchX } from "lucide-react";
import { db, schema as s } from "@/db";
import type { Category } from "@/db/schema";
import { getUser } from "@/lib/auth";
import { getAreas, getAttributes, getCategories, getCities, getPrimaryEvent, getShortlistIds, hydrateVendorCards } from "@/lib/queries";
import { parseSearchParams, recordSearch, searchVendors, inCity } from "@/lib/search";
import { VendorCard } from "@/components/vendor/VendorCard";
import { Bunting, GiftBox } from "@/components/three/Lazy";
import { Filters, SortSelect } from "./Filters";
import { ActiveFilters } from "./ActiveFilters";
import { CraftArt } from "@/components/art/CraftArt";
import { getSetting } from "@/lib/settings";

export async function MarketView({ searchParams, category }: { searchParams: Record<string, string | string[] | undefined>; category?: Category | null }) {
  const params = parseSearchParams(searchParams);
  if (category) params.category = category.id;
  const user = await getUser();
  const [cities, areas, categories, attrs] = await Promise.all([
    getCities(), getAreas(), getCategories(), params.category ? getAttributes(params.category) : Promise.resolve([]),
  ]);
  const result = await searchVendors(params, attrs);
  const cards = await hydrateVendorCards(result.items.map((x) => x.vendor.id));
  const saved = await getShortlistIds(user?.id);
  await recordSearch(params, user?.id);

  // FR-ADM-008 / §2: sponsored placement lives in its own labelled row, never mixed into organic ranking. Off by default.
  let sponsored: Awaited<ReturnType<typeof hydrateVendorCards>> = [];
  if ((result.page ?? 1) === 1 && (await getSetting("featuredEnabled"))) {
    const feat = await db.select({ id: s.vendors.id }).from(s.vendors).innerJoin(s.vendorServices, eq(s.vendorServices.vendorId, s.vendors.id))
      .where(and(eq(s.vendors.status, "approved"), eq(s.vendors.featured, true), ...(params.category ? [eq(s.vendorServices.categoryId, params.category)] : []), ...(params.city ? [inCity(params.city)] : [])))
      .limit(3);
    sponsored = await hydrateVendorCards([...new Set(feat.map((f) => f.id))]);
  }

  // FR-CUS-007: checklist categories come first, but every category stays available.
  let priority: Category[] = [];
  if (user && !category) {
    const ev = await getPrimaryEvent(user.id);
    if (ev) {
      const items = await db.select({ c: s.checklistItems.categoryId, st: s.checklistItems.status }).from(s.checklistItems)
        .where(and(eq(s.checklistItems.eventId, ev.id), isNotNull(s.checklistItems.categoryId))).orderBy(asc(s.checklistItems.sortOrder));
      const open = new Set(items.filter((i) => i.st !== "booked" && i.st !== "completed").map((i) => i.c));
      priority = categories.filter((c) => open.has(c.id));
    }
  }

  const qs = (page: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === "page" || v == null) continue;
      (Array.isArray(v) ? v : [v]).forEach((x) => u.append(k, x));
    }
    if (page > 1) u.set("page", String(page));
    return `?${u}`;
  };

  return (
    <>
      <section className="dot-bg relative overflow-hidden text-sand">
        <Bunting count={18} className="h-16 sm:h-20" />
        <div className="wrap grid items-end gap-6 pb-10 pt-2 md:grid-cols-[1fr_auto]">
          <div className="min-w-0">
            <p className="kicker !text-[#ff8a8f]">{category ? "Category" : "Marketplace"}</p>
            <h1 className="h-display mt-2 text-[clamp(2.2rem,6vw,4.4rem)]">{category ? category.name : params.q ? `“${params.q}”` : "Kya chahiye?"}</h1>
            {category?.description && <p className="mt-2 max-w-[56ch] text-lg text-sand/80">{category.description}</p>}
            <form action={category ? `/c/${category.slug}` : "/marketplace"} className="mt-5 flex max-w-xl gap-2 rounded-2xl border-[3px] border-sand bg-paper p-2 text-ink">
              <label className="sr-only" htmlFor="mq">Search</label>
              <input id="mq" name="q" defaultValue={params.q} placeholder={category ? `Search ${category.name.toLowerCase()}…` : "Search vendors, services, areas…"} className="min-w-0 flex-1 bg-transparent px-3 outline-none" />
              {params.city && <input type="hidden" name="city" value={params.city} />}
              <button className="btn btn-red btn-sm !shadow-none">Search</button>
            </form>
          </div>
          {category && <div className="hidden h-40 w-40 overflow-hidden rounded-3xl border-[3px] border-sand md:block"><CraftArt kind={category.art} seed={3} className="h-full w-full" /></div>}
        </div>
        <div className="patti" />
      </section>

      <div className="wrap py-8">
        {!category && (
          <nav aria-label="Categories" className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-2">
            {[...priority, ...categories.filter((c) => !priority.includes(c))].map((c) => (
              <Link key={c.id} href={`/c/${c.slug}`} className={`chip flex-none !px-3 !py-2 !text-xs ${priority.includes(c) ? "bg-red text-sand" : "bg-white"}`}>
                {priority.includes(c) && "★ "}{c.name}
              </Link>
            ))}
          </nav>
        )}
        {priority.length > 0 && <p className="-mt-3 mb-5 text-sm text-mute">★ Still needed on your checklist</p>}

        <div>
          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Suspense><Filters cities={cities} areas={areas} categories={categories} attributes={attrs} fixedCategory={category} /></Suspense>
                <p className="font-bold" aria-live="polite">{result.total} {result.total === 1 ? "vendor" : "vendors"}{params.q ? <> for “{params.q}”</> : null}</p>
              </div>
              <Suspense><SortSelect /></Suspense>
            </div>
            <ActiveFilters searchParams={searchParams} basePath={category ? `/c/${category.slug}` : "/marketplace"} cities={cities} areas={areas} categories={categories} attrs={attrs} />
            {sponsored.length > 0 && (
              <section aria-label="Sponsored" className="mb-8 rounded-3xl border-2 border-dashed border-sun bg-sun/10 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-mute">Sponsored · paid placement, not a ranking</p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{sponsored.map((d, i) => <VendorCard key={d.vendor.id} data={d} saved={saved.has(d.vendor.id)} seed={i + 90} sponsored />)}</div>
              </section>
            )}
            {params.sort === "price" &&<p className="mb-4 rounded-xl bg-sand px-3 py-2 text-sm">Sorted by listed starting price. Vendors who only give custom quotes appear last.</p>}
            {cards.length ? (
              <div data-stagger suppressHydrationWarning className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cards.map((d, i) => <VendorCard key={d.vendor.id} data={d} saved={saved.has(d.vendor.id)} seed={i + (result.page - 1) * 12} />)}
              </div>
            ) : (
              <div className="card grid place-items-center gap-3 p-10 text-center">
                <GiftBox className="h-40 w-40" />
                <SearchX className="text-red" />
                <h2 className="font-display text-2xl">No vendors match yet</h2>
                <p className="max-w-md text-mute">Try removing a filter, choosing a nearby area, or searching a broader word like “mehndi” or “catering”. New vendors join every week.</p>
                <Link href={category ? `/c/${category.slug}` : "/marketplace"} className="btn btn-blue">Clear filters</Link>
              </div>
            )}
            {result.pages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pages">
                {result.page > 1 && <Link className="btn btn-sm" href={qs(result.page - 1)}>Previous</Link>}
                <span className="px-3 text-sm font-bold">Page {result.page} of {result.pages}</span>
                {result.page < result.pages && <Link className="btn btn-sm" href={qs(result.page + 1)}>Next</Link>}
              </nav>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
