import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { loadThreadFor, markThreadRead } from "@/lib/threads";
import { Thread } from "@/components/inbox/Thread";
import { track } from "@/lib/track";

export const metadata = { title: "Inquiry" };

export default async function SellerThread({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/seller/inquiries/${id}`);
  const t = await loadThreadFor(id, user.id, "vendor");
  if (!t || t.role !== "vendor") notFound();
  if (t.inq.status === "sent" && !t.inq.isTest) await track("inquiry_delivered", { userId: user.id });
  await markThreadRead(id, "vendor");
  const consumer = await db.query.users.findFirst({ where: eq(s.users.id, t.inq.consumerId) });
  return (
    <div className="wrap max-w-3xl py-8">
      <Link href="/seller/inquiries" className="text-sm font-bold text-blue underline">← All queries</Link>
      <div className="mt-4">
        <Thread inq={t.inq} role="vendor" title={t.inq.isTest ? "Test khareedar" : consumer?.name ?? "Khareedar"} subtitle="Customer ka number private rehta hai, unless they share it in the chat." />
      </div>
    </div>
  );
}
