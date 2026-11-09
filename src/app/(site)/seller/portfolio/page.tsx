import { asc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireVendorPage } from "@/lib/seller";
import { getCategories } from "@/lib/queries";
import { PortfolioManager } from "./PortfolioManager";

export const metadata = { title: "Portfolio" };

export default async function SellerPortfolio() {
  const { vendor } = await requireVendorPage("/seller/portfolio");
  const [items, services, cats] = await Promise.all([
    db.select().from(s.portfolioItems).where(eq(s.portfolioItems.vendorId, vendor.id)).orderBy(asc(s.portfolioItems.sortOrder)),
    db.select().from(s.vendorServices).where(eq(s.vendorServices.vendorId, vendor.id)),
    getCategories(),
  ]);
  return (
    <div className="wrap py-8">
      <h1 className="h-display text-3xl">Portfolio</h1>
      <p className="mt-1 max-w-[65ch] text-mute">Real photos of your own work win the most inquiries. Use good light, show the detail, and add the occasion. Photos are optional, but they make a big difference.</p>
      <PortfolioManager
        items={items.map((i) => ({ id: i.id, imageUrl: i.imageUrl, caption: i.caption, tags: i.tags ?? [], priceExample: i.priceExample, serviceId: i.serviceId, status: i.status, moderationReason: i.moderationReason }))}
        services={services.map((x) => ({ id: x.id, title: x.title, art: cats.find((c) => c.id === x.categoryId)?.art ?? "henna" }))}
      />
    </div>
  );
}
