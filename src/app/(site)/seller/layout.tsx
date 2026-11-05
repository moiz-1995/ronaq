import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { SellerNav } from "./SellerNav";
import { StatusChip } from "@/components/ui/badges";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/seller");
  const vendor = await db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, user.id) });
  if (!vendor) return <>{children}</>;
  return (
    <div>
      <div className="border-b-[3px] border-ink bg-sand">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="flex items-center gap-2 font-display text-lg">{vendor.name} <StatusChip status={vendor.status} /></p>
          <SellerNav />
        </div>
      </div>
      {children}
    </div>
  );
}
