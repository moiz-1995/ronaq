import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireVendorPage } from "@/lib/seller";
import { getCategories } from "@/lib/queries";
import { displayPrice } from "@/lib/price";
import { CraftArt } from "@/components/art/CraftArt";
import { AddServiceForm } from "./AddServiceForm";
import { RemoveServiceButton } from "./RemoveServiceButton";

export const metadata = { title: "Services aur rates" };

export default async function SellerServices() {
  const { vendor } = await requireVendorPage("/seller/services");
  const [services, cats] = await Promise.all([
    db.select().from(s.vendorServices).where(eq(s.vendorServices.vendorId, vendor.id)).orderBy(asc(s.vendorServices.createdAt)),
    getCategories(),
  ]);
  return (
    <div className="wrap max-w-4xl py-8">
      <h1 className="h-display text-3xl">Services aur rates</h1>
      <p className="mt-1 text-mute">Har service ka apna rate aur tafseel hoti hai. Yehi tafseel khareedar filter mein istemal karte hain.</p>
      <ul data-stagger suppressHydrationWarning className="mt-6 grid gap-4">
        {services.map((svc, i) => {
          const cat = cats.find((c) => c.id === svc.categoryId);
          const p = displayPrice(svc.pricingModel, svc.priceAmount);
          const filled = Object.values(svc.attributes ?? {}).filter((x) => x !== "" && x != null && !(Array.isArray(x) && !x.length)).length;
          return (
            <li key={svc.id}>
              <div className="card flex flex-wrap items-center gap-3 bg-white p-4 transition hover:shadow-[5px_5px_0_var(--color-ink)]">
              <Link href={`/seller/services/${svc.id}`} className="flex min-w-[240px] flex-1 flex-wrap items-center gap-4">
                <span className="h-16 w-16 overflow-hidden rounded-xl border-2 border-ink"><CraftArt kind={cat?.art ?? "henna"} seed={i} className="h-full w-full" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xs text-blue">{cat?.name.toUpperCase()}</p>
                  <p className="text-lg font-bold">{svc.title}</p>
                  <p className="text-sm text-mute">{filled} tafseel bhari hain{svc.active ? "" : " · chhupi hui"}</p>
                </div>
                <p className="text-right"><span className="text-xs text-mute">{p.lead} </span><b className="font-display text-red">{p.amount}</b> <span className="text-xs text-mute">{p.unit}</span></p>
              </Link>
              <RemoveServiceButton id={svc.id} title={svc.title} canRemove={services.length > 1} />
              </div>
            </li>
          );
        })}
      </ul>
      <AddServiceForm cats={cats.filter((c) => !services.some((x) => x.categoryId === c.id)).map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
