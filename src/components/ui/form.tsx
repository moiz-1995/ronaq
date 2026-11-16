"use client";
import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function Submit({ children, className = "btn btn-red", pendingText, name, value }: { children: React.ReactNode; className?: string; pendingText?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} className={className} disabled={pending} aria-busy={pending}>
      {pending ? <><Loader2 size={16} className="animate-spin" /> {pendingText ?? "Saving…"}</> : children}
    </button>
  );
}

export function FormMessage({ state }: { state?: { error?: string; message?: string } }) {
  if (state?.error) return <p role="alert" className="rounded-xl border-2 border-red bg-red-soft px-3 py-2 text-sm font-medium text-red">{state.error}</p>;
  if (state?.message) return <p role="status" className="rounded-xl border-2 border-green bg-[#e5f6ea] px-3 py-2 text-sm font-medium text-green">{state.message}</p>;
  return null;
}

/** Open the page an action pointed to, with a full page load (dependable where an in-page redirect was not). */
export function goTo(href?: string | null) {
  if (href) window.location.assign(href);
}

export function useGoTo(state?: { goTo?: string } | null) {
  useEffect(() => { if (state?.goTo) window.location.assign(state.goTo); }, [state]);
}
