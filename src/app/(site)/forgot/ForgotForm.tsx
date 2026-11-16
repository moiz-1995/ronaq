"use client";
import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/auth";
import { FormMessage, Submit } from "@/components/ui/form";

export function ForgotForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="grid gap-4">
      <div className="field">
        <label className="label" htmlFor="email">Your registered email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <FormMessage state={state} />
      <Submit className="btn btn-red w-full" pendingText="Sending…">Send reset link</Submit>
    </form>
  );
}
