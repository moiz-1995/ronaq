import { desc, like, or } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { moderateUser } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/ui";
import { OpForm } from "@/components/admin/OpForm";
import { StatusChip } from "@/components/ui/badges";
import { timeAgo } from "@/lib/time";
import { RoleSelect } from "./RoleSelect";
import { ResetLinkButton } from "./ResetLinkButton";

export const metadata = { title: "Users" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const me = await requireAdmin();
  const { q } = await searchParams;
  const pat = q ? `%${q.replace(/[%_]/g, "")}%` : null;
  const rows = await db.select().from(s.users).where(pat ? or(like(s.users.name, pat), like(s.users.email, pat)) : undefined).orderBy(desc(s.users.createdAt)).limit(100);
  return (
    <>
      <AdminHeader title="Users" sub="Search accounts, suspend or reactivate, and manage staff roles.">
        <form><input name="q" defaultValue={q} placeholder="Name or email…" className="input !min-h-10 !w-64 !py-1.5 text-sm" aria-label="Search users" /></form>
      </AdminHeader>
      <div className="overflow-x-auto p-4 sm:p-8">
        <table className="w-full min-w-[820px] rounded-2xl bg-white text-sm">
          <thead className="bg-sand text-left text-xs uppercase tracking-wider text-mute"><tr><th className="p-3">Name</th><th>Email</th><th>Type</th><th>Role</th><th>Status</th><th>Joined</th><th className="w-56" /></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-ink/10 align-top">
                <td className="p-3 font-bold">{u.name}</td>
                <td>{u.email}{u.emailVerified ? " ✓" : ""}</td>
                <td>{u.isSeller ? "Consumer + seller" : "Consumer"}</td>
                <td>{u.id === me.id ? u.role : <RoleSelect id={u.id} role={u.role} />}</td>
                <td><StatusChip status={u.status === "active" ? "approved" : "suspended"} label={u.status} /></td>
                <td className="text-mute">{timeAgo(u.createdAt)}</td>
                <td className="p-2">{u.id !== me.id && (u.status === "active"
                  ? <OpForm action={moderateUser} hidden={{ id: u.id, op: "suspend" }} label="Suspend" reason="Reason" className="btn btn-sm btn-red" />
                  : <OpForm action={moderateUser} hidden={{ id: u.id, op: "reactivate" }} label="Reactivate" />)}{u.role === "user" && <ResetLinkButton id={u.id} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
