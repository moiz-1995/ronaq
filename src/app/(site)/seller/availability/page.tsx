import Link from "next/link";
import { and, eq, gte, lte } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireVendorPage } from "@/lib/seller";
import { formatDate, monthGrid, todayPKT } from "@/lib/time";
import { DayToggle } from "./DayToggle";

export const metadata = { title: "Kab free hain" };

export default async function SellerAvailability({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { vendor } = await requireVendorPage("/seller/availability");
  const { m } = await searchParams;
  const today = todayPKT();
  const [y, mo] = (m && /^\d{4}-\d{2}$/.test(m) ? m : today.slice(0, 7)).split("-").map(Number);
  const grid = monthGrid(y, mo);
  const rows = await db.select().from(s.availability).where(and(eq(s.availability.vendorId, vendor.id), gte(s.availability.date, grid[0][0]), lte(s.availability.date, grid.at(-1)!.at(-1)!)));
  const map = Object.fromEntries(rows.map((r) => [r.date, r.status]));
  const prev = mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, "0")}`;
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
  return (
    <div className="wrap max-w-3xl py-8">
      <h1 className="h-display text-3xl">Kab free hain?</h1>
      <p className="mt-1 text-mute">Din par ek baar dabayein to <b>limited</b>, dobara dabayein to <b>poora booked</b>, teesri baar saaf. Khareedar ise dekh kar aap se confirm karte hain.</p>
      <section className="card card-shadow mt-6 overflow-hidden bg-white">
        <header className="flex items-center justify-between bg-ink p-3 text-sand">
          <Link href={`/seller/availability?m=${prev}`} aria-label="Previous month" className="rounded-lg p-2 hover:bg-white/10"><ChevronLeft /></Link>
          <h2 className="font-display text-lg">{formatDate(`${y}-${String(mo).padStart(2, "0")}-01`, { month: "long", year: "numeric" })}</h2>
          <Link href={`/seller/availability?m=${next}`} aria-label="Next month" className="rounded-lg p-2 hover:bg-white/10"><ChevronRight /></Link>
        </header>
        <div className="grid grid-cols-7 text-center text-xs font-bold text-mute">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-2">{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1.5 p-2">
          {grid.flat().map((d) => (
            <DayToggle key={d} date={d} status={(map[d] as "limited" | "unavailable" | undefined) ?? null} inMonth={Number(d.slice(5, 7)) === mo} past={d < today} />
          ))}
        </div>
        <p className="flex flex-wrap gap-4 p-3 text-xs"><span className="rounded bg-white px-2 ring-2 ring-ink/10">Free</span><span className="rounded bg-sun px-2">Limited</span><span className="rounded bg-ink px-2 text-sand">Poora booked</span></p>
      </section>
    </div>
  );
}
