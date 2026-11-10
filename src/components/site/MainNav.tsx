"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

/** Top menu. A soft pill slides to whichever link you point at, and rests on the page you're on. */
export function MainNav({ signedIn, isSeller, vendorMode }: { signedIn: boolean; isSeller: boolean; vendorMode: boolean }) {
  const path = usePathname();
  const [hover, setHover] = useState<string | null>(null);
  const links: [string, string][] = isSeller && (vendorMode || path.startsWith("/seller"))
    ? [["/seller", "My Dukaan"], ["/seller/inquiries", "Queries"], ["/seller/services", "Services"], ["/marketplace", "Marketplace"]]
    : [
        ["/marketplace", "Marketplace"],
        [signedIn ? "/dashboard" : "/plan", "Plan an event"],
        ...(signedIn ? ([["/events", "Events"], ["/shortlist", "Shortlist"]] as [string, string][]) : ([["/sell", "Dukaandaar"]] as [string, string][])),
      ];
  const current = links.find(([href]) => (href === "/seller" ? path === href : path === href || path.startsWith(`${href}/`)))?.[0] ?? null;
  const pill = hover ?? current;
  return (
    <nav className="hidden items-center gap-1 text-sm font-bold md:flex" aria-label="Main" onMouseLeave={() => setHover(null)}>
      {links.map(([href, label]) => (
        <Link key={href} href={href} aria-current={current === href ? "page" : undefined} className="relative rounded-lg px-3 py-2" onMouseEnter={() => setHover(href)} onFocus={() => setHover(href)} onBlur={() => setHover(null)}>
          {pill === href && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-white/15" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
