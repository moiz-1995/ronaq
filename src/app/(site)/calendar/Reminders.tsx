"use client";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addReminder, deleteReminder, toggleReminder } from "@/app/actions/planner";
import { FormMessage, Submit } from "@/components/ui/form";
import { formatDate } from "@/lib/time";

export function ReminderToggle({ r }: { r: { id: string; title: string; dueDate: string; done: boolean } }) {
  const [pending, start] = useTransition();
  return (
    <li className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={r.done} disabled={pending} onChange={() => start(() => toggleReminder(r.id))} aria-label={`Mark ${r.title} done`} className="h-4 w-4 accent-green" />
      <span className={`flex-1 ${r.done ? "line-through opacity-50" : ""}`}>{r.title}</span>
      <span className="text-xs text-mute">{formatDate(r.dueDate, { day: "numeric", month: "short" })}</span>
      <button onClick={() => start(() => deleteReminder(r.id))} aria-label={`Delete ${r.title}`} className="rounded p-1 hover:bg-red-soft"><Trash2 size={13} /></button>
    </li>
  );
}

export function ReminderForm({ events }: { events: { id: string; name: string }[] }) {
  const [state, action] = useActionState(addReminder, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="dashed-top mt-4 grid gap-2 pt-4">
      <label className="label text-xs" htmlFor="rt">New reminder</label>
      <input id="rt" name="title" className="input" placeholder="e.g. Final headcount to caterer" required />
      <div className="grid grid-cols-2 gap-2">
        <input name="dueDate" type="date" className="input" required aria-label="Date" />
        <select name="eventId" className="input" aria-label="Event" defaultValue=""><option value="">No event</option>{events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
      </div>
      <FormMessage state={state} />
      <Submit className="btn btn-sm btn-blue">Add reminder</Submit>
    </form>
  );
}
