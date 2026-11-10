import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { loadThreadFor, markThreadRead } from "@/lib/threads";
import { Thread } from "@/components/inbox/Thread";

export const metadata = { title: "Conversation" };

export default async function ThreadPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { id } = await params;
  const { sent } = await searchParams;
  const user = await requireUser(`/inbox/${id}`);
  const t = await loadThreadFor(id, user.id, "consumer");
  if (!t || t.role !== "consumer") notFound();
  await markThreadRead(id, "consumer");
  return (
    <div className="wrap max-w-3xl py-8">
      <Link href="/inbox" className="text-sm font-bold text-blue underline">← All messages</Link>
      {sent && <p role="status" className="mt-4 rounded-xl border-2 border-green bg-[#e5f6ea] p-3 text-sm font-medium text-green">Inquiry sent. We&apos;ll notify you when {t.vendor.name} replies.</p>}
      <div className="mt-4">
        <Thread inq={t.inq} role="consumer" title={<Link href={`/v/${t.vendor.slug}`} className="hover:underline">{t.vendor.name}</Link>} subtitle="Vendor" />
      </div>
    </div>
  );
}
