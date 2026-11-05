import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireStaff } from "@/lib/auth";
import { AdminNav } from "./AdminNav";

export const metadata = { title: { default: "Admin", template: "%s · Ronaq admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const [[pending], [reports], [reviews]] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(s.vendors).where(sql`${s.vendors.status} = 'pending' or ${s.vendors.pendingChanges} = 1`),
    db.select({ n: sql<number>`count(*)` }).from(s.reports).where(sql`${s.reports.status} in ('open','assigned')`),
    db.select({ n: sql<number>`count(*)` }).from(s.reviews).where(eq(s.reviews.status, "pending")),
  ]);
  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="dot-bg text-sand lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 p-4 lg:block">
          <Link href="/" className="font-shade text-2xl">RONAQ</Link>
          <p className="text-xs text-sand/70 lg:mt-1">Ops console · {user.role}</p>
        </div>
        <AdminNav role={user.role} counts={{ vendors: Number(pending.n), reports: Number(reports.n), reviews: Number(reviews.n) }} />
        <div className="hidden p-4 text-xs text-sand/60 lg:block">Signed in as {user.name}. Every sensitive action is recorded in the audit log.</div>
      </aside>
      <main className="min-w-0 pb-16">{children}</main>
    </div>
  );
}
