"use client";
import { useState } from "react";
import { BUDGET_STOPS, budgetLabel, nearestStop } from "@/lib/price";

const LAST = BUDGET_STOPS.length - 1;

/** Two-handled budget slider. Stops widen as prices grow so PKR 500 and PKR 5M both stay easy to reach. */
export function BudgetRange({ min, max }: { min: string | null; max: string | null }) {
  const [lo, setLo] = useState(() => (min ? Math.min(nearestStop(Number(min)), LAST - 1) : 0));
  const [hi, setHi] = useState(() => (max ? Math.max(nearestStop(Number(max)), 1) : LAST));
  const minValue = lo > 0 ? BUDGET_STOPS[lo] : null;
  const maxValue = hi < LAST ? BUDGET_STOPS[hi] : null;
  // keeps the coloured band lined up with the thumb centres (26px wide)
  const at = (i: number) => `calc(13px + (100% - 26px) * ${i / LAST})`;
  return (
    <div className="grid gap-1">
      <p className="font-display text-base text-red" aria-live="polite">{budgetLabel(minValue, maxValue)}</p>
      <div className="dual-range">
        <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full border-2 border-ink bg-white" />
        <div className="absolute top-1/2 h-2.5 -translate-y-1/2 border-y-2 border-ink bg-sun" style={{ left: at(lo), right: `calc(100% - ${at(hi)})` }} />
        <input type="range" aria-label="Minimum budget" aria-valuetext={minValue ? budgetLabel(minValue, null) : "No minimum"} min={0} max={LAST} value={lo} style={{ zIndex: lo >= LAST - 1 ? 3 : 2 }} onChange={(e) => setLo(Math.min(Number(e.target.value), hi - 1))} />
        <input type="range" aria-label="Maximum budget" aria-valuetext={maxValue ? budgetLabel(null, maxValue) : "No maximum"} min={0} max={LAST} value={hi} style={{ zIndex: 2 }} onChange={(e) => setHi(Math.max(Number(e.target.value), lo + 1))} />
      </div>
      <div className="flex justify-between text-xs font-bold text-mute"><span>Minimum</span><span>Maximum</span></div>
      {minValue != null && <input type="hidden" name="min" value={minValue} />}
      {maxValue != null && <input type="hidden" name="max" value={maxValue} />}
    </div>
  );
}
