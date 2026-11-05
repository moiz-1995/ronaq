import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireStaff } from "@/lib/auth";
import { moderateReview } from "@/app/actions/admin";
import { AdminHeader } from "@/components/admin/ui";
import { OpForm } from "@/components/admin/OpForm";
import { StatusChip } from "@/components/ui/badges";
import { timeAgo } from "@/lib/time";

export const metadata = { title: "Reviews" };

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  await requireStaff();
  const { f = "pending" } = await searchParams;
  const rows = await db.select({ r: s.reviews, author: s.users.name, vendor: s.vendors.name, slug: s.vendors.slug })
    .from(s.reviews).innerJoin(s.users, eq(s.users.id, s.reviews.authorId)).innerJoin(s.vendors, eq(s.vendors.id, s.reviews.vendorId))
    .orderBy(desc(s.reviews.createdAt));
  const shown = rows.filter(({ r }) => f === "all" || r.status === f);
  return (
    <>
      <AdminHeader title="Reviews" sub="Publish or hide reviews under the content policy. Every decision is logged. Never edit a review's text." />
      <div className="grid gap-4 p-4 sm:p-8">
        <nav className="flex flex-wrap gap-2">{["pending", "published", "hidden", "all"].map((k) => <Link key={k} href={`/admin/reviews?f=${k}`} className={`check !text-xs capitalize ${f === k ? "!bg-ink !text-sand" : ""}`}>{k} · {rows.filter(({ r }) => k === "all" || r.status === k).length}</Link>)}</nav>
        <ul className="grid gap-3">
          {shown.length === 0 && <li className="rounded-2xl border-2 border-dashed border-ink/20 p-8 text-center text-mute">Nothing here.</li>}
          {shown.map(({ r, author, vendor, slug }) => (
            <li key={r.id} className="grid gap-4 rounded-2xl border-2 border-ink/10 bg-white p-5 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="flex flex-wrap items-center gap-2"><StatusChip status={r.status} /><span className="text-sun">{"★".repeat(r.rating)}</span><span className="text-sm text-mute">{author} → <Link className="underline" href={`/v/${slug}`}>{vendor}</Link> · {timeAgo(r.createdAt)} · basis: {r.basis}</span></div>
                <p className="mt-2 whitespace-pre-wrap">{r.text ?? <i className="text-mute">No text</i>}</p>
                {r.moderationReason && <p className="mt-2 text-sm text-red">Moderation note: {r.moderationReason}</p>}
              </div>
              <div className="grid content-start gap-2">
                {r.status !== "published" && <OpForm action={moderateReview} hidden={{ id: r.id, status: "published" }} label="Publish" className="btn btn-sm btn-blue" />}
                {r.status !== "hidden" && <OpForm action={moderateReview} hidden={{ id: r.id, status: "hidden" }} label="Hide" reason="Which policy does it break?" className="btn btn-sm btn-red" />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
