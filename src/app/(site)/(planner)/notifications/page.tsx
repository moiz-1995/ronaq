import Link from "next/link";
import { cookies } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { Bell } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { getMyVendor } from "@/lib/queries";
import { timeAgo } from "@/lib/time";
import { runDueReminders } from "@/lib/reminders";
import { MODE_COOKIE, notificationAudience } from "@/lib/mode";
import { markAllNotificationsRead } from "@/app/actions/planner";

export const metadata = { title: "Notifications" };

const CHIP = { vendor: ["DUKAANDAAR", "bg-red text-sand"], customer: ["KHAREEDAR", "bg-blue text-sand"], admin: ["ADMIN", "bg-ink text-sand"] } as const;

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser("/notifications");
  await runDueReminders(user);
  const [rows, vendor, sp] = await Promise.all([
    db.select().from(s.notifications).where(eq(s.notifications.userId, user.id)).orderBy(desc(s.notifications.createdAt)).limit(100),
    getMyVendor(user.id),
    searchParams,
  ]);
  const vendorMode = !!vendor && (await cookies()).get(MODE_COOKIE)?.value === "vendor";
  // people with a dukaan see their two kinds of updates apart; everyone else just sees one list
  const tab = !vendor ? "all" : sp.tab === "vendor" || sp.tab === "customer" || sp.tab === "all" ? sp.tab : vendorMode ? "vendor" : "customer";
  const tagged = rows.map((n) => ({ n, who: notificationAudience(n) }));
  const shown = tagged.filter(({ who }) => tab === "all" || who === tab || who === "admin");
  const unread = shown.filter(({ n }) => !n.readAt).length;
  const count = (who: string) => tagged.filter((x) => !x.n.readAt && (who === "all" || x.who === who)).length;
  return (
    <div className="wrap max-w-2xl py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="kicker">Updates</p><h1 className="h-display mt-2 text-4xl">Notifications</h1></div>
        {unread > 0 && <form action={markAllNotificationsRead}><button className="btn btn-sm">Mark all as read</button></form>}
      </div>
      {vendor && (
        <nav className="mt-5 flex flex-wrap gap-2" aria-label="Show notifications for">
          {([["vendor", "Dukaandaar"], ["customer", "Khareedar"], ["all", "All"]] as const).map(([k, label]) => (
            <Link key={k} href={`/notifications?tab=${k}`} aria-current={tab === k ? "page" : undefined} className={`check !text-xs ${tab === k ? "!bg-ink !text-sand" : ""}`}>
              {label}{count(k) > 0 ? ` · ${count(k)} new` : ""}
            </Link>
          ))}
        </nav>
      )}
      {vendor && tab !== "all" && <p className="mt-3 text-sm text-mute">{tab === "vendor" ? "Updates about your dukaan: new queries, messages from customers and reviews." : "Updates for you as a customer: vendor replies and event reminders."}</p>}
      <ul className="mt-6 grid gap-2">
        {shown.length === 0 && <li className="card grid place-items-center gap-2 p-10 text-mute"><Bell /> You&apos;re all caught up.</li>}
        {shown.map(({ n, who }) => (
          <li key={n.id}>
            <Link href={n.href ?? "#"} className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${n.readAt ? "border-ink/10 bg-white" : "border-ink bg-blue-soft"}`}>
              <span className={`mt-1.5 h-2.5 w-2.5 flex-none rounded-full ${n.readAt ? "bg-transparent" : "bg-red"}`} />
              <span className="min-w-0 flex-1">
                <b className="block">{n.title}</b>
                {n.body && <span className="block truncate text-sm text-mute">{n.body}</span>}
              </span>
              <span className="flex flex-none flex-col items-end gap-1">
                {(vendor || who === "admin") && <span className={`chip ${CHIP[who][1]}`}>{CHIP[who][0]}</span>}
                <span className="text-xs text-mute">{timeAgo(n.createdAt)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-mute">In-app notifications are on. Push and email alerts are coming soon. You can turn reminders off in <Link className="underline" href="/account">settings</Link>.</p>
    </div>
  );
}
