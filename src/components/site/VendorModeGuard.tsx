"use client";
import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { customerPageName } from "@/lib/mode";
import { switchMode } from "@/app/actions/mode";

/** In vendor view, following a link to a customer page asks before switching views. */
export function VendorModeGuard({ isSeller, vendorMode }: { isSeller: boolean; vendorMode: boolean }) {
  const path = usePathname();
  const active = isSeller && (vendorMode || path.startsWith("/seller"));
  const [target, setTarget] = useState<{ href: string; name: string } | null>(null);
  const [busy, start] = useTransition();
  useEffect(() => {
    if (!active) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href);
      const name = url.origin === location.origin ? customerPageName(url.pathname) : null;
      if (!name) return;
      e.preventDefault();
      e.stopPropagation();
      setTarget({ href: url.pathname + url.search, name });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active]);
  return (
    <ConfirmDialog
      open={!!target}
      title="Switch to customer?"
      confirmLabel="Yes, switch to customer"
      cancelLabel="Stay as vendor"
      busy={busy}
      onClose={() => setTarget(null)}
      onConfirm={() => target && start(async () => { await switchMode("customer", target.href); setTarget(null); })}
    >
      You&apos;re using Ronaq as a vendor. To open {target?.name ?? "this page"}, we&apos;ll switch you to your customer view. You can switch back any time from your profile menu.
    </ConfirmDialog>
  );
}
