"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarHeart, CalendarDays, MessageCircle, Heart } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: CalendarHeart },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/inbox", label: "Messages", icon: MessageCircle },
  { href: "/shortlist", label: "Shortlist", icon: Heart },
];

export function PlannerNav() {
  const path = usePathname();
  return (
    <nav aria-label="Planner" className="-mx-1 flex gap-1 overflow-x-auto px-1">
      {LINKS.map(({ href, label, icon: I }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`flex flex-none items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold ${active ? "bg-ink text-sand" : "hover:bg-white"}`}>
            <I size={16} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
