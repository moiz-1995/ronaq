"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { STATUS_HIDDEN_COOKIE } from "@/lib/mode";

const remember = (hidden: boolean) => {
  document.cookie = `${STATUS_HIDDEN_COOKIE}=${hidden ? "1" : ""}; path=/; max-age=${hidden ? 60 * 60 * 24 * 365 : 0}; samesite=lax`;
  window.dispatchEvent(new Event("ronaq:status-card"));
};

/** The small profile-status card beside Overview. The cross hides it; the choice is remembered on this device. */
export function StatusCard({ initiallyHidden, children }: { initiallyHidden: boolean; children: React.ReactNode }) {
  const [hidden, setHidden] = useState(initiallyHidden);
  if (hidden) return null;
  return (
    <section className="card relative bg-white p-5 lg:w-[340px]" aria-label="Profile status">
      <button type="button" onClick={() => { remember(true); setHidden(true); }} aria-label="Hide profile status" title="Hide" className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full hover:bg-sand"><X size={16} /></button>
      {children}
    </section>
  );
}

/** Brings the profile-status card back after it was hidden. */
export function ShowStatusButton({ initiallyHidden }: { initiallyHidden: boolean }) {
  const [hidden, setHidden] = useState(initiallyHidden);
  useEffect(() => {
    const on = () => setHidden(document.cookie.split("; ").some((c) => c === `${STATUS_HIDDEN_COOKIE}=1`));
    window.addEventListener("ronaq:status-card", on);
    return () => window.removeEventListener("ronaq:status-card", on);
  }, []);
  if (!hidden) return null;
  return <button type="button" onClick={() => { remember(false); window.location.reload(); }} className="text-sm font-bold text-blue underline">Show profile status</button>;
}
