"use client";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { useActionState, useState } from "react";
import { saveEvent } from "@/app/actions/planner";
import { FormMessage, Submit } from "@/components/ui/form";
import { GuestPicker } from "./GuestPicker";

type Ev = { id: string; name: string; type: string; label: string | null; date: string | null; time: string | null; location: string | null; guestCount: number | null; budget: number | null; description: string | null; isPrimary: boolean };

export function EventForm({ ev, types, templates }: { ev?: Ev; types: { value: string; label: string; heading: string }[]; templates?: { slug: string; name: string }[] }) {
  const [state, action] = useActionState(saveEvent, undefined);
  const [label, setLabel] = useState(ev?.label ?? "");
  return (
    <form action={action} className="card card-shadow grid gap-5 bg-white p-5 sm:p-7">
      {ev && <input type="hidden" name="id" value={ev.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field sm:col-span-2"><label className="label" htmlFor="name">Event name</label><input id="name" name="name" className="input" required defaultValue={ev?.name} placeholder="e.g. Hamza's 5th birthday" /></div>
        <div className="field">
          <label className="label" htmlFor="type">Type</label>
          <Select id="type" name="type" className="input" defaultValue={ev?.type ?? "wedding"} onChange={(e) => !label && setLabel(types.find((t) => t.value === e.target.value)?.heading ?? "")}>
            {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </div>
        <div className="field"><label className="label" htmlFor="label">Heading word</label><input id="label" name="label" className="input" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={28} placeholder="Shaadi, Mehndi, Birthday…" /><p className="hint">Shown as “{label ? `${label} ki Ronaq` : "Ap ki Ronaq"}” when this is your primary event.</p></div>
        <div className="field"><label className="label" htmlFor="date">Date</label><input id="date" name="date" type="date" className="input" defaultValue={ev?.date ?? ""} /></div>
        <div className="field"><label className="label" htmlFor="location">Location</label><input id="location" name="location" className="input" defaultValue={ev?.location ?? ""} /></div>
        <GuestPicker defaultValue={ev?.guestCount} />
        <div className="field"><label className="label" htmlFor="budget">Budget (PKR)</label><input id="budget" name="budget" inputMode="numeric" className="input" defaultValue={ev?.budget ?? ""} /></div>
        {templates && !ev && (
          <div className="field">
            <label className="label" htmlFor="template">Start checklist from</label>
            <Select id="template" name="template" className="input" defaultValue="">
              <option value="">Empty checklist</option>
              {templates.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
            </Select>
          </div>
        )}
        <div className="field sm:col-span-2"><label className="label" htmlFor="description">Notes</label><textarea id="description" name="description" className="input" defaultValue={ev?.description ?? ""} /></div>
        <div className="sm:col-span-2">
          <label className={`flex items-center gap-2 text-sm font-medium ${ev?.isPrimary ? "opacity-70" : ""}`}>
            <input type="checkbox" name="makePrimary" defaultChecked={ev?.isPrimary} disabled={ev?.isPrimary} className="h-4 w-4 accent-red" /> Make this my primary event (it leads the dashboard and the countdown)
          </label>
          {ev?.isPrimary && <p className="hint ml-6">This is already your primary event. To change it, make a different event primary.</p>}
        </div>
      </div>
      <FormMessage state={state} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Submit>{ev ? "Save changes" : "Create event"}</Submit>
        <Link href={ev ? `/events/${ev.id}` : "/dashboard"} className="btn btn-sm">{ev ? "Cancel" : "Skip for now →"}</Link>
      </div>
    </form>
  );
}
