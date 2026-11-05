"use client";
import { useActionState, useState } from "react";
import { ImagePlus } from "lucide-react";
import { saveVendorProfile } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";
import { Picture } from "@/components/art/CraftArt";
import type { Vendor } from "@/db/schema";

type Props = {
  v: Vendor & { serviceAreaIds: string[]; modes: string[] };
  art: string;
  cities: { id: string; name: string }[];
  areas: { id: string; name: string; cityId: string }[];
  businessTypes: string[];
  modes: { value: string; label: string }[];
};

export function ProfileForm({ v, art, cities, areas, businessTypes, modes }: Props) {
  const [state, action] = useActionState(saveVendorProfile, undefined);
  const [cityId, setCityId] = useState(v.cityId ?? cities[0]?.id ?? "");
  const [whole, setWhole] = useState(v.servesWholeCity);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const cityAreas = areas.filter((a) => a.cityId === cityId);
  return (
    <form action={action} className="mt-6 grid gap-6">
      <section className="card bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg">Cover &amp; logo</h2>
        <p className="mt-1 text-sm text-mute">Without a cover, your card shows an illustration of your craft. Upload a photo of your best work or your logo to stand out. JPG, PNG or WebP, up to 5 MB.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px]">
          <label className="group relative block aspect-[16/7] cursor-pointer overflow-hidden rounded-2xl border-[3px] border-ink">
            {coverPreview ? <img src={coverPreview} alt="New cover preview" className="h-full w-full object-cover" /> : <Picture src={v.coverImage} alt="Current cover" fallbackKind={art} seed={7} className="h-full w-full" />}
            <span className="absolute inset-0 grid place-items-center bg-ink/0 text-sand opacity-0 transition group-hover:bg-ink/50 group-hover:opacity-100"><span className="flex items-center gap-2 font-bold"><ImagePlus /> Change cover</span></span>
            <input type="file" name="cover" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setCoverPreview(URL.createObjectURL(f)); }} />
          </label>
          <label className="group relative block aspect-square cursor-pointer overflow-hidden rounded-2xl border-[3px] border-ink">
            {logoPreview ? <img src={logoPreview} alt="New logo preview" className="h-full w-full object-cover" /> : <Picture src={v.logoImage} alt="Current logo" fallbackKind={art} seed={1} className="h-full w-full" />}
            <span className="absolute inset-0 grid place-items-center bg-ink/0 text-sand opacity-0 transition group-hover:bg-ink/50 group-hover:opacity-100"><span className="text-sm font-bold">Change logo</span></span>
            <input type="file" name="logo" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoPreview(URL.createObjectURL(f)); }} />
          </label>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          {v.coverImage && <label className="flex items-center gap-2"><input type="checkbox" name="removeCover" className="accent-red" /> Remove cover (use craft illustration)</label>}
          {v.logoImage && <label className="flex items-center gap-2"><input type="checkbox" name="removeLogo" className="accent-red" /> Remove logo</label>}
        </div>
      </section>

      <section className="card grid gap-4 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="font-display text-lg sm:col-span-2">About</h2>
        <div className="field"><label className="label" htmlFor="p-name">Business name</label><input id="p-name" name="name" className="input" defaultValue={v.name} required /></div>
        <div className="field"><label className="label" htmlFor="p-owner">Owner / contact person</label><input id="p-owner" name="ownerName" className="input" defaultValue={v.ownerName ?? ""} /></div>
        <div className="field"><label className="label" htmlFor="p-type">Business type</label><select id="p-type" name="businessType" className="input" defaultValue={v.businessType ?? ""}><option value="">Choose…</option>{businessTypes.map((b) => <option key={b}>{b}</option>)}</select></div>
        <div className="field"><label className="label" htmlFor="p-exp">Years of experience</label><input id="p-exp" name="experienceYears" inputMode="numeric" className="input" defaultValue={v.experienceYears ?? ""} /></div>
        <div className="field sm:col-span-2"><label className="label" htmlFor="p-desc">Description</label><textarea id="p-desc" name="description" className="input !min-h-36" defaultValue={v.description ?? ""} maxLength={2000} /><p className="hint">At least 40 characters. Tell families what you&apos;re known for.</p></div>
      </section>

      <section className="card grid gap-4 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="font-display text-lg sm:col-span-2">Where &amp; how you work</h2>
        <div className="field"><label className="label" htmlFor="p-city">City</label><select id="p-city" name="cityId" className="input" value={cityId} onChange={(e) => setCityId(e.target.value)}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="field"><label className="label" htmlFor="p-area">Base area</label><select id="p-area" name="areaId" className="input" defaultValue={v.areaId ?? ""}><option value="">Choose…</option>{cityAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <fieldset className="grid gap-2 sm:col-span-2">
          <legend className="label mb-1">Service modes</legend>
          <div className="flex flex-wrap gap-2">{modes.map((m) => <label key={m.value} className="check"><input type="checkbox" name="modes" value={m.value} defaultChecked={v.modes.includes(m.value)} className="sr-only" /> {m.label}</label>)}</div>
        </fieldset>
        <fieldset className="grid gap-2 sm:col-span-2">
          <legend className="label mb-1">Areas you serve</legend>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="servesWholeCity" checked={whole} onChange={(e) => setWhole(e.target.checked)} className="h-4 w-4 accent-red" /> The whole city</label>
          {!whole && (
            <>
              <div className="flex flex-wrap gap-2">{cityAreas.map((a) => <label key={a.id} className="check !text-xs"><input type="checkbox" name="serviceAreaIds" value={a.id} defaultChecked={v.serviceAreaIds.includes(a.id)} className="sr-only" /> {a.name}</label>)}</div>
              <div className="field max-w-xs"><label className="label text-xs" htmlFor="p-rad">…or within km of your base</label><input id="p-rad" name="serviceRadiusKm" inputMode="numeric" className="input" defaultValue={v.serviceRadiusKm ?? ""} /></div>
            </>
          )}
        </fieldset>
        <div className="field"><label className="label" htmlFor="p-hours">Working hours</label><input id="p-hours" name="workingHours" className="input" defaultValue={v.workingHours ?? ""} placeholder="e.g. 10am – 9pm, closed Friday" /></div>
        <div className="field"><label className="label" htmlFor="p-notice">Advance notice (days)</label><input id="p-notice" name="advanceNoticeDays" inputMode="numeric" className="input" defaultValue={v.advanceNoticeDays ?? ""} /></div>
        <div className="field"><label className="label" htmlFor="p-cap">Events you can take on the same day</label><input id="p-cap" name="capacity" inputMode="numeric" className="input" defaultValue={v.capacity ?? ""} /></div>
      </section>

      <section className="card grid gap-4 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="font-display text-lg sm:col-span-2">Contact</h2>
        <div className="field"><label className="label" htmlFor="p-phone">Phone</label><input id="p-phone" name="phone" inputMode="tel" className="input" defaultValue={v.phone ?? ""} /></div>
        <div className="field"><label className="label" htmlFor="p-wa">WhatsApp</label><input id="p-wa" name="whatsapp" inputMode="tel" className="input" defaultValue={v.whatsapp ?? ""} /></div>
        <label className="flex items-start gap-2 rounded-xl bg-sand p-3 text-sm sm:col-span-2">
          <input type="checkbox" name="revealContact" defaultChecked={v.revealContact} className="mt-0.5 h-4 w-4 accent-red" />
          <span><b>Show my phone and WhatsApp to signed-in families.</b> Off by default. When off, families can only message you through Ronaq.</span>
        </label>
      </section>

      <FormMessage state={state} />
      <div className="sticky bottom-[76px] z-20 flex justify-end md:bottom-4"><Submit className="btn btn-red">Save profile</Submit></div>
    </form>
  );
}
