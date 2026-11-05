"use client";
import { useActionState } from "react";
import { saveSettings } from "@/app/actions/admin";
import { FormMessage, Submit } from "@/components/ui/form";

type Policy = { basis: string; premoderate: boolean; minMessages: number };

export function SettingsForm({ policy, cap, featured, cities }: { policy: Policy; cap: number; featured: boolean; cities: { id: string; name: string; province: string; active: boolean }[] }) {
  const [state, action] = useActionState(saveSettings, undefined);
  return (
    <form action={action} className="grid gap-6">
      <fieldset className="grid gap-3 rounded-2xl border-2 border-ink/10 bg-white p-5">
        <legend className="px-1 font-display text-lg">Who can review a vendor?</legend>
        {[
          ["inquiry", "People who contacted the vendor through Ronaq", "Recommended for launch. Ties every review to a real conversation."],
          ["account", "Any signed-in member", "Most open. Use with pre-moderation."],
          ["admin_evidence", "Only with evidence checked by Ronaq", "Every review waits for staff to confirm the event happened."],
        ].map(([v, t, d]) => (
          <label key={v} className="flex items-start gap-3 rounded-xl border-2 border-ink/10 p-3 has-[:checked]:border-blue has-[:checked]:bg-blue-soft">
            <input type="radio" name="basis" value={v} defaultChecked={policy.basis === v} className="mt-1 accent-blue" />
            <span><b className="block">{t}</b><span className="text-sm text-mute">{d}</span></span>
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="premoderate" defaultChecked={policy.premoderate} className="accent-red" /> Hold every new review for moderation before it appears</label>
        <label className="flex items-center gap-2 text-sm">Vendor must have replied at least <input type="number" name="minMessages" min={0} max={10} defaultValue={policy.minMessages} className="input !min-h-9 !w-20 !py-1" aria-label="Minimum vendor replies" /> time(s) (inquiry rule only)</label>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl border-2 border-ink/10 bg-white p-5">
        <legend className="px-1 font-display text-lg">Founding vendors</legend>
        <label className="flex items-center gap-2 text-sm">The first <input type="number" name="foundingCap" min={0} defaultValue={cap} className="input !min-h-9 !w-24 !py-1" aria-label="Founding cap" /> approved vendors become founding vendors (free basic listing, badge).</label>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl border-2 border-ink/10 bg-white p-5">
        <legend className="px-1 font-display text-lg">Cities</legend>
        <p className="text-sm text-mute">Active cities appear in search and onboarding. Turn on a city once it has vendors.</p>
        <div className="flex flex-wrap gap-2">{cities.map((c) => <label key={c.id} className="check"><input type="checkbox" name="activeCities" value={c.id} defaultChecked={c.active} className="sr-only" /> {c.name} <span className="text-xs opacity-60">{c.province}</span></label>)}</div>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl border-2 border-red/40 bg-white p-5">
        <legend className="px-1 font-display text-lg">Featured placement</legend>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="featuredEnabled" defaultChecked={featured} className="mt-1 accent-red" /> <span>Allow featured vendors. They are always labelled <b>Sponsored</b> and never mixed into organic ranking. <b>Keep this off for MVP</b> until the placement policy is approved (PRD FR-ADM-008).</span></label>
      </fieldset>

      <FormMessage state={state} />
      <div><Submit>Save settings</Submit></div>
    </form>
  );
}
