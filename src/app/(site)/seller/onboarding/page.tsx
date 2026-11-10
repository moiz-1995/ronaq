import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { getAreas, getCategories, getCities } from "@/lib/queries";
import { BUSINESS_TYPES, SERVICE_MODES, HEARD_FROM } from "@/db/catalog";
import { SellerWizard } from "./SellerWizard";

export const metadata = { title: "Start selling" };

export default async function SellerOnboardingPage() {
  const user = await requireUser("/seller/onboarding");
  if (await db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, user.id) })) redirect("/seller");
  const [cities, areas, cats] = await Promise.all([getCities(), getAreas(), getCategories()]);
  return (
    <div className="wrap max-w-3xl py-10">
      <p className="kicker">Start selling</p>
      <h1 className="h-display mt-2 text-[clamp(2rem,6vw,3.4rem)]">Set up your dukaan</h1>
      <p className="mt-2 text-mute">Five quick steps aur aap ki dukaan live. Photos and other details baad mein bhi add kar sakte hain.</p>
      <SellerWizard
        user={{ name: user.name, phone: user.phone }}
        cities={cities.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }))}
        areas={areas.map((a) => ({ id: a.id, name: a.name, cityId: a.cityId }))}
        cats={cats.map((c) => ({ slug: c.slug, name: c.name, art: c.art, description: c.description ?? "" }))}
        businessTypes={BUSINESS_TYPES}
        modes={SERVICE_MODES}
        heard={HEARD_FROM}
      />
    </div>
  );
}
