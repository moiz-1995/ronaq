"use client";
import { useActionState, useState } from "react";
import { Flag, X } from "lucide-react";
import { submitReport } from "@/app/actions/market";
import { FormMessage, Submit } from "@/components/ui/form";

const REASONS = ["Misleading or fake", "Inappropriate content", "Abusive or harassing", "Spam or scam", "Copied someone else's work", "Something else"];

export function ReportButton({ targetType, targetId, label = "Report" }: { targetType: "vendor" | "review" | "message" | "portfolio" | "user"; targetId: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(submitReport, undefined);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs font-bold text-mute underline-offset-2 hover:text-red hover:underline">
        <Flag size={13} /> {label}
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={`rep-${targetId}`} className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-4" onClick={() => setOpen(false)}>
          <div className="card card-shadow w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <h2 id={`rep-${targetId}`} className="h-display text-xl">Report this {targetType}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1 hover:bg-sand"><X size={18} /></button>
            </div>
            {state?.message ? (
              <div className="mt-4 grid gap-4"><FormMessage state={state} /><button className="btn" onClick={() => setOpen(false)}>Close</button></div>
            ) : (
              <form action={action} className="mt-4 grid gap-4">
                <input type="hidden" name="targetType" value={targetType} />
                <input type="hidden" name="targetId" value={targetId} />
                <fieldset className="grid gap-2">
                  <legend className="label mb-1">What&apos;s wrong?</legend>
                  {REASONS.map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm"><input type="radio" name="reason" value={r} required className="accent-red" /> {r}</label>
                  ))}
                </fieldset>
                <div className="field">
                  <label className="label" htmlFor={`rep-d-${targetId}`}>Details (optional)</label>
                  <textarea className="input" id={`rep-d-${targetId}`} name="details" maxLength={1000} />
                </div>
                <FormMessage state={state} />
                <Submit pendingText="Sending…">Send report</Submit>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
