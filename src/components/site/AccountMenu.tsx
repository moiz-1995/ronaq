"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { switchMode } from "@/app/actions/mode";

export function AccountMenu({ name, isSeller, isStaff, vendorMode }: { name: string; isSeller: boolean; isStaff: boolean; vendorMode: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const inVendorMode = isSeller && (vendorMode || path.startsWith("/seller"));
  const [switching, start] = useTransition();
  const switchBtn = "mb-1 flex w-full items-center gap-2 rounded-lg bg-blue px-3 py-2 text-sm font-bold text-sand hover:bg-ink";
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="grid h-9 w-9 place-items-center rounded-full border-2 border-sand bg-red font-display text-xs text-sand"
      >
        {initials || "?"}
      </button>
      {open && (
        <div role="menu" className="card card-shadow absolute right-0 top-12 z-50 w-56 overflow-hidden p-1.5 text-ink">
          <p className="px-3 py-2 text-xs text-mute">Signed in as <b className="text-ink">{name}</b>{inVendorMode ? " · dukaandaar" : ""}</p>
          {isSeller ? (
            <button role="menuitem" type="button" disabled={switching} className={switchBtn} onClick={() => start(async () => { await switchMode(inVendorMode ? "customer" : "vendor", inVendorMode ? "/dashboard" : "/seller"); setOpen(false); })}>
              <ArrowLeftRight size={15} /> {inVendorMode ? "Switch to khareedar" : "Switch to dukaandaar"}
            </button>
          ) : (
            <Link role="menuitem" href="/seller/onboarding" onClick={() => setOpen(false)} className={switchBtn}><ArrowLeftRight size={15} /> Switch to dukaandaar</Link>
          )}
          {!isSeller && !inVendorMode && <p className="-mt-0.5 mb-1 px-3 text-[11px] text-mute">Isi account se apni dukaan kholein.</p>}
          {[
            ...(inVendorMode ? [["/seller", "Meri Dukaan"], ["/seller/inquiries", "Queries"]] : [["/dashboard", "Dashboard"], ["/inbox", "Messages"]]),
            ["/account", "Account & settings"],
            ...(isStaff ? [["/admin", "Admin console"]] : []),
          ].map(([href, label]) => (
            <Link key={href} role="menuitem" href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-sand">
              {label}
            </Link>
          ))}
          <form action={signOutAction}>
            <button role="menuitem" className="w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-red hover:bg-red-soft">Sign out</button>
          </form>
        </div>
      )}
    </div>
  );
}
