import { requireAdmin } from "@/lib/auth";
import { getAreas, getCategories, getCities } from "@/lib/queries";
import { SERVICE_MODES } from "@/db/catalog";
import { AdminHeader } from "@/components/admin/ui";
import { NewVendorForm } from "./NewVendorForm";

export const metadata = { title: "Assisted onboarding" };

export default async function NewVendor() {
  await requireAdmin();
  const [cats, cities, areas] = await Promise.all([getCategories(), getCities(), getAreas()]);
  return (
    <>
      <AdminHeader title="Assisted onboarding" sub="Create a profile on a vendor's behalf. They get a claim code to take it over later." />
      <div className="max-w-3xl p-4 sm:p-8">
        <NewVendorForm
          cats={cats.map((c) => ({ id: c.id, name: c.name }))}
          cities={cities.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }))}
          areas={areas.map((a) => ({ id: a.id, name: a.name, cityId: a.cityId }))}
          modes={SERVICE_MODES}
        />
      </div>
    </>
  );
}
