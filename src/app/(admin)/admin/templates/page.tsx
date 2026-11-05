import { requireAdmin } from "@/lib/auth";
import { getTemplates, getAllCategories } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/ui";
import { TemplateForm } from "./TemplateForm";

export const metadata = { title: "Templates" };

export default async function AdminTemplates() {
  await requireAdmin();
  const [tpls, cats] = await Promise.all([getTemplates(), getAllCategories()]);
  return (
    <>
      <AdminHeader title="Event templates" sub="Default checklists offered in the Launchpad. Nothing in them is mandatory for families." />
      <div className="grid gap-4 p-4 sm:p-8 xl:grid-cols-2">
        <p className="rounded-xl bg-sand p-3 text-sm xl:col-span-2">One item per line. Link an item to a marketplace category with <code className="font-mono">Label | category-slug</code>. Slugs: {cats.map((c) => c.slug).join(", ")}.</p>
        {tpls.map((t) => <TemplateForm key={t.id} t={{ id: t.id, name: t.name, label: t.label, items: (t.items ?? []).map((i) => (i.categorySlug ? `${i.label} | ${i.categorySlug}` : i.label)).join("\n") }} />)}
      </div>
    </>
  );
}
