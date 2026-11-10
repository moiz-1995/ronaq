import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { SellerNav } from "./SellerNav";
import { StatusChip } from "@/components/ui/badges";
import { MODE_COOKIE } from "@/lib/mode";
import { ModeSync } from "./ModeSync";
import { PublishBar } from "./PublishBar";
import { vendorCompleteness } from "@/lib/seller";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/seller");
  const vendor = await db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, user.id) });
  if (!vendor) return <>{children}</>;
  const synced = (await cookies()).get(MODE_COOKIE)?.value === "vendor";
  const c = vendor.status === "draft" || vendor.status === "rejected" ? await vendorCompleteness(vendor.id) : null;
  return (
    <div>
      {!synced && <ModeSync />}
      <div className="border-b-[3px] border-ink bg-sand">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="flex items-center gap-2 font-display text-lg">{vendor.name} <StatusChip status={vendor.status} /></p>
          <SellerNav />
        </div>
      </div>
      {c && <PublishBar status={vendor.status} statusReason={vendor.statusReason} ready={c.ready} missing={c.items.filter((i) => !i.done && !i.optional)} />}
      {children}
    </div>
  );
}
