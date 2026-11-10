"use client";
import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { FLEXIBLE_HOURS, TIME_SLOTS, formatHours, parseHours } from "@/lib/hours";

export function WorkingHoursPicker({ value }: { value: string | null }) {
  const saved = parseHours(value);
  const [flexible, setFlexible] = useState(!!saved && "flexible" in saved);
  const [from, setFrom] = useState(saved && "from" in saved ? saved.from : "");
  const [to, setTo] = useState(saved && "to" in saved ? saved.to : "");
  const legacy = saved && "legacy" in saved ? saved.legacy : "";
  const result = flexible ? FLEXIBLE_HOURS : from && to ? formatHours(from, to) : !from && !to ? legacy : "";
  const incomplete = !flexible && !!from !== !!to;
  return (
    <fieldset className="grid gap-2 sm:col-span-2">
      <legend className="label mb-1">Kaam ke auqaat (Working hours)</legend>
      <input type="hidden" name="workingHours" value={result} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="field">
          <label className="label text-xs" htmlFor="wh-from">Kab se (From)</label>
          <Select id="wh-from" className="input" value={from} disabled={flexible} onChange={(e) => setFrom(e.target.value)}>
            <option value="">Time chunein…</option>
            {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div className="field">
          <label className="label text-xs" htmlFor="wh-to">Kab tak (To)</label>
          <Select id="wh-to" className="input" value={to} disabled={flexible} onChange={(e) => setTo(e.target.value)}>
            <option value="">Time chunein…</option>
            {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={flexible} onChange={(e) => setFlexible(e.target.checked)} className="h-4 w-4 accent-red" />
        Flexible hai, time fixed nahi
      </label>
      {incomplete && <p className="hint text-red">Dono time chunein (choose both times).</p>}
      {legacy && !flexible && !from && !to && <p className="hint">Abhi likha hai: {legacy}. Naya time chunein to yeh badal jayega.</p>}
    </fieldset>
  );
}
