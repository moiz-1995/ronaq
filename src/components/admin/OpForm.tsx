"use client";
import { useActionState, useState } from "react";
import { FormMessage, Submit } from "@/components/ui/form";

type Action = (prev: unknown, form: FormData) => Promise<{ error?: string; message?: string; ok?: boolean } | undefined>;

/** A one-button admin action, optionally asking for a reason first (kept in the audit log). */
export function OpForm({ action, hidden, label, reason, reasonName = "reason", className = "btn btn-sm", confirm }: {
  action: Action; hidden: Record<string, string>; label: string; reason?: string; reasonName?: string; className?: string; confirm?: boolean;
}) {
  const [state, run] = useActionState(action, undefined);
  const [open, setOpen] = useState(false);
  const needsStep = !!reason || confirm;
  if (needsStep && !open) return <div className="grid gap-1"><button type="button" className={className} onClick={() => setOpen(true)}>{label}</button>{state?.message && <FormMessage state={state} />}</div>;
  return (
    <form action={run} className="grid gap-2">
      {Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {reason && <textarea name={reasonName} className="input !min-h-16 text-sm" placeholder={reason} required aria-label={reason} />}
      <div className="flex gap-2">
        <Submit className={className} pendingText="Working…">{needsStep ? `Confirm: ${label.toLowerCase()}` : label}</Submit>
        {needsStep && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>Cancel</button>}
      </div>
      <FormMessage state={state} />
    </form>
  );
}
