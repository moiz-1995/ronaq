import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { getCities } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/ui";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function AdminSettings() {
  await requireAdmin();
  const [policy, cap, featured, cities] = await Promise.all([getSetting("reviewPolicy"), getSetting("foundingCap"), getSetting("featuredEnabled"), getCities()]);
  return (
    <>
      <AdminHeader title="Settings" sub="Marketplace rules. Changes take effect immediately and are logged." />
      <div className="max-w-3xl p-4 sm:p-8">
        <SettingsForm policy={policy} cap={cap} featured={featured} cities={cities.map((c) => ({ id: c.id, name: c.name, province: c.province, active: c.active }))} />
      </div>
    </>
  );
}
