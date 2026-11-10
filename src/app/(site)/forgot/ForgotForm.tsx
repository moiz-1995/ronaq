"use client";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { FormMessage, Submit } from "@/components/ui/form";

export function ForgotForm({ byEmail }: { byEmail: boolean }) {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="grid gap-4">
      <div className="field">
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      {!byEmail && (
        <div className="field">
          <label className="label" htmlFor="contact">WhatsApp number (optional)</label>
          <input className="input" id="contact" name="contact" inputMode="tel" maxLength={20} placeholder="0300 1234567" />
          <p className="hint">Taake team aap ko link WhatsApp par bhej sake.</p>
        </div>
      )}
      <FormMessage state={state} />
      <Submit className="btn btn-red w-full" pendingText="Bhej rahe hain…">{byEmail ? "Reset link bhejein" : "Team se reset link maangein"}</Submit>
    </form>
  );
}
