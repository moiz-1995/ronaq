"use client";
import { useState } from "react";
import { GUEST_RANGES } from "@/lib/domain";

/** Guest count as a range dropdown, or an exact number if you prefer. Submits `guestCount`. */
export function GuestPicker({ defaultValue, id = "guestCount", label = "Guests" }: { defaultValue?: number | null; id?: string; label?: string }) {
  const isRange = !defaultValue || GUEST_RANGES.some((g) => g.max === defaultValue);
  const [mode, setMode] = useState<"range" | "exact">(isRange ? "range" : "exact");
  const [range, setRange] = useState(isRange && defaultValue ? String(defaultValue) : "");
  const [exact, setExact] = useState(!isRange && defaultValue ? String(defaultValue) : "");
  const value = mode === "range" ? range : exact.replace(/[^\d]/g, "");
  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <input type="hidden" name="guestCount" value={value} />
      {mode === "range" ? (
        <select id={id} className="input" value={range} onChange={(e) => (e.target.value === "exact" ? setMode("exact") : setRange(e.target.value))}>
          <option value="">Not sure yet</option>
          {GUEST_RANGES.map((g) => <option key={g.max} value={g.max}>{g.label} guests</option>)}
          <option value="exact">Enter an exact number…</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input id={id} className="input" inputMode="numeric" placeholder="e.g. 275" value={exact} onChange={(e) => setExact(e.target.value)} autoFocus />
          <button type="button" className="btn btn-sm flex-none" onClick={() => setMode("range")}>Use ranges</button>
        </div>
      )}
    </div>
  );
}
