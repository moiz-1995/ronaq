import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { ReviewForm } from "./ReviewForm";

export const metadata = { title: "Write a review" };

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireUser(`/v/${slug}/review`);
  const v = await db.query.vendors.findFirst({ where: eq(s.vendors.slug, slug) });
  if (!v) notFound();
  const policy = await getSetting("reviewPolicy");
  return (
    <div className="wrap max-w-2xl py-10">
      <Link href={`/v/${v.slug}`} className="text-sm font-bold text-blue underline">← Back to {v.name}</Link>
      <h1 className="h-display mt-4 text-4xl">Review {v.name}</h1>
      <p className="mt-2 text-mute">Honest reviews help other families. Write about what you experienced, not rumours.</p>
      <ReviewForm vendorId={v.id} needsEvidence={policy.basis === "admin_evidence"} premoderated={policy.premoderate || policy.basis === "admin_evidence"} />
    </div>
  );
}
