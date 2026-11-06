"use client";
import { useActionState, useEffect, useState } from "react";
import { startSelling } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";
import { CraftArt } from "@/components/art/CraftArt";

type Props = {
  user: { name: string; phone: string | null };
  cities: { id: string; name: string }[];
  areas: { id: string; name: string; cityId: string }[];
  cats: { slug: string; name: string; art: string; description: string }[];
  businessTypes: string[];
  modes: { value: string; label: string }[];
  heard: string[];
};

const STEPS = ["What you offer", "Your business", "Where you work", "Contact"];
const DRAFT_KEY = "ronaq-seller-draft";

/** Seller questionnaire (§9.1). Steps are client-side; nothing is lost if you go back. Draft kept in this browser. */
export function SellerWizard({ user, cities, areas, cats, businessTypes, modes, heard }: Props) {
  const [state, action] = useActionState(startSelling, undefined);
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    categories: [] as string[], name: "", ownerName: user.name, description: "", businessType: "", experienceYears: "",
    cityId: cities[0]?.id ?? "", areaId: "", servesWholeCity: false, serviceAreaIds: [] as string[], serviceRadiusKm: "",
    modes: [] as string[], phone: user.phone ?? "", whatsapp: "", referralSource: "",
  });
  useEffect(() => {
    try { const raw = localStorage.getItem(DRAFT_KEY); if (raw) setD((x) => ({ ...x, ...JSON.parse(raw) })); } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {} }, [d]);
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((x) => ({ ...x, [k]: v }));
  const toggle = (k: "categories" | "serviceAreaIds" | "modes", v: string) => set(k, d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v]);
  const cityAreas = areas.filter((a) => a.cityId === d.cityId);
  const canNext = [d.categories.length > 0, d.name.trim().length > 1, !!d.cityId && d.modes.length > 0, true][step];

  return (
    <form action={action} onSubmit={() => { try { localStorage.removeItem(DRAFT_KEY); } catch {} }} className="mt-8 grid gap-6">
      <ol className="grid grid-cols-4 gap-1.5" aria-label="Progress">
        {STEPS.map((t, i) => (
          <li key={t} className={`rounded-lg border-2 border-ink px-2 py-1.5 text-center text-xs font-bold ${i === step ? "bg-red text-sand" : i < step ? "bg-sand" : "bg-white"}`} aria-current={i === step ? "step" : undefined}>
            <span className="hidden sm:inline">{i + 1}. </span>{t}
          </li>
        ))}
      </ol>

      {/* hidden mirrors so every step's answers submit together */}
      {d.categories.map((c) => <input key={c} type="hidden" name="categories" value={c} />)}
      {d.modes.map((m) => <input key={m} type="hidden" name="modes" value={m} />)}
      {d.serviceAreaIds.map((a) => <input key={a} type="hidden" name="serviceAreaIds" value={a} />)}
      {(["name", "ownerName", "description", "businessType", "experienceYears", "cityId", "areaId", "serviceRadiusKm", "phone", "whatsapp", "referralSource"] as const).map((k) => <input key={k} type="hidden" name={k} value={d[k]} />)}
      {d.servesWholeCity && <input type="hidden" name="servesWholeCity" value="on" />}

      <div className="card card-shadow bg-white p-5 sm:p-7">
        {step === 0 && (
          <fieldset className="grid gap-3">
            <legend className="font-display text-xl">What do you offer?</legend>
            <p className="-mt-1 text-sm text-mute">Choose all that apply. Each one gets its own prices, details and photos.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cats.map((c, i) => {
                const on = d.categories.includes(c.slug);
                return (
                  <button type="button" key={c.slug} onClick={() => toggle("categories", c.slug)} aria-pressed={on}
                    className={`overflow-hidden rounded-2xl border-[3px] text-left transition ${on ? "border-red shadow-[4px_4px_0_var(--color-red)]" : "border-ink"}`}>
                    <div className="aspect-[5/3]"><CraftArt kind={c.art} seed={i * 3} ratio={5 / 3} className="h-full w-full" /></div>
                    <p className={`border-t-[3px] p-2 font-display text-xs ${on ? "border-red bg-red text-sand" : "border-ink bg-white"}`}>{on ? "✓ " : ""}{c.name}</p>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <h2 className="font-display text-xl sm:col-span-2">About your business</h2>
            <div className="field sm:col-span-2"><label className="label" htmlFor="w-name">Business name</label><input id="w-name" className="input" value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Hina's Henna Studio" /></div>
            <div className="field"><label className="label" htmlFor="w-owner">Owner / contact person</label><input id="w-owner" className="input" value={d.ownerName} onChange={(e) => set("ownerName", e.target.value)} /></div>
            <div className="field"><label className="label" htmlFor="w-type">Business type</label>
              <select id="w-type" className="input" value={d.businessType} onChange={(e) => set("businessType", e.target.value)}><option value="">Choose…</option>{businessTypes.map((b) => <option key={b}>{b}</option>)}</select>
            </div>
            <div className="field"><label className="label" htmlFor="w-exp">Years of experience</label><input id="w-exp" className="input" inputMode="numeric" value={d.experienceYears} onChange={(e) => set("experienceYears", e.target.value.replace(/\D/g, ""))} /></div>
            <div className="field sm:col-span-2"><label className="label" htmlFor="w-desc">Describe your work</label><textarea id="w-desc" className="input" value={d.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} placeholder="What makes your work special? What do families love about you?" /><p className="hint">{d.description.trim().length}/40 characters minimum before you can submit. You can finish this later.</p></div>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-5">
            <h2 className="font-display text-xl">Where and how you work</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field"><label className="label" htmlFor="w-city">City</label>
                <select id="w-city" className="input" value={d.cityId} onChange={(e) => setD((x) => ({ ...x, cityId: e.target.value, areaId: "", serviceAreaIds: [] }))}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              </div>
              <div className="field"><label className="label" htmlFor="w-area">Your base area</label>
                <select id="w-area" className="input" value={d.areaId} onChange={(e) => set("areaId", e.target.value)}><option value="">Choose…</option>{cityAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
              </div>
            </div>
            <fieldset className="grid gap-2">
              <legend className="label mb-1">How do you deliver your service?</legend>
              <div className="flex flex-wrap gap-2">{modes.map((m) => <button type="button" key={m.value} className={`check ${d.modes.includes(m.value) ? "!bg-ink !text-sand" : ""}`} aria-pressed={d.modes.includes(m.value)} onClick={() => toggle("modes", m.value)}>{m.label}</button>)}</div>
            </fieldset>
            <fieldset className="grid gap-2">
              <legend className="label mb-1">Which areas do you serve?</legend>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={d.servesWholeCity} onChange={(e) => set("servesWholeCity", e.target.checked)} className="h-4 w-4 accent-red" /> The whole city</label>
              {!d.servesWholeCity && (
                <>
                  <div className="flex flex-wrap gap-2">{cityAreas.map((a) => <button type="button" key={a.id} className={`check !text-xs ${d.serviceAreaIds.includes(a.id) ? "!bg-ink !text-sand" : ""}`} aria-pressed={d.serviceAreaIds.includes(a.id)} onClick={() => toggle("serviceAreaIds", a.id)}>{a.name}</button>)}</div>
                  <div className="field max-w-xs"><label className="label text-xs" htmlFor="w-rad">…or within this many km of your base</label><input id="w-rad" className="input" inputMode="numeric" value={d.serviceRadiusKm} onChange={(e) => set("serviceRadiusKm", e.target.value.replace(/\D/g, ""))} /></div>
                </>
              )}
            </fieldset>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <h2 className="font-display text-xl sm:col-span-2">Contact details</h2>
            <p className="-mt-2 text-sm text-mute sm:col-span-2">For Ronaq to reach you. Families only see your number if you turn that on later in your profile.</p>
            <div className="field"><label className="label" htmlFor="w-phone">Phone</label><input id="w-phone" className="input" inputMode="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0300 1234567" /></div>
            <div className="field"><label className="label" htmlFor="w-wa">WhatsApp (if different)</label><input id="w-wa" className="input" inputMode="tel" value={d.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
            <div className="field sm:col-span-2"><label className="label" htmlFor="w-ref">How did you hear about Ronaq? (optional)</label>
              <select id="w-ref" className="input" value={d.referralSource} onChange={(e) => set("referralSource", e.target.value)}><option value="">Choose…</option>{heard.map((h) => <option key={h}>{h}</option>)}</select>
            </div>
          </div>
        )}
      </div>

      <FormMessage state={state} />
      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && <button type="button" className="btn" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 ? (
          <button type="button" className="btn btn-red" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</button>
        ) : (
          <Submit pendingText="Creating your profile…">Create my profile</Submit>
        )}
        {!canNext && step < 3 && <p className="text-sm text-mute">{["Choose at least one category.", "Add your business name.", "Pick your city and at least one way you work."][step]}</p>}
      </div>
    </form>
  );
}
