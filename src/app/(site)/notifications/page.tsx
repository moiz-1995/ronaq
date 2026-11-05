import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Bell } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { timeAgo } from "@/lib/time";
import { runDueReminders } from "@/lib/reminders";
import { markAllNotificationsRead } from "@/app/actions/planner";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser("/notifications");
  await runDueReminders(user);
  const rows = await db.select().from(s.notifications).where(eq(s.notifications.userId, user.id)).orderBy(desc(s.notifications.createdAt)).limit(100);
  const unread = rows.filter((r) => !r.readAt).length;
  return (
    <div className="wrap max-w-2xl py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="kicker">Updates</p><h1 className="h-display mt-2 text-4xl">Notifications</h1></div>
        {unread > 0 && <form action={markAllNotificationsRead}><button className="btn btn-sm">Mark all as read</button></form>}
      </div>
      <ul className="mt-8 grid gap-2">
        {rows.length === 0 && <li className="card grid place-items-center gap-2 p-10 text-mute"><Bell /> You&apos;re all caught up.</li>}
        {rows.map((n) => (
          <li key={n.id}>
            <Link href={n.href ?? "#"} className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${n.readAt ? "border-ink/10 bg-white" : "border-ink bg-blue-soft"}`}>
              <span className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${n.readAt ? "bg-transparent" : "bg-red"}`} />
              <span className="min-w-0 flex-1">
                <b className="block">{n.title}</b>
                {n.body && <span className="block truncate text-sm text-mute">{n.body}</span>}
              </span>
              <span className="flex-none text-xs text-mute">{timeAgo(n.createdAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-mute">In-app notifications are on. Push and email alerts are coming soon. You can turn reminders off in <Link className="underline" href="/account">settings</Link>.</p>
    </div>
  );
}
