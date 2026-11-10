import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireVendorPage } from "@/lib/seller";
import { formatDate, timeAgo } from "@/lib/time";
import { INQUIRY_STATUS_LABELS } from "@/lib/domain";
import { StatusChip } from "@/components/ui/badges";
import { TestQueryButton } from "../TestQueryButton";

export const metadata = { title: "Queries" };

export default async function SellerInquiries({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { vendor } = await requireVendorPage("/seller/inquiries");
  const { f = "all" } = await searchParams;
  const rows = await db.select({ i: s.inquiries, name: s.users.name }).from(s.inquiries).innerJoin(s.users, eq(s.users.id, s.inquiries.consumerId)).where(eq(s.inquiries.vendorId, vendor.id)).orderBy(desc(s.inquiries.lastMessageAt));
  const shown = rows.filter(({ i }) => f === "all" || (f === "unread" ? i.vendorUnread > 0 : f === "sent" ? i.status === "sent" || i.status === "delivered" : i.status === f));
  const last = shown.length ? await db.select().from(s.messages).where(inArray(s.messages.inquiryId, shown.map(({ i }) => i.id))).orderBy(desc(s.messages.createdAt)) : [];
  return (
    <div className="wrap max-w-4xl py-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="h-display text-3xl">Queries</h1><p className="mt-1 text-mute">Customers aap ko yahan message karte hain.</p></div><TestQueryButton /></div>
      <nav className="mt-4 flex flex-wrap gap-2" aria-label="Filter">
        {[["all", "All"], ["unread", "Unread"], ["sent", "New"], ["responded", "Replied"], ["closed", "Done"]].map(([k, l]) => (
          <Link key={k} href={`/seller/inquiries?f=${k}`} className={`check !text-xs ${f === k ? "!bg-ink !text-sand" : ""}`}>{l} · {rows.filter(({ i }) => k === "all" || (k === "unread" ? i.vendorUnread > 0 : k === "sent" ? i.status === "sent" || i.status === "delivered" : i.status === k)).length}</Link>
        ))}
      </nav>
      <ul data-stagger suppressHydrationWarning className="mt-6 grid gap-3">
        {shown.length === 0 && <li className="card p-8 text-center text-mute">No queries here yet. Dekhna hai kaise kaam karta hai? Send yourself a test query from the top.</li>}
        {shown.map(({ i, name }) => {
          const m = last.find((x) => x.inquiryId === i.id);
          return (
            <li key={i.id}>
              <Link href={`/seller/inquiries/${i.id}`} className={`card flex flex-wrap items-center gap-4 p-4 transition hover:-translate-y-0.5 ${i.vendorUnread ? "bg-blue-soft" : "bg-white"}`}>
                <div className="grid h-12 w-12 flex-none place-items-center rounded-full border-2 border-ink bg-sand font-display">{name[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{i.isTest ? "Test khareedar" : name} {i.isTest && <span className="chip bg-sun">TEST</span>} {i.shared?.eventDate && <span className="font-normal text-mute">· {formatDate(i.shared.eventDate)}</span>}</p>
                  <p className={`truncate text-sm ${i.vendorUnread ? "font-bold" : "text-mute"}`}>{m?.senderRole === "vendor" ? "You: " : ""}{m?.body}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusChip status={i.status} label={INQUIRY_STATUS_LABELS[i.status]} />
                  <span className="text-xs text-mute">{timeAgo(i.lastMessageAt)}</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-xs text-mute">Tip: jaldi reply karne wale vendors zyada choose hote hain.</p>
    </div>
  );
}
