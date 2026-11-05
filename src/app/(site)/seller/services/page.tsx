import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireVendorPage } from "@/lib/seller";
import { getCategories } from "@/lib/queries";
import { displayPrice } from "@/lib/price";
import { CraftArt } from "@/components/art/CraftArt";
import { AddServiceForm } from "./AddServiceForm";

export const metadata = { title: "Services" };

export default async function SellerServices() {
  const { vendor } = await requireVendorPage("/seller/services");
  const [services, cats] = await Promise.all([
    db.select().from(s.vendorServices).where(eq(s.vendorServices.vendorId, vendor.id)).orderBy(asc(s.vendorServices.createdAt)),
    getCategories(),
  ]);
  return (
    <div className="wrap max-w-4xl py-8">
      <h1 className="h-display text-3xl">Services &amp; prices</h1>
      <p className="mt-1 text-mute">Each service has its own category, pricing and details. Details shown here become filters families use to find you.</p>
      <ul className="mt-6 grid gap-4">
        {services.map((svc, i) => {
          const cat = cats.find((c) => c.id === svc.categoryId);
          const p = displayPrice(svc.pricingModel, svc.priceAmount);
          const filled = Object.values(svc.attributes ?? {}).filter((x) => x !== "" && x != null && !(Array.isArray(x) && !x.length)).length;
          return (
            <li key={svc.id}>
              <Link href={`/seller/services/${svc.id}`} className="card flex flex-wrap items-center gap-4 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)]">
                <span className="h-16 w-16 overflow-hidden rounded-xl border-2 border-ink"><CraftArt kind={cat?.art ?? "henna"} seed={i} className="h-full w-full" /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xs text-blue">{cat?.name.toUpperCase()}</p>
                  <p className="text-lg font-bold">{svc.title}</p>
                  <p className="text-sm text-mute">{filled} details filled{svc.active ? "" : " · hidden"}</p>
                </div>
                <p className="text-right"><span className="text-xs text-mute">{p.lead} </span><b className="font-display text-red">{p.amount}</b> <span className="text-xs text-mute">{p.unit}</span></p>
              </Link>
            </li>
          );
        })}
      </ul>
      <AddServiceForm cats={cats.filter((c) => !services.some((x) => x.categoryId === c.id)).map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
