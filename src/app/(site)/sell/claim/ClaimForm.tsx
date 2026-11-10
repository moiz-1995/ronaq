"use client";
import { useActionState } from "react";
import { claimProfile } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";

export function ClaimForm() {
  const [state, action] = useActionState(claimProfile, undefined);
  return (
    <form action={action} className="card card-shadow mt-6 grid gap-4 bg-white p-6">
      <div className="field">
        <label className="label" htmlFor="code">Claim code</label>
        <input id="code" name="code" className="input font-mono uppercase tracking-widest" placeholder="RNQ-XXXXXX" autoComplete="off" required />
      </div>
      <FormMessage state={state} />
      <Submit>Claim profile</Submit>
    </form>
  );
}
