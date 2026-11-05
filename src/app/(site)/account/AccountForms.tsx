"use client";
import { useActionState } from "react";
import { changePassword, updateProfile } from "@/app/actions/planner";
import { resendVerification, signOutAction } from "@/app/actions/auth";
import { FormMessage, Submit } from "@/components/ui/form";

type U = { name: string; email: string; phone: string | null; cityId: string | null; interests: string[]; remindersEnabled: boolean; emailVerified: boolean };

export function AccountForms({ user, cities, cats }: { user: U; cities: { id: string; name: string }[]; cats: { slug: string; name: string }[] }) {
  const [p, pAction] = useActionState(updateProfile, undefined);
  const [pw, pwAction] = useActionState(changePassword, undefined);
  const [v, vAction] = useActionState(resendVerification, undefined);
  return (
    <div className="mt-8 grid gap-8">
      <form action={pAction} className="card grid gap-4 bg-white p-6">
        <h2 className="font-display text-xl">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field"><label className="label" htmlFor="name">Name</label><input id="name" name="name" className="input" defaultValue={user.name} required /></div>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="input bg-sand" value={user.email} readOnly />
            <p className="hint">{user.emailVerified ? "Verified ✓" : "Not verified yet."}</p>
          </div>
          <div className="field"><label className="label" htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" className="input" defaultValue={user.phone ?? ""} inputMode="tel" placeholder="0300 1234567" /><p className="hint">Never shown to vendors unless you share it yourself.</p></div>
          <div className="field">
            <label className="label" htmlFor="cityId">City</label>
            <select id="cityId" name="cityId" className="input" defaultValue={user.cityId ?? ""}><option value="">Choose…</option>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </div>
        </div>
        <fieldset>
          <legend className="label mb-2">Interests</legend>
          <div className="flex flex-wrap gap-2">{cats.map((c) => <label key={c.slug} className="check"><input type="checkbox" name="interests" value={c.slug} defaultChecked={user.interests.includes(c.slug)} className="sr-only" /> {c.name}</label>)}</div>
        </fieldset>
        <label className="flex items-center gap-2 font-medium"><input type="checkbox" name="remindersEnabled" defaultChecked={user.remindersEnabled} className="h-4 w-4 accent-red" /> Send me reminders before my events and deadlines</label>
        <FormMessage state={p} />
        <div><Submit>Save profile</Submit></div>
      </form>

      {!user.emailVerified && (
        <form action={vAction} className="card grid gap-3 bg-white p-6">
          <h2 className="font-display text-xl">Verify your email</h2>
          <p className="text-sm text-mute">We&apos;ll send a link to {user.email}.</p>
          <FormMessage state={v} />
          <div><Submit className="btn btn-blue">Send verification link</Submit></div>
        </form>
      )}

      <form action={pwAction} className="card grid gap-4 bg-white p-6">
        <h2 className="font-display text-xl">Password</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field"><label className="label" htmlFor="current">Current password</label><input id="current" name="current" type="password" className="input" autoComplete="current-password" required /></div>
          <div className="field"><label className="label" htmlFor="next">New password</label><input id="next" name="next" type="password" className="input" autoComplete="new-password" minLength={8} required /></div>
        </div>
        <FormMessage state={pw} />
        <div><Submit>Change password</Submit></div>
      </form>

      <form action={signOutAction}><button className="btn">Sign out</button></form>
    </div>
  );
}
