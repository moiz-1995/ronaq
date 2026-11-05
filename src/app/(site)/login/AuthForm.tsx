"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { FormMessage, Submit } from "@/components/ui/form";

export function AuthForm({ mode, next, intent: initialIntent = "plan" }: { mode: "login" | "signup"; next?: string; intent?: "plan" | "sell" }) {
  const [state, action] = useActionState(mode === "login" ? signInAction : signUpAction, undefined);
  const [show, setShow] = useState(false);
  const [intent, setIntent] = useState(initialIntent);
  return (
    <form action={action} className="grid gap-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {mode === "signup" && (
        <>
          <fieldset className="grid grid-cols-2 gap-2">
            <legend className="label mb-2">I want to</legend>
            {(["plan", "sell"] as const).map((v) => (
              <label key={v} className={`cursor-pointer rounded-xl border-[3px] border-ink p-3 text-sm font-bold ${intent === v ? (v === "plan" ? "bg-blue text-sand" : "bg-red text-sand") : "bg-white"}`}>
                <input type="radio" name="intent" value={v} checked={intent === v} onChange={() => setIntent(v)} className="sr-only" />
                {v === "plan" ? "Plan an event" : "Sell my services"}
                <span className="mt-1 block text-xs font-normal opacity-80">{v === "plan" ? "Find vendors, make checklists" : "Get inquiries from families"}</span>
              </label>
            ))}
          </fieldset>
          <div className="field">
            <label className="label" htmlFor="name">Your name</label>
            <input className="input" id="name" name="name" autoComplete="name" defaultValue={state?.fields?.name} required />
          </div>
        </>
      )}
      <div className="field">
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state?.fields?.email} required />
      </div>
      <div className="field">
        <label className="label" htmlFor="password">Password</label>
        <div className="relative">
          <input className="input pr-12" id="password" name="password" type={show ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required />
          <button type="button" onClick={() => setShow((x) => !x)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 hover:bg-sand" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {mode === "signup" && <p className="hint">At least 8 characters.</p>}
      </div>
      <FormMessage state={state} />
      <Submit className="btn btn-red w-full" pendingText={mode === "login" ? "Signing in…" : "Creating account…"}>
        {mode === "login" ? "Sign in" : "Create free account"}
      </Submit>
      {mode === "signup" && <p className="text-xs text-mute">By joining you agree to Ronaq&apos;s <Link className="underline" href="/legal/terms">terms</Link> and <Link className="underline" href="/legal/privacy">privacy policy</Link>.</p>}
    </form>
  );
}
