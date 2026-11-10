"use client";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Lock } from "lucide-react";
import { createInquiry } from "@/app/actions/inquiries";
import { FormMessage, Submit } from "@/components/ui/form";
import { formatDate } from "@/lib/time";
import { guestLabel } from "@/lib/domain";

type Ev = { id: string; name: string; date: string | null; location: string | null; guestCount: number | null; budget: number | null };

export function InquiryForm({ vendorId, vendorName, events, defaultEventId, checklistItemId, defaultService, defaultBudget }: {
  vendorId: string; vendorName: string; events: Ev[]; defaultEventId?: string; checklistItemId?: string; defaultService: string; defaultBudget: number | null;
}) {
  const [state, action] = useActionState(createInquiry, undefined);
  const [eventId, setEventId] = useState(defaultEventId ?? "");
  const ev = events.find((e) => e.id === eventId);
  const firstName = vendorName.split(" ")[0];
  return (
    <form action={action} className="card card-shadow mt-6 grid gap-6 bg-white p-5 sm:p-7">
      <input type="hidden" name="vendorId" value={vendorId} />
      {checklistItemId && <input type="hidden" name="checklistItemId" value={checklistItemId} />}

      <div className="field">
        <label className="label" htmlFor="eventId">Which event is this for?</label>
        <Select id="eventId" name="eventId" className="input" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">Not linked to an event</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}{e.date ? ` · ${formatDate(e.date)}` : ""}</option>)}
        </Select>
        {!events.length && <p className="hint">Tip: <Link className="underline" href="/events/new">create an event</Link> to share your date and guest count in one tap.</p>}
      </div>

      <fieldset className="grid gap-2">
        <legend className="label mb-1 flex items-center gap-2"><Lock size={15} /> What to share with {firstName}</legend>
        <p className="hint -mt-1 mb-1">Only the details you tick are sent. Your phone number and email stay private.</p>
        {ev ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <Share name="name" label={`Event name: ${ev.name}`} />
            {ev.date && <Share name="date" label={`Date: ${formatDate(ev.date)}`} />}
            {ev.location && <Share name="location" label={`Location: ${ev.location}`} />}
            {ev.guestCount && <Share name="guests" label={`Guests: ${guestLabel(ev.guestCount)?.replace(" guests", "")}`} />}
          </div>
        ) : <p className="text-sm text-mute">Choose an event above to share its date, place and guest count.</p>}
        <div className="mt-2 grid items-end gap-2 sm:grid-cols-[auto_1fr]">
          <Share name="budget" label="My budget for this service" defaultChecked={!!defaultBudget} />
          <input name="budget" inputMode="numeric" className="input" placeholder="PKR e.g. 50,000" defaultValue={defaultBudget ?? ev?.budget ?? ""} aria-label="Budget in PKR" />
        </div>
      </fieldset>

      <div className="field">
        <label className="label" htmlFor="service">Service you need</label>
        <input id="service" name="service" className="input" defaultValue={defaultService} maxLength={120} placeholder="e.g. Bridal mehndi + 6 family members" />
      </div>

      <div className="field">
        <label className="label" htmlFor="message">Message</label>
        <textarea id="message" name="message" className="input" required minLength={10} maxLength={2000} defaultValue={`Assalam o alaikum! I'm interested in your services. Are you available, and what would it cost?`} />
      </div>

      <FormMessage state={state} />
      <div className="flex flex-wrap items-center gap-3">
        <Submit pendingText="Sending…">Send inquiry</Submit>
        <p className="text-xs text-mute">An inquiry isn&apos;t a booking. You and {firstName} agree price and dates directly.</p>
      </div>
    </form>
  );
}

function Share({ name, label, defaultChecked = true }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border-2 border-ink/15 px-3 py-2 text-sm has-[:checked]:border-blue has-[:checked]:bg-blue-soft">
      <input type="checkbox" name={`share_${name}`} defaultChecked={defaultChecked} className="h-4 w-4 accent-blue" /> {label}
    </label>
  );
}
