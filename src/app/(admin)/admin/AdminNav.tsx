"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Store, Shapes, ListChecks, Flag, Images, Star, Users, ScrollText, Settings } from "lucide-react";

export function AdminNav({ role, counts }: { role: string; counts: { vendors: number; reports: number; reviews: number } }) {
  const path = usePathname();
  const admin = role === "admin";
  const links = [
    { href: "/admin", label: "Overview", icon: BarChart3, show: true },
    { href: "/admin/vendors", label: "Vendors", icon: Store, show: admin, n: counts.vendors },
    { href: "/admin/reports", label: "Reports", icon: Flag, show: true, n: counts.reports },
    { href: "/admin/reviews", label: "Reviews", icon: Star, show: true, n: counts.reviews },
    { href: "/admin/portfolio", label: "Portfolio", icon: Images, show: true },
    { href: "/admin/categories", label: "Categories", icon: Shapes, show: admin },
    { href: "/admin/templates", label: "Templates", icon: ListChecks, show: admin },
    { href: "/admin/users", label: "Users", icon: Users, show: admin },
    { href: "/admin/audit", label: "Audit log", icon: ScrollText, show: admin },
    { href: "/admin/settings", label: "Settings", icon: Settings, show: admin },
  ].filter((l) => l.show);
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:grid lg:overflow-visible">
      {links.map(({ href, label, icon: I, n }) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex flex-none items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold ${active ? "bg-sand text-ink" : "hover:bg-white/10"}`}>
            <I size={17} /> {label}
            {!!n && <span className="ml-auto rounded-full bg-red px-2 text-xs text-sand">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
