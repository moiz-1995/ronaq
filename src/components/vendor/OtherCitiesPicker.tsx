"use client";
import { useState } from "react";

type City = { id: string; name: string };

/** Hidden copies so the choice submits with the form whichever step or section is showing. */
export function OtherCitiesFields({ ids, other }: { ids: string[]; other: string }) {
  return (
    <>
      {ids.map((id) => <input key={id} type="hidden" name="extraCityIds" value={id} />)}
      <input type="hidden" name="otherCities" value={other} />
    </>
  );
}

/** For vendors who work in more than one city: tick the extra cities, or choose Other and type them. */
export function OtherCitiesPicker({ cities, mainCityId, ids, other, onChange, className = "" }: { cities: City[]; mainCityId: string; ids: string[]; other: string; onChange: (v: { ids: string[]; other: string }) => void; className?: string }) {
  const [otherOpen, setOtherOpen] = useState(!!other);
  const toggle = (id: string) => onChange({ ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id], other });
  return (
    <fieldset className={`grid gap-2 ${className}`}>
      <legend className="label mb-1">Other cities you serve (optional)</legend>
      <p className="hint -mt-1">Aik se zyada sheher mein kaam karte hain? Choose all that apply.</p>
      <div className="flex flex-wrap gap-2">
        {cities.filter((c) => c.id !== mainCityId).map((c) => (
          <button type="button" key={c.id} aria-pressed={ids.includes(c.id)} onClick={() => toggle(c.id)} className={`check !text-xs ${ids.includes(c.id) ? "!bg-ink !text-sand" : ""}`}>{c.name}</button>
        ))}
        <button type="button" aria-pressed={otherOpen} aria-expanded={otherOpen} onClick={() => { if (otherOpen) onChange({ ids, other: "" }); setOtherOpen(!otherOpen); }} className={`check !text-xs ${otherOpen ? "!bg-ink !text-sand" : ""}`}>Other</button>
      </div>
      {otherOpen && (
        <div className="field max-w-md">
          <label className="label text-xs" htmlFor="other-cities">Which city or cities?</label>
          <input id="other-cities" className="input" value={other} maxLength={120} onChange={(e) => onChange({ ids, other: e.target.value })} placeholder="e.g. Gujranwala, Murree" />
        </div>
      )}
    </fieldset>
  );
}
