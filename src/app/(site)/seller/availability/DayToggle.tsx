"use client";
import { useOptimistic, useTransition } from "react";
import { cycleAvailability } from "@/app/actions/seller";

const NEXT = { null: "limited", limited: "unavailable", unavailable: null } as const;

export function DayToggle({ date, status, inMonth, past }: { date: string; status: "limited" | "unavailable" | null; inMonth: boolean; past: boolean }) {
  const [opt, set] = useOptimistic(status);
  const [, start] = useTransition();
  const label = opt === "unavailable" ? "fully booked" : opt === "limited" ? "limited" : "open";
  return (
    <button
      type="button"
      disabled={past}
      aria-label={`${date}: ${label}`}
      onClick={() => start(async () => { set(NEXT[String(opt) as keyof typeof NEXT]); await cycleAvailability(date); })}
      className={`aspect-square rounded-xl border-2 text-sm font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 ${
        opt === "unavailable" ? "border-ink bg-ink text-sand" : opt === "limited" ? "border-ink bg-sun" : "border-ink/10 bg-white hover:border-ink"
      } ${inMonth ? "" : "opacity-40"}`}
    >
      {Number(date.slice(8))}
    </button>
  );
}
