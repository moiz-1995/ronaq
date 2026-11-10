"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const cls = "rounded-lg px-3 py-2 hover:bg-white/10";

export function MainNav({ signedIn, isSeller, vendorMode }: { signedIn: boolean; isSeller: boolean; vendorMode: boolean }) {
  const path = usePathname();
  if (isSeller && (vendorMode || path.startsWith("/seller"))) {
    return (
      <nav className="hidden items-center gap-1 text-sm font-bold md:flex" aria-label="Main">
        <Link className={cls} href="/seller">Meri Dukaan</Link>
        <Link className={cls} href="/seller/inquiries">Queries</Link>
        <Link className={cls} href="/seller/services">Services</Link>
        <Link className={cls} href="/marketplace">Marketplace</Link>
      </nav>
    );
  }
  return (
    <nav className="hidden items-center gap-1 text-sm font-bold md:flex" aria-label="Main">
      <Link className={cls} href="/marketplace">Marketplace</Link>
      <Link className={cls} href={signedIn ? "/dashboard" : "/plan"}>Plan an event</Link>
      {signedIn && <Link className={cls} href="/events">Events</Link>}
      {signedIn && <Link className={cls} href="/shortlist">Shortlist</Link>}
      {!signedIn && <Link className={cls} href="/sell">Dukaandaar</Link>}
    </nav>
  );
}
