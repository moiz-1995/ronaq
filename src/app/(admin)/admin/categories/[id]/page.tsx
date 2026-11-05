import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAllCategories, getAttributes } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/ui";
import { AttributeEditor, CategoryForm } from "./forms";

export const metadata = { title: "Category" };

export default async function AdminCategory({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const cat = isNew ? null : (await getAllCategories()).find((c) => c.id === id);
  if (!isNew && !cat) notFound();
  const attrs = cat ? await getAttributes(cat.id) : [];
  return (
    <>
      <AdminHeader title={cat?.name ?? "New category"} sub={cat ? `/c/${cat.slug}` : undefined}>
        <Link href="/admin/categories" className="btn btn-sm">All categories</Link>
      </AdminHeader>
      <div className="grid gap-6 p-4 sm:p-8 xl:grid-cols-[380px_1fr]">
        <CategoryForm cat={cat ? { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description, noun: cat.noun, art: cat.art, priceModels: cat.priceModels ?? [], active: cat.active, sortOrder: cat.sortOrder } : null} />
        {cat && <AttributeEditor categoryId={cat.id} attrs={attrs.map((a) => ({ ...a, options: a.options ?? [] }))} />}
      </div>
    </>
  );
}
