import Link from "next/link";
import { desc, eq, like } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/time";

export const metadata = { title: "Audit log" };

export default async function AdminAudit({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireAdmin();
  const { q, page = "1" } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const rows = await db.select({ a: s.auditLog, actor: s.users.name }).from(s.auditLog).leftJoin(s.users, eq(s.users.id, s.auditLog.actorId))
    .where(q ? like(s.auditLog.action, `%${q.replace(/[%_]/g, "")}%`) : undefined).orderBy(desc(s.auditLog.createdAt)).limit(100).offset((p - 1) * 100);
  return (
    <>
      <AdminHeader title="Audit log" sub="Approvals, suspensions, moderation, edits made on a vendor's behalf and settings changes. Admins only. Kept for at least 2 years.">
        <form><input name="q" defaultValue={q} placeholder="Filter action, e.g. vendor." className="input !min-h-10 !w-64 !py-1.5 text-sm" aria-label="Filter by action" /></form>
      </AdminHeader>
      <div className="overflow-x-auto p-4 sm:p-8">
        <table className="w-full min-w-[820px] bg-white text-sm">
          <thead className="bg-sand text-left text-xs uppercase tracking-wider text-mute"><tr><th className="p-3">When (PKT)</th><th>Who</th><th>Action</th><th>Object</th><th>Reason</th><th>Change</th></tr></thead>
          <tbody>
            {rows.map(({ a, actor }) => (
              <tr key={a.id} className="border-t border-ink/10 align-top">
                <td className="whitespace-nowrap p-3 text-mute">{formatDateTime(a.createdAt)}</td>
                <td>{actor ?? "system"}</td>
                <td className="font-mono text-xs font-bold">{a.action}</td>
                <td>{a.objectType === "vendor" && a.objectId ? <Link className="underline" href={`/admin/vendors/${a.objectId}`}>vendor</Link> : a.objectType}</td>
                <td className="max-w-xs">{a.reason}</td>
                <td className="max-w-sm"><details><summary className="cursor-pointer text-xs text-mute">before / after</summary><pre className="mt-1 max-h-48 overflow-auto rounded bg-paper p-2 text-[11px]">{JSON.stringify({ before: a.before, after: a.after }, null, 1)}</pre></details></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-mute">No entries.</td></tr>}
          </tbody>
        </table>
        <div className="mt-4 flex gap-2">{p > 1 && <Link className="btn btn-sm" href={`/admin/audit?page=${p - 1}${q ? `&q=${q}` : ""}`}>Newer</Link>}{rows.length === 100 && <Link className="btn btn-sm" href={`/admin/audit?page=${p + 1}${q ? `&q=${q}` : ""}`}>Older</Link>}</div>
      </div>
    </>
  );
}
