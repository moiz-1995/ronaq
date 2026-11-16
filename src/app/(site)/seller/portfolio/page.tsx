import { asc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireVendorPage } from "@/lib/seller";
import { getCategories } from "@/lib/queries";
import { PortfolioManager } from "./PortfolioManager";

export const metadata = { title: "Portfolio" };

export default async function SellerPortfolio() {
  const { vendor } = await requireVendorPage("/seller/portfolio");
  const [items, services, cats, albums] = await Promise.all([
    db.select().from(s.portfolioItems).where(eq(s.portfolioItems.vendorId, vendor.id)).orderBy(asc(s.portfolioItems.sortOrder)),
    db.select().from(s.vendorServices).where(eq(s.vendorServices.vendorId, vendor.id)),
    getCategories(),
    db.select().from(s.portfolioAlbums).where(eq(s.portfolioAlbums.vendorId, vendor.id)).orderBy(asc(s.portfolioAlbums.sortOrder), asc(s.portfolioAlbums.createdAt)),
  ]);
  return (
    <div className="wrap py-8">
      <h1 className="h-display text-3xl">Portfolio</h1>
      <p className="mt-1 max-w-[65ch] text-mute">Real photos of your work bring the most queries. Achi roshni mein photo lein aur detail dikhayein. Photos optional hain, magar bohat farq parta hai.</p>
      <PortfolioManager
        items={items.map((i) => ({ id: i.id, imageUrl: i.imageUrl, caption: i.caption, tags: i.tags ?? [], priceExample: i.priceExample, serviceId: i.serviceId, albumId: i.albumId, status: i.status, moderationReason: i.moderationReason }))}
        albums={albums.map((a) => ({ id: a.id, name: a.name }))}
        services={services.map((x) => ({ id: x.id, title: x.title, art: cats.find((c) => c.id === x.categoryId)?.art ?? "henna" }))}
      />
    </div>
  );
}
