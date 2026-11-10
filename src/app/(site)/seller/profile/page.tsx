import { requireVendorPage } from "@/lib/seller";
import { getAreas, getCities, getCategories } from "@/lib/queries";
import { BUSINESS_TYPES, SERVICE_MODES } from "@/db/catalog";
import { ProfileForm } from "./ProfileForm";
import { db, schema as s } from "@/db";
import { eq } from "drizzle-orm";

export const metadata = { title: "Dukaan ki profile" };

export default async function SellerProfile() {
  const { vendor } = await requireVendorPage("/seller/profile");
  const [cities, areas, cats, svc] = await Promise.all([getCities(), getAreas(), getCategories(), db.query.vendorServices.findFirst({ where: eq(s.vendorServices.vendorId, vendor.id) })]);
  const art = cats.find((c) => c.id === svc?.categoryId)?.art ?? "henna";
  return (
    <div className="wrap max-w-4xl py-8">
      <h1 className="h-display text-3xl">Dukaan ki profile</h1>
      <p className="mt-1 text-mute">Khareedar aap ke page par yehi dekhte hain.</p>
      <ProfileForm
        v={{ ...vendor, serviceAreaIds: vendor.serviceAreaIds ?? [], modes: vendor.modes ?? [] }}
        art={art}
        cities={cities.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }))}
        areas={areas.map((a) => ({ id: a.id, name: a.name, cityId: a.cityId }))}
        businessTypes={BUSINESS_TYPES}
        modes={SERVICE_MODES}
      />
    </div>
  );
}
