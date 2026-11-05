import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { getUser } from "@/lib/auth";
import { hydrateVendorCards } from "@/lib/queries";
import { VendorCard } from "@/components/vendor/VendorCard";
import { GiftBox } from "@/components/three/Lazy";

export const metadata = { title: "Shortlist" };

export default async function ShortlistPage() {
  const user = await getUser();
  if (!user) {
    return (
      <div className="wrap grid place-items-center py-16 text-center">
        <GiftBox className="h-44 w-44" />
        <h1 className="h-display mt-4 text-3xl">Save vendors you like</h1>
        <p className="mt-2 max-w-md text-mute">Join free to keep a shortlist, compare vendors and link them to your event checklist.</p>
        <div className="mt-5 flex gap-2"><Link href="/signup?next=/shortlist" className="btn btn-red">Join free</Link><Link href="/login?next=/shortlist" className="btn">Sign in</Link></div>
      </div>
    );
  }
  const rows = await db.select().from(s.shortlist).where(eq(s.shortlist.userId, user.id)).orderBy(desc(s.shortlist.createdAt));
  const cards = await hydrateVendorCards(rows.map((r) => r.vendorId));
  const byCat = new Map<string, typeof cards>();
  for (const c of cards) {
    const k = c.category?.name ?? "Other";
    byCat.set(k, [...(byCat.get(k) ?? []), c]);
  }
  return (
    <div className="wrap py-10">
      <p className="kicker">Shortlist</p>
      <h1 className="h-display mt-2 text-4xl">Saved vendors</h1>
      {cards.length === 0 ? (
        <div className="card mt-8 grid place-items-center gap-3 p-10 text-center">
          <GiftBox className="h-40 w-40" />
          <p className="text-mute">Nothing saved yet. Tap the heart on any vendor.</p>
          <Link href="/marketplace" className="btn btn-red">Browse the marketplace</Link>
        </div>
      ) : (
        [...byCat.entries()].map(([cat, list]) => (
          <section key={cat} className="mt-10">
            <h2 className="font-display text-xl">{cat} <span className="font-sans text-base font-normal text-mute">· {list.length}</span></h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {list.map((d, i) => <VendorCard key={d.vendor.id} data={d} saved seed={i} />)}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
