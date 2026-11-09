"use client";
import { Plus, Trash2 } from "lucide-react";
import { BLANK_REFERENCE, MAX_REFERENCES, type WorkReference } from "@/lib/references";

/** Hidden copies of the rows, so they submit with the form whichever step or section is showing. */
export function ReferenceFields({ value }: { value: WorkReference[] }) {
  return (
    <>
      {value.map((r, i) => (
        <span key={i} hidden>
          <input type="hidden" name="ref_title" value={r.title} />
          <input type="hidden" name="ref_client" value={r.client ?? ""} />
          <input type="hidden" name="ref_note" value={r.note ?? ""} />
          <input type="hidden" name="ref_link" value={r.link ?? ""} />
        </span>
      ))}
    </>
  );
}

export function ReferencesEditor({ value, onChange }: { value: WorkReference[]; onChange: (v: WorkReference[]) => void }) {
  const rows = value.length ? value : [BLANK_REFERENCE];
  const patch = (i: number, p: Partial<WorkReference>) => onChange(rows.map((r, k) => (k === i ? { ...r, ...p } : r)));
  return (
    <div className="grid gap-4">
      {rows.map((r, i) => (
        <div key={i} className="grid gap-3 rounded-2xl border-2 border-ink/15 p-4 sm:grid-cols-2">
          <div className="field"><label className="label text-xs" htmlFor={`ref-t-${i}`}>Event or project</label><input id={`ref-t-${i}`} className="input" value={r.title} maxLength={100} onChange={(e) => patch(i, { title: e.target.value })} placeholder="e.g. 300-guest barat at PC Rawalpindi" /></div>
          <div className="field"><label className="label text-xs" htmlFor={`ref-c-${i}`}>Client or reference (optional)</label><input id={`ref-c-${i}`} className="input" value={r.client ?? ""} maxLength={80} onChange={(e) => patch(i, { client: e.target.value })} placeholder="e.g. Khan family" /></div>
          <div className="field sm:col-span-2"><label className="label text-xs" htmlFor={`ref-n-${i}`}>What you did (optional)</label><input id={`ref-n-${i}`} className="input" value={r.note ?? ""} maxLength={300} onChange={(e) => patch(i, { note: e.target.value })} placeholder="e.g. Bridal and family mehndi for 40 guests" /></div>
          <div className="field sm:col-span-2"><label className="label text-xs" htmlFor={`ref-l-${i}`}>Link to see it (optional)</label><input id={`ref-l-${i}`} className="input" value={r.link ?? ""} inputMode="url" autoComplete="off" onChange={(e) => patch(i, { link: e.target.value })} placeholder="instagram.com/p/…" /></div>
          {rows.length > 1 && <button type="button" className="flex w-fit items-center gap-1.5 text-sm font-bold text-red underline sm:col-span-2" onClick={() => onChange(rows.filter((_, k) => k !== i))}><Trash2 size={14} /> Remove this one</button>}
        </div>
      ))}
      {rows.length < MAX_REFERENCES && <button type="button" className="btn btn-sm w-fit" onClick={() => onChange([...rows, BLANK_REFERENCE])}><Plus size={15} /> Add another</button>}
      <p className="hint">Only name a client if they&apos;re happy to be listed. Families will see this on your profile.</p>
    </div>
  );
}
