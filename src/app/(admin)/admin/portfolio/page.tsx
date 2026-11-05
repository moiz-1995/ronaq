import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireStaff } from "@/lib/auth";
import { moderatePortfolio } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/ui";
import { OpForm } from "@/components/admin/OpForm";
import { Picture } from "@/components/art/CraftArt";
import { StatusChip } from "@/components/ui/badges";

export const metadata = { title: "Portfolio moderation" };

export default async function AdminPortfolio({ searchParams }: { searchParams: Promise<{ f?: string; page?: string }> }) {
  await requireStaff();
  const { f = "recent", page = "1" } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const base = db.select({ i: s.portfolioItems, vendor: s.vendors.name, vid: s.vendors.id }).from(s.portfolioItems).innerJoin(s.vendors, eq(s.vendors.id, s.portfolioItems.vendorId));
  const rows = await (f === "hidden" ? base.where(eq(s.portfolioItems.status, "hidden")) : base).orderBy(desc(s.portfolioItems.createdAt)).limit(48).offset((p - 1) * 48);
  return (
    <>
      <AdminHeader title="Portfolio moderation" sub="Newest uploads first. Hide anything prohibited or misleading. The vendor sees your reason." />
      <div className="grid gap-4 p-4 sm:p-8">
        <nav className="flex gap-2">{[["recent", "Recent uploads"], ["hidden", "Hidden"]].map(([k, l]) => <Link key={k} href={`/admin/portfolio?f=${k}`} className={`check !text-xs ${f === k ? "!bg-ink !text-sand" : ""}`}>{l}</Link>)}</nav>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {rows.map(({ i, vendor, vid }) => (
            <li key={i.id} className="overflow-hidden rounded-2xl border-2 border-ink/10 bg-white">
              <div className="relative aspect-square"><Picture src={i.imageUrl} alt={i.caption ?? ""} className="h-full w-full" />{i.status !== "visible" && <span className="absolute left-2 top-2"><StatusChip status={i.status} /></span>}</div>
              <div className="grid gap-2 p-3 text-sm">
                <Link href={`/admin/vendors/${vid}`} className="truncate font-bold hover:underline">{vendor}</Link>
                <p className="truncate text-mute">{i.caption ?? "No caption"}</p>
                {i.status === "visible"
                  ? <OpForm action={moderatePortfolio} hidden={{ id: i.id, status: "hidden" }} label="Hide" reason="Reason (vendor sees this)" className="btn btn-sm btn-red" />
                  : <OpForm action={moderatePortfolio} hidden={{ id: i.id, status: "visible" }} label="Restore" />}
              </div>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">{p > 1 && <Link className="btn btn-sm" href={`/admin/portfolio?f=${f}&page=${p - 1}`}>Previous</Link>}{rows.length === 48 && <Link className="btn btn-sm" href={`/admin/portfolio?f=${f}&page=${p + 1}`}>Next</Link>}</div>
      </div>
    </>
  );
}
