"use client";
import { useActionState } from "react";
import { resetPassword } from "@/app/actions/auth";
import { FormMessage, Submit } from "@/components/ui/form";

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <div className="field">
        <label className="label" htmlFor="password">Naya password</label>
        <input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <FormMessage state={state} />
      <Submit className="btn btn-red w-full" pendingText="Save ho raha hai…">Password save karein</Submit>
    </form>
  );
}
