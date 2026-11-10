"use client";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ExternalLink } from "lucide-react";
import { WorkingHoursPicker } from "@/components/vendor/WorkingHoursPicker";
import { ImagePlus } from "lucide-react";
import { saveVendorProfile } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";
import { Picture, VendorLogo } from "@/components/art/CraftArt";
import type { Vendor } from "@/db/schema";
import { SOCIALS } from "@/lib/socials";
import { SocialIcon } from "@/components/vendor/SocialIcon";
import { ReferenceFields, ReferencesEditor } from "@/components/vendor/ReferencesEditor";
import type { WorkReference } from "@/lib/references";

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
  const [refs, setRefs] = useState<WorkReference[]>(v.workReferences ?? []);
  const cityAreas = areas.filter((a) => a.cityId === cityId);
  return (
    <form action={action} className="mt-6 grid gap-6">
      <section className="card bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg">Cover photo aur logo</h2>
        <p className="mt-1 text-sm text-mute">Cover na ho to card par aap ke kaam ki tasveer nazar aati hai. Apne behtareen kaam ki photo ya logo lagayein. JPG, PNG ya WebP, 5 MB tak.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_160px]">
          <label className="group relative block aspect-[16/7] cursor-pointer overflow-hidden rounded-2xl border-[3px] border-ink">
            {coverPreview ? <img src={coverPreview} alt="New cover preview" className="h-full w-full object-cover" /> : <Picture src={v.coverImage} alt="Current cover" fallbackKind={art} seed={7} ratio={16 / 7} className="h-full w-full" />}
            <span className="absolute inset-0 grid place-items-center bg-ink/0 text-sand opacity-0 transition group-hover:bg-ink/50 group-hover:opacity-100"><span className="flex items-center gap-2 font-bold"><ImagePlus /> Change cover</span></span>
            <input type="file" name="cover" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setCoverPreview(URL.createObjectURL(f)); }} />
          </label>
          <label className="group relative block aspect-square cursor-pointer overflow-hidden rounded-2xl border-[3px] border-ink">
            {logoPreview ? <img src={logoPreview} alt="New logo preview" className="h-full w-full object-cover" /> : <VendorLogo src={v.logoImage} name={v.name} className="h-full w-full" />}
            <span className="absolute inset-0 grid place-items-center bg-ink/0 text-sand opacity-0 transition group-hover:bg-ink/50 group-hover:opacity-100"><span className="text-sm font-bold">Change logo</span></span>
            <input type="file" name="logo" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoPreview(URL.createObjectURL(f)); }} />
          </label>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          {v.coverImage && <label className="flex items-center gap-2"><input type="checkbox" name="removeCover" className="accent-red" /> Cover hatayein</label>}
          {v.logoImage && <label className="flex items-center gap-2"><input type="checkbox" name="removeLogo" className="accent-red" /> Logo hatayein</label>}
        </div>
      </section>

      <section className="card grid gap-4 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="font-display text-lg sm:col-span-2">Aap ki dukaan</h2>
        <div className="field"><label className="label" htmlFor="p-name">Dukaan ka naam (Business name)</label><input id="p-name" name="name" className="input" defaultValue={v.name} required /></div>
        <div className="field"><label className="label" htmlFor="p-owner">Maalik ka naam (Owner)</label><input id="p-owner" name="ownerName" className="input" defaultValue={v.ownerName ?? ""} /></div>
        <div className="field"><label className="label" htmlFor="p-type">Karobar ki qisam (Business type)</label><Select id="p-type" name="businessType" className="input" defaultValue={v.businessType ?? ""}><option value="">Chunein…</option>{businessTypes.map((b) => <option key={b}>{b}</option>)}</Select></div>
        <div className="field"><label className="label" htmlFor="p-exp">Kitne saal ka tajurba (Experience)</label><input id="p-exp" name="experienceYears" inputMode="numeric" className="input" defaultValue={v.experienceYears ?? ""} /></div>
        <div className="field sm:col-span-2"><label className="label" htmlFor="p-desc">Apne kaam ke baare mein (Description)</label><textarea id="p-desc" name="description" className="input !min-h-36" defaultValue={v.description ?? ""} maxLength={2000} /><p className="hint">Do teen lines likhein. Aap ka kaam khaas kyun hai?</p></div>
      </section>

      <section className="card grid gap-4 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="font-display text-lg sm:col-span-2">Kahan aur kaise kaam karte hain</h2>
        <div className="field"><label className="label" htmlFor="p-city">Sheher (City)</label><Select id="p-city" name="cityId" className="input" value={cityId} onChange={(e) => setCityId(e.target.value)}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></div>
        <div className="field"><label className="label" htmlFor="p-area">Aap ka ilaqa (Base area)</label><Select id="p-area" name="areaId" className="input" defaultValue={v.areaId ?? ""}><option value="">Chunein…</option>{cityAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></div>
        <fieldset className="grid gap-2 sm:col-span-2">
          <legend className="label mb-1">Service kaise dete hain?</legend>
          <div className="flex flex-wrap gap-2">{modes.map((m) => <label key={m.value} className="check"><input type="checkbox" name="modes" value={m.value} defaultChecked={v.modes.includes(m.value)} className="sr-only" /> {m.label}</label>)}</div>
        </fieldset>
        <fieldset className="grid gap-2 sm:col-span-2">
          <legend className="label mb-1">Kin ilaqon mein jaate hain? (Areas)</legend>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="servesWholeCity" checked={whole} onChange={(e) => setWhole(e.target.checked)} className="h-4 w-4 accent-red" /> Poora sheher</label>
          {!whole && (
            <>
              <div className="flex flex-wrap gap-2">{cityAreas.map((a) => <label key={a.id} className="check !text-xs"><input type="checkbox" name="serviceAreaIds" value={a.id} defaultChecked={v.serviceAreaIds.includes(a.id)} className="sr-only" /> {a.name}</label>)}</div>
              <div className="field max-w-xs"><label className="label text-xs" htmlFor="p-rad">…ya apne ilaqe se kitne km tak</label><input id="p-rad" name="serviceRadiusKm" inputMode="numeric" className="input" defaultValue={v.serviceRadiusKm ?? ""} /></div>
            </>
          )}
        </fieldset>
        <WorkingHoursPicker value={v.workingHours} />
        <div className="field"><label className="label" htmlFor="p-notice">Kitne din pehle batana hoga</label><input id="p-notice" name="advanceNoticeDays" inputMode="numeric" className="input" defaultValue={v.advanceNoticeDays ?? ""} /></div>
        <div className="field"><label className="label" htmlFor="p-cap">Ek din mein kitne events le sakte hain</label><input id="p-cap" name="capacity" inputMode="numeric" className="input" defaultValue={v.capacity ?? ""} /></div>
      </section>

      <section className="card grid gap-4 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="font-display text-lg sm:col-span-2">Rabta (Contact)</h2>
        <div className="field"><label className="label" htmlFor="p-phone">Phone</label><input id="p-phone" name="phone" inputMode="tel" className="input" defaultValue={v.phone ?? ""} /></div>
        <div className="field"><label className="label" htmlFor="p-wa">WhatsApp</label><input id="p-wa" name="whatsapp" inputMode="tel" className="input" defaultValue={v.whatsapp ?? ""} /></div>
        <label className="flex items-start gap-2 rounded-xl bg-sand p-3 text-sm sm:col-span-2">
          <input type="checkbox" name="revealContact" defaultChecked={v.revealContact} className="mt-0.5 h-4 w-4 accent-red" />
          <span><b>Mera phone aur WhatsApp khareedar ko dikhayein.</b> Band ho to khareedar sirf Ronaq par message kar sakte hain.</span>
        </label>
      </section>

      <section className="card grid gap-4 bg-white p-5 sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2"><h2 className="font-display text-lg">Social media</h2><p className="mt-1 text-sm text-mute">Zaroori nahi. Yeh aap ki profile par buttons ban kar nazar aate hain. @yourstudio bhi likh sakte hain.</p></div>
        {SOCIALS.map((sdef) => (
          <div key={sdef.key} className="field">
            <label className="label flex items-center gap-2" htmlFor={`so-${sdef.key}`}><SocialIcon kind={sdef.key} size={16} /> {sdef.label}</label>
            <input id={`so-${sdef.key}`} name={`social_${sdef.key}`} className="input" defaultValue={v.socials?.[sdef.key] ?? ""} placeholder={sdef.placeholder} inputMode="url" autoComplete="off" />
          </div>
        ))}
      </section>

      <section id="references" className="card scroll-mt-24 bg-white p-5 sm:p-6">
        <h2 className="font-display text-lg">Pichla kaam aur references</h2>
        <p className="mb-4 mt-1 text-sm text-mute">Zaroori nahi. Jo events kiye hain aur jo aap ki gawahi de sakte hain.</p>
        <ReferenceFields value={refs} />
        <ReferencesEditor value={refs} onChange={setRefs} />
      </section>

      <FormMessage state={state} />
      <div className="sticky bottom-[76px] z-20 flex flex-wrap justify-end gap-2 md:bottom-4">
        {v.status === "approved" && <Link href={`/v/${v.slug}`} className="btn">Live dukaan dekhein <ExternalLink size={15} /></Link>}
        <Submit className={v.status === "draft" ? "btn" : "btn btn-red"} pendingText="Save ho raha hai…">Save karein</Submit>
        {v.status === "draft" && <Submit name="publish" value="1" className="btn btn-red" pendingText="Publish ho raha hai…">Save &amp; publish karein</Submit>}
      </div>
    </form>
  );
}
