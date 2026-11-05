import Link from "next/link";
import { sql } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getAllCategories, getCategoryCounts } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/ui";
import { CraftArt } from "@/components/art/CraftArt";

export const metadata = { title: "Categories" };

export default async function AdminCategories() {
  await requireAdmin();
  const [cats, counts, attrCounts] = await Promise.all([
    getAllCategories(), getCategoryCounts(),
    db.select({ c: s.attributes.categoryId, n: sql<number>`count(*)` }).from(s.attributes).groupBy(s.attributes.categoryId),
  ]);
  return (
    <>
      <AdminHeader title="Categories" sub="Categories and their attributes drive seller questions, profile details and marketplace filters. Changes go live without an app release.">
        <Link href="/admin/categories/new" className="btn btn-sm btn-red"><Plus size={14} /> New category</Link>
      </AdminHeader>
      <ul className="grid gap-3 p-4 sm:grid-cols-2 sm:p-8 xl:grid-cols-3">
        {cats.map((c, i) => (
          <li key={c.id}>
            <Link href={`/admin/categories/${c.id}`} className="flex items-center gap-4 rounded-2xl border-2 border-ink/10 bg-white p-4 hover:border-ink">
              <span className="h-14 w-14 flex-none overflow-hidden rounded-xl border-2 border-ink"><CraftArt kind={c.art} seed={i} className="h-full w-full" /></span>
              <span className="min-w-0 flex-1">
                <b className="block">{c.name} {!c.active && <span className="chip ml-1 bg-white text-mute">HIDDEN</span>}</b>
                <span className="text-sm text-mute">{counts[c.id] ?? 0} live vendors · {Number(attrCounts.find((a) => a.c === c.id)?.n ?? 0)} attributes</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
