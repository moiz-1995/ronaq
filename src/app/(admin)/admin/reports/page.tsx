import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireStaff } from "@/lib/auth";
import { handleReport } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/ui";
import { OpForm } from "@/components/admin/OpForm";
import { StatusChip } from "@/components/ui/badges";
import { timeAgo } from "@/lib/time";

export const metadata = { title: "Reports" };

export default async function AdminReports({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const me = await requireStaff();
  const { f = "open" } = await searchParams;
  const all = await db.select().from(s.reports).orderBy(desc(s.reports.createdAt));
  const rows = all.filter((r) => f === "all" || (f === "open" ? r.status === "open" || r.status === "assigned" : f === "mine" ? r.assigneeId === me.id : r.status === f));
  const userIds = [...new Set(rows.flatMap((r) => [r.reporterId, r.assigneeId]).filter(Boolean) as string[])];
  const people = userIds.length ? await db.select({ id: s.users.id, name: s.users.name }).from(s.users).where(inArray(s.users.id, userIds)) : [];
  const name = (id: string | null) => people.find((p) => p.id === id)?.name ?? (id ? "?" : "Guest");

  async function targetPreview(type: string, id: string): Promise<{ text: string; href?: string }> {
    if (type === "vendor") { const v = await db.query.vendors.findFirst({ where: eq(s.vendors.id, id) }); return { text: v ? `Vendor: ${v.name}` : "Vendor (deleted)", href: v ? `/admin/vendors/${v.id}` : undefined }; }
    if (type === "review") { const r = await db.query.reviews.findFirst({ where: eq(s.reviews.id, id) }); return { text: r ? `Review (${r.rating}★, ${r.status}): “${r.text?.slice(0, 140) ?? ""}”` : "Review (deleted)", href: "/admin/reviews" }; }
    if (type === "portfolio") { const p = await db.query.portfolioItems.findFirst({ where: eq(s.portfolioItems.id, id) }); return { text: p ? `Portfolio photo (${p.status}): ${p.caption ?? "no caption"}` : "Photo (deleted)", href: "/admin/portfolio" }; }
    if (type === "message") { const m = await db.query.messages.findFirst({ where: eq(s.messages.id, id) }); return { text: m ? `Message: “${m.body.slice(0, 160)}”` : "Message (deleted)" }; }
    const u = await db.query.users.findFirst({ where: eq(s.users.id, id) }); return { text: u ? `User: ${u.name}` : "User" };
  }
  const previews = await Promise.all(rows.map((r) => targetPreview(r.targetType, r.targetId)));

  return (
    <>
      <AdminHeader title="Reports" sub="Content reported by families, vendors and guests." />
      <div className="grid gap-4 p-4 sm:p-8">
        <nav className="flex flex-wrap gap-2">{[["open", "Open"], ["mine", "Assigned to me"], ["resolved", "Resolved"], ["dismissed", "Dismissed"], ["all", "All"]].map(([k, l]) => <Link key={k} href={`/admin/reports?f=${k}`} className={`check !text-xs ${f === k ? "!bg-ink !text-sand" : ""}`}>{l}</Link>)}</nav>
        <ul className="grid gap-3">
          {rows.length === 0 && <li className="rounded-2xl border-2 border-dashed border-ink/20 p-8 text-center text-mute">No reports here.</li>}
          {rows.map((r, i) => (
            <li key={r.id} className="grid gap-4 rounded-2xl border-2 border-ink/10 bg-white p-5 lg:grid-cols-[1fr_320px]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><StatusChip status={r.status} /><b>{r.reason}</b><span className="text-sm text-mute">· {r.targetType} · {timeAgo(r.createdAt)} · by {name(r.reporterId)}</span></div>
                <p className="mt-2 rounded-xl bg-paper p-3 text-sm">{previews[i].href ? <Link href={previews[i].href!} className="underline">{previews[i].text}</Link> : previews[i].text}</p>
                {r.details && <p className="mt-2 text-sm"><span className="text-mute">Reporter says:</span> {r.details}</p>}
                {r.assigneeId && <p className="mt-2 text-xs text-mute">Assigned to {name(r.assigneeId)}</p>}
                {r.resolution && <p className="mt-2 text-sm"><span className="text-mute">Outcome:</span> {r.resolution}</p>}
              </div>
              {(r.status === "open" || r.status === "assigned") && (
                <div className="grid content-start gap-2">
                  {r.status === "open" && <OpForm action={handleReport} hidden={{ id: r.id, op: "assign" }} label="Assign to me" />}
                  <OpForm action={handleReport} hidden={{ id: r.id, op: "hide_target" }} label={r.targetType === "vendor" ? "Suspend vendor" : r.targetType === "user" ? "Suspend user" : "Hide content"} reason="Reason (kept in audit log, shown to the owner)" reasonName="resolution" className="btn btn-sm btn-red" />
                  <OpForm action={handleReport} hidden={{ id: r.id, op: "resolve" }} label="Resolve" reason="What did you find or do?" reasonName="resolution" className="btn btn-sm btn-blue" />
                  <OpForm action={handleReport} hidden={{ id: r.id, op: "dismiss" }} label="Dismiss" reason="Why is no action needed?" reasonName="resolution" />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
