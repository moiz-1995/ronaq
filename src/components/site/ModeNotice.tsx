"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SWITCHED_COOKIE, type AccountMode } from "@/lib/mode";

/** After switching between dukaandaar and khareedar from the profile menu, says so once in a popup. */
export function ModeNotice() {
  const path = usePathname();
  const [mode, setMode] = useState<AccountMode | null>(null);
  useEffect(() => {
    const hit = document.cookie.split("; ").find((c) => c.startsWith(`${SWITCHED_COOKIE}=`));
    if (!hit) return;
    document.cookie = `${SWITCHED_COOKIE}=; path=/; max-age=0`;
    const v = hit.split("=")[1];
    if (v === "vendor" || v === "customer") setMode(v);
  }, [path]);
  return (
    <ConfirmDialog open={!!mode} title={mode === "vendor" ? "You're now in Dukaandaar mode" : "You're now in Khareedar mode"} cancelLabel="Got it" onClose={() => setMode(null)}>
      {mode === "vendor"
        ? "Ab aap apni dukaan manage kar rahe hain: queries, services, photos aur profile. Notifications bhi sirf dukaan ki nazar aayengi. Customer ki tarah browse karna ho to profile menu se Switch to khareedar dabayein."
        : "Ab aap customer ki tarah browse kar rahe hain: marketplace, events, shortlist aur apne messages. Your dukaan stays live. Wapas dukaan par jana ho to profile menu se Switch to dukaandaar dabayein."}
    </ConfirmDialog>
  );
}
