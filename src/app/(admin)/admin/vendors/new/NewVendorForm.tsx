"use client";
import { useActionState, useState } from "react";
import { adminCreateVendor } from "@/app/actions/admin";
import { FormMessage, Submit } from "@/components/ui/form";

export function NewVendorForm({ cats, cities, areas, modes }: { cats: { id: string; name: string }[]; cities: { id: string; name: string }[]; areas: { id: string; name: string; cityId: string }[]; modes: { value: string; label: string }[] }) {
  const [state, action] = useActionState(adminCreateVendor, undefined);
  const [city, setCity] = useState(cities[0]?.id ?? "");
  return (
    <form action={action} className="grid gap-4 rounded-2xl border-[3px] border-ink bg-white p-6 sm:grid-cols-2">
      <div className="field sm:col-span-2"><label className="label" htmlFor="nv-name">Business name</label><input id="nv-name" name="name" className="input" required /></div>
      <div className="field"><label className="label" htmlFor="nv-owner">Owner name</label><input id="nv-owner" name="ownerName" className="input" /></div>
      <div className="field"><label className="label" htmlFor="nv-phone">Phone</label><input id="nv-phone" name="phone" className="input" inputMode="tel" /></div>
      <div className="field"><label className="label" htmlFor="nv-cat">Main category</label><select id="nv-cat" name="categoryId" className="input">{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="field"><label className="label" htmlFor="nv-city">City</label><select id="nv-city" name="cityId" className="input" value={city} onChange={(e) => setCity(e.target.value)}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="field"><label className="label" htmlFor="nv-area">Area</label><select id="nv-area" name="areaId" className="input"><option value="">—</option>{areas.filter((a) => a.cityId === city).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
      <fieldset className="sm:col-span-2"><legend className="label mb-2">Service modes</legend><div className="flex flex-wrap gap-2">{modes.map((m) => <label key={m.value} className="check"><input type="checkbox" name="modes" value={m.value} className="sr-only" /> {m.label}</label>)}</div></fieldset>
      <div className="field sm:col-span-2"><label className="label" htmlFor="nv-desc">Description</label><textarea id="nv-desc" name="description" className="input" /></div>
      <div className="sm:col-span-2"><FormMessage state={state} /></div>
      <div><Submit>Create draft profile</Submit></div>
    </form>
  );
}
