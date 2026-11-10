import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { getAllCategories, getCities } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/ui";
import { StatusChip } from "@/components/ui/badges";
import { timeAgo } from "@/lib/time";

export const metadata = { title: "Vendors" };

export default async function AdminVendors({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; city?: string; category?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [all, svcs, cats, cities] = await Promise.all([db.select().from(s.vendors).orderBy(desc(s.vendors.updatedAt)), db.select().from(s.vendorServices), getAllCategories(), getCities()]);
  const status = sp.status ?? "queue";
  const q = sp.q?.toLowerCase().trim();
  const rows = all.filter((v) =>
    (status === "all" || (status === "queue" ? v.status === "pending" || v.pendingChanges || (v.status === "approved" && !v.profileReviewed) : v.status === status)) &&
    (!q || v.name.toLowerCase().includes(q) || v.slug.includes(q)) &&
    (!sp.city || v.cityId === sp.city) &&
    (!sp.category || svcs.some((x) => x.vendorId === v.id && x.categoryId === sp.category)),
  );
  const tabs: [string, string][] = [["queue", "Review queue"], ["all", "All"], ["draft", "Draft"], ["pending", "Pending"], ["approved", "Live"], ["rejected", "Rejected"], ["suspended", "Suspended"]];
  return (
    <>
      <AdminHeader title="Vendors" sub={`${all.filter((v) => v.status === "approved").length} live · ${all.filter((v) => v.founding).length} founding`}>
        <Link href="/admin/vendors/new" className="btn btn-sm btn-red"><Plus size={14} /> Assisted onboarding</Link>
      </AdminHeader>
      <div className="grid gap-4 p-4 sm:p-8">
        <nav className="flex flex-wrap gap-2" aria-label="Status">
          {tabs.map(([k, l]) => <Link key={k} href={`/admin/vendors?status=${k}`} className={`check !text-xs ${status === k ? "!bg-ink !text-sand" : ""}`}>{l}</Link>)}
        </nav>
        <form className="flex flex-wrap gap-2">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={sp.q} placeholder="Search name…" className="input !min-h-10 !w-56 !py-1.5 text-sm" aria-label="Search vendors" />
          <Select name="city" defaultValue={sp.city ?? ""} className="input !min-h-10 !w-auto !py-1.5 text-sm" aria-label="City"><option value="">All cities</option>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <Select name="category" defaultValue={sp.category ?? ""} className="input !min-h-10 !w-auto !py-1.5 text-sm" aria-label="Category"><option value="">All categories</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
          <button className="btn btn-sm btn-ink">Filter</button>
        </form>
        <div className="overflow-x-auto rounded-2xl border-2 border-ink/10 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-sand text-left text-xs uppercase tracking-wider text-mute">
              <tr><th className="p-3">Vendor</th><th>Category</th><th>City</th><th>Status</th><th>Flags</th><th>Updated</th></tr>
            </thead>
            <tbody>
              {rows.map((v) => {
                const cat = cats.find((c) => c.id === svcs.find((x) => x.vendorId === v.id)?.categoryId);
                return (
                  <tr key={v.id} className="border-t border-ink/10 hover:bg-paper">
                    <td className="p-3"><Link href={`/admin/vendors/${v.id}`} className="font-bold hover:underline">{v.name}</Link>{!v.ownerId && <span className="ml-2 text-xs text-mute">(unclaimed)</span>}</td>
                    <td>{cat?.name ?? "—"}</td>
                    <td>{cities.find((c) => c.id === v.cityId)?.name ?? "—"}</td>
                    <td><StatusChip status={v.status} /></td>
                    <td className="space-x-1">{v.founding && <span className="chip bg-sand">FOUNDING #{v.foundingNumber}</span>}{v.pendingChanges && <span className="chip bg-sun">CHANGES</span>}{v.featured && <span className="chip bg-pink text-white">FEATURED</span>}</td>
                    <td className="text-mute">{timeAgo(v.updatedAt)}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-mute">Nothing here. {status === "queue" && "The review queue is clear 🎉"}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
