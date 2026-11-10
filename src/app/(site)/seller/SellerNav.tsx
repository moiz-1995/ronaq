"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/seller", "Overview"],
  ["/seller/inquiries", "Queries"],
  ["/seller/profile", "Profile"],
  ["/seller/services", "Services"],
  ["/seller/portfolio", "Photos"],
  ["/seller/availability", "Availability"],
];

export function SellerNav() {
  const path = usePathname();
  return (
    <nav aria-label="Business" className="-mx-1 flex gap-1 overflow-x-auto px-1">
      {LINKS.map(([href, label]) => {
        const active = href === "/seller" ? path === "/seller" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex-none rounded-lg px-3 py-2 text-sm font-bold ${active ? "bg-ink text-sand" : "hover:bg-white"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
