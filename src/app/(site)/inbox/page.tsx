import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { timeAgo } from "@/lib/time";
import { INQUIRY_STATUS_LABELS } from "@/lib/domain";
import { StatusChip } from "@/components/ui/badges";
import { Picture } from "@/components/art/CraftArt";
import { getAllCategories } from "@/lib/queries";
import { GiftBox } from "@/components/three/Lazy";

export const metadata = { title: "Messages" };

export default async function InboxPage() {
  const user = await requireUser("/inbox");
  const rows = await db.select().from(s.inquiries).where(eq(s.inquiries.consumerId, user.id)).orderBy(desc(s.inquiries.lastMessageAt));
  const vendors = rows.length ? await db.select().from(s.vendors).where(inArray(s.vendors.id, rows.map((r) => r.vendorId))) : [];
  const lastMsgs = rows.length ? await db.select().from(s.messages).where(inArray(s.messages.inquiryId, rows.map((r) => r.id))).orderBy(desc(s.messages.createdAt)) : [];
  const cats = await getAllCategories();
  return (
    <div className="wrap max-w-3xl py-10">
      <p className="kicker">Messages</p>
      <h1 className="h-display mt-2 text-4xl">Your inquiries</h1>
      {!rows.length ? (
        <div className="card mt-8 grid place-items-center gap-3 p-10 text-center">
          <GiftBox className="h-40 w-40" />
          <h2 className="font-display text-xl">No conversations yet</h2>
          <p className="max-w-sm text-mute">When you message a vendor, the conversation appears here.</p>
          <Link href="/marketplace" className="btn btn-red">Find vendors</Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3">
          {rows.map((r) => {
            const v = vendors.find((x) => x.id === r.vendorId)!;
            const last = lastMsgs.find((m) => m.inquiryId === r.id);
            const cat = cats.find((c) => c.id === r.categoryId);
            return (
              <li key={r.id}>
                <Link href={`/inbox/${r.id}`} className={`card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] ${r.consumerUnread ? "bg-blue-soft" : "bg-white"}`}>
                  <div className="h-14 w-14 flex-none overflow-hidden rounded-xl border-2 border-ink"><Picture src={v.logoImage ?? v.coverImage} alt="" fallbackKind={cat?.art} seed={2} className="h-full w-full" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-bold">{v.name}</p>
                      <span className="flex-none text-xs text-mute">{timeAgo(r.lastMessageAt)}</span>
                    </div>
                    <p className={`truncate text-sm ${r.consumerUnread ? "font-bold" : "text-mute"}`}>{last?.senderRole === "consumer" ? "You: " : ""}{last?.body}</p>
                  </div>
                  <div className="flex flex-none flex-col items-end gap-1">
                    <StatusChip status={r.status} label={INQUIRY_STATUS_LABELS[r.status]} />
                    {r.consumerUnread > 0 && <span className="rounded-full bg-red px-2 text-xs font-bold text-sand">{r.consumerUnread} new</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
