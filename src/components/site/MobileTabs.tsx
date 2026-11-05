"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarHeart, Heart, User } from "lucide-react";

/** §15: persistent navigation on phones — Dashboard, Marketplace, Events, Shortlist, Account. */
export function MobileTabs({ signedIn }: { signedIn: boolean }) {
  const path = usePathname();
  const tabs = [
    { href: signedIn ? "/dashboard" : "/", label: signedIn ? "Dashboard" : "Home", icon: Home },
    { href: "/marketplace", label: "Marketplace", icon: Search },
    { href: signedIn ? "/events" : "/plan", label: "Events", icon: CalendarHeart },
    { href: "/shortlist", label: "Shortlist", icon: Heart },
    { href: signedIn ? "/account" : "/login", label: "Account", icon: User },
  ];
  if (path.startsWith("/admin")) return null;
  return (
    <nav
      aria-label="Tabs"
      className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-ink bg-paper pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      style={{ paddingLeft: "env(safe-area-inset-left,0px)", paddingRight: "env(safe-area-inset-right,0px)" }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: I }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <li key={label}>
              <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold ${active ? "text-red" : "text-ink"}`} aria-current={active ? "page" : undefined}>
                <span className={`grid h-8 w-12 place-items-center rounded-full ${active ? "bg-red-soft" : ""}`}><I size={20} strokeWidth={active ? 2.6 : 2} /></span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
