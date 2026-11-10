"use client";
import { useActionState, useState } from "react";
import { createResetLink } from "@/app/actions/admin";

/** For people who forgot their password: the link is shown once, to send them on WhatsApp or by email. */
export function ResetLinkButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(createResetLink, undefined);
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-1 grid gap-1">
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <button className="btn btn-sm" disabled={pending}>{pending ? "Creating…" : "Password reset link"}</button>
      </form>
      {state?.error && <p className="text-xs text-red">{state.error}</p>}
      {state?.link && (
        <div className="grid gap-1">
          <input readOnly value={state.link} className="input !min-h-9 !py-1 text-xs" aria-label="Password reset link" onFocus={(e) => e.target.select()} />
          <button type="button" className="text-left text-xs font-bold text-blue underline" onClick={() => { void navigator.clipboard.writeText(state.link!); setCopied(true); }}>{copied ? "Copied" : "Copy link"}</button>
          <p className="text-[11px] text-mute">Works once, for 24 hours. Send it only to this person.</p>
        </div>
      )}
    </div>
  );
}
