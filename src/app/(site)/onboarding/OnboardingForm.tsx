"use client";
import { useActionState, useState, useTransition } from "react";
import { saveOnboarding, skipOnboarding } from "@/app/actions/planner";
import { FormMessage, Submit } from "@/components/ui/form";

export function OnboardingForm({ next, user, cities, cats, heard }: {
  next: string; user: { name: string; cityId: string | null; interests: string[] };
  cities: { id: string; name: string; active: boolean }[]; cats: { id: string; name: string }[]; heard: string[];
}) {
  const [state, action] = useActionState(saveOnboarding, undefined);
  const [heardFrom, setHeardFrom] = useState("");
  const [pending, start] = useTransition();
  const launch = cities.filter((c) => c.active);
  return (
    <form action={action} className="card card-shadow mt-8 grid gap-7 bg-white p-6 sm:p-8">
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label className="label" htmlFor="name">What is your name?</label>
        <input id="name" name="name" className="input" defaultValue={user.name} required autoComplete="name" />
      </div>
      <fieldset className="grid gap-2">
        <legend className="label mb-1">Which city are you in?</legend>
        <div className="flex flex-wrap gap-2">
          {launch.map((c) => (
            <label key={c.id} className="check"><input type="radio" name="cityId" value={c.id} defaultChecked={user.cityId ? user.cityId === c.id : c.name === "Rawalpindi"} className="sr-only" /> {c.name}</label>
          ))}
        </div>
        <select name="cityId" className="input mt-1" defaultValue="" aria-label="Other city" onChange={(e) => { if (e.target.value) document.querySelectorAll<HTMLInputElement>('input[name="cityId"]').forEach((r) => (r.checked = false)); }}>
          <option value="">Somewhere else…</option>
          {cities.filter((c) => !c.active).map((c) => <option key={c.id} value={c.id}>{c.name} (coming soon)</option>)}
        </select>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="label mb-1">What kind of services interest you? <span className="font-normal text-mute">(optional)</span></legend>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => <label key={c.id} className="check"><input type="checkbox" name="interests" value={c.id} defaultChecked={user.interests.includes(c.id)} className="sr-only" /> {c.name}</label>)}
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="label mb-1">Are you planning an event? <span className="font-normal text-mute">(optional)</span></legend>
        <div className="flex flex-wrap gap-2">
          <label className="check"><input type="radio" name="planningEvent" value="yes" className="sr-only" /> Yes, help me plan</label>
          <label className="check"><input type="radio" name="planningEvent" value="no" className="sr-only" /> Just browsing</label>
        </div>
      </fieldset>
      <fieldset className="grid gap-2">
        <legend className="label mb-1">Where did you hear about Ronaq? <span className="font-normal text-mute">(optional)</span></legend>
        <select name="heardFrom" className="input" value={heardFrom} onChange={(e) => setHeardFrom(e.target.value)} aria-label="Where did you hear about Ronaq?">
          <option value="">Choose…</option>
          {heard.map((h) => <option key={h}>{h}</option>)}
        </select>
        {heardFrom === "Other" && <input name="heardOther" className="input" placeholder="Tell us where" aria-label="Where else" />}
      </fieldset>
      <FormMessage state={state} />
      <div className="flex flex-wrap items-center gap-3">
        <Submit>Continue</Submit>
        <button type="button" className="btn btn-ghost" disabled={pending} onClick={() => start(() => skipOnboarding(next))}>Skip for now</button>
      </div>
    </form>
  );
}
