"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";

type Toast = { message: string; href?: string; action?: string };
const EVENT = "ronaq:toast";

export function toast(t: Toast) {
  window.dispatchEvent(new CustomEvent<Toast>(EVENT, { detail: t }));
}

/** One toast at a time, above the phone tab bar, announced to screen readers. */
export function Toaster() {
  const [t, setT] = useState<Toast | null>(null);
  const [id, setId] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      setT((e as CustomEvent<Toast>).detail);
      setId((n) => n + 1);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setT(null), 3600);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom,0px))] z-[60] flex justify-center px-4 md:bottom-6">
      {t && (
        <div key={id} className="toast-in pointer-events-auto flex max-w-[520px] items-center gap-3 rounded-2xl border-[3px] border-ink bg-sun px-4 py-3 font-bold text-ink shadow-[4px_4px_0_var(--color-red)]">
          <Heart size={18} className="flex-none fill-red text-red" />
          <span>{t.message}</span>
          {t.href && <Link href={t.href} className="flex-none text-sm text-blue underline">{t.action ?? "View"}</Link>}
        </div>
      )}
    </div>
  );
}
