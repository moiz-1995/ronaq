"use client";
import { Select } from "@/components/ui/Select";
import { useActionState, useEffect, useRef, useState } from "react";
import { startSelling } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";
import { CraftArt } from "@/components/art/CraftArt";
import { ImagePlus } from "lucide-react";
import { ReferenceFields, ReferencesEditor } from "@/components/vendor/ReferencesEditor";
import type { WorkReference } from "@/lib/references";
import { OtherCitiesFields, OtherCitiesPicker } from "@/components/vendor/OtherCitiesPicker";

type Props = {
  user: { name: string; phone: string | null };
  cities: { id: string; name: string }[];
  allCities: { id: string; name: string }[];
  areas: { id: string; name: string; cityId: string }[];
  cats: { slug: string; name: string; art: string; description: string }[];
  businessTypes: string[];
  modes: { value: string; label: string }[];
  heard: string[];
};

const STEPS = ["What you offer", "Your business", "Where you work", "Previous work", "Contact"];
const LAST_STEP = STEPS.length - 1;
const MAX_PHOTOS = 6;
const DRAFT_KEY = "ronaq-seller-draft";

/** Seller questionnaire (§9.1). Steps are client-side; nothing is lost if you go back. Draft kept in this browser. */
export function SellerWizard({ user, cities, allCities, areas, cats, businessTypes, modes, heard }: Props) {
  const [state, action] = useActionState(startSelling, undefined);
  // after publishing, open the new dukaan with a full page load
  useEffect(() => { if (state?.goTo) window.location.assign(state.goTo); }, [state]);
  const [step, setStep] = useState(0);
  const card = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) { firstStep.current = false; return; }
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) card.current?.animate([{ opacity: 0, transform: "translateX(22px)" }, { opacity: 1, transform: "none" }], { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);
  const [d, setD] = useState({
    categories: [] as string[], name: "", ownerName: user.name, description: "", businessType: "", experienceYears: "",
    cityId: cities[0]?.id ?? "", areaId: "", servesWholeCity: false, serviceAreaIds: [] as string[], serviceRadiusKm: "",
    modes: [] as string[], phone: user.phone ?? "", whatsapp: "", referralSource: "", references: [] as WorkReference[], extraCityIds: [] as string[], otherCities: "",
  });
  const [previews, setPreviews] = useState<string[]>([]);
  const [photoNote, setPhotoNote] = useState("");
  useEffect(() => {
    try { const raw = localStorage.getItem(DRAFT_KEY); if (raw) setD((x) => ({ ...x, ...JSON.parse(raw) })); } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {} }, [d]);
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => setD((x) => ({ ...x, [k]: v }));
  const toggle = (k: "categories" | "serviceAreaIds" | "modes", v: string) => set(k, d[k].includes(v) ? d[k].filter((x) => x !== v) : [...d[k], v]);
  const cityAreas = areas.filter((a) => a.cityId === d.cityId);
  const canNext = [d.categories.length > 0, d.name.trim().length > 1, !!d.cityId && d.modes.length > 0, true, true][step];

  return (
    <form action={action} onSubmit={() => { try { localStorage.removeItem(DRAFT_KEY); } catch {} }} className="mt-8 grid gap-6">
      <ol className="grid grid-cols-5 gap-1.5" aria-label="Progress">
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
      <ReferenceFields value={d.references} />
      <OtherCitiesFields ids={d.extraCityIds} other={d.otherCities} />

      <div ref={card} className="card card-shadow bg-white p-5 sm:p-7">
        {step === 0 && (
          <fieldset className="grid gap-3">
            <legend className="font-display text-xl">What do you offer?</legend>
            <p className="-mt-1 text-sm text-mute">Choose all that apply. Har service ki apni prices aur details hongi.</p>
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
            <h2 className="font-display text-xl sm:col-span-2">About your dukaan</h2>
            <div className="field sm:col-span-2"><label className="label" htmlFor="w-name">Business name</label><input id="w-name" className="input" value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Hina's Henna Studio" /></div>
            <div className="field"><label className="label" htmlFor="w-owner">Owner name</label><input id="w-owner" className="input" value={d.ownerName} onChange={(e) => set("ownerName", e.target.value)} /></div>
            <div className="field"><label className="label" htmlFor="w-type">Business type</label>
              <Select id="w-type" className="input" value={d.businessType} onChange={(e) => set("businessType", e.target.value)}><option value="">Choose…</option>{businessTypes.map((b) => <option key={b}>{b}</option>)}</Select>
            </div>
            <div className="field"><label className="label" htmlFor="w-exp">Years of experience</label><input id="w-exp" className="input" inputMode="numeric" value={d.experienceYears} onChange={(e) => set("experienceYears", e.target.value.replace(/\D/g, ""))} /></div>
            <div className="field sm:col-span-2"><label className="label" htmlFor="w-desc">Describe your work</label><textarea id="w-desc" className="input" value={d.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} placeholder="Aap ka kaam khaas kyun hai? Log aap ko kyun pasand karte hain?" /><p className="hint">Optional for now. Do teen lines se customers ko choose karna aasan hota hai.</p></div>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-5">
            <h2 className="font-display text-xl">Where and how you work</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field"><label className="label" htmlFor="w-city">Main city</label>
                <Select id="w-city" className="input" value={d.cityId} onChange={(e) => setD((x) => ({ ...x, cityId: e.target.value, areaId: "", serviceAreaIds: [], extraCityIds: x.extraCityIds.filter((id) => id !== e.target.value) }))}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
              </div>
              <div className="field"><label className="label" htmlFor="w-area">Your area</label>
                <Select id="w-area" className="input" value={d.areaId} onChange={(e) => set("areaId", e.target.value)}><option value="">Choose…</option>{cityAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
              </div>
            </div>
            <OtherCitiesPicker cities={allCities} mainCityId={d.cityId} ids={d.extraCityIds} other={d.otherCities} onChange={(v) => setD((x) => ({ ...x, extraCityIds: v.ids, otherCities: v.other }))} />
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
                  <div className="field max-w-xs"><label className="label text-xs" htmlFor="w-rad">…or within this many km of your area</label><input id="w-rad" className="input" inputMode="numeric" value={d.serviceRadiusKm} onChange={(e) => set("serviceRadiusKm", e.target.value.replace(/\D/g, ""))} /></div>
                </>
              )}
            </fieldset>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3">
            <h2 className="font-display text-xl">Previous work &amp; references</h2>
            <p className="-mt-1 text-sm text-mute">Optional. Jo events kiye hain woh batayein taake customers aap par bharosa kar sakein. Just starting out? Press Next.</p>
            <ReferencesEditor value={d.references} onChange={(references) => set("references", references)} />
          </div>
        )}
        {/* stays mounted so chosen photos survive moving between steps */}
        <div className={step === 3 ? "mt-5 grid gap-2" : "hidden"}>
          <p className="label">Photos of your work (optional)</p>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-[3px] border-dashed border-ink/40 p-5 font-bold hover:bg-sand">
            <ImagePlus size={18} /> {previews.length ? `${previews.length} photo${previews.length > 1 ? "s" : ""} selected. Change` : "Choose photos"}
            <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => {
              const chosen = [...(e.target.files ?? [])];
              if (chosen.length > MAX_PHOTOS) { e.target.value = ""; setPreviews([]); setPhotoNote(`Choose up to ${MAX_PHOTOS} for now. Baqi photos dashboard se add kar sakte hain.`); return; }
              setPhotoNote("");
              setPreviews(chosen.map((f) => URL.createObjectURL(f)));
            }} />
          </label>
          {photoNote && <p className="text-sm font-bold text-red">{photoNote}</p>}
          {previews.length > 0 && <div className="flex flex-wrap gap-2">{previews.map((p) => <img key={p} src={p} alt="Chosen work" className="h-16 w-16 rounded-xl border-2 border-ink object-cover" />)}</div>}
          <p className="hint">No photos yet? Koi baat nahi, your card will show an illustration of your craft.</p>
        </div>
        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <h2 className="font-display text-xl sm:col-span-2">Contact details</h2>
            <p className="-mt-2 text-sm text-mute sm:col-span-2">So the Ronaq team can reach you. Customers ko number tab hi dikhega jab aap profile mein on karenge.</p>
            <div className="field"><label className="label" htmlFor="w-phone">Phone</label><input id="w-phone" className="input" inputMode="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0300 1234567" /></div>
            <div className="field"><label className="label" htmlFor="w-wa">WhatsApp (if different)</label><input id="w-wa" className="input" inputMode="tel" value={d.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
            <div className="field sm:col-span-2"><label className="label" htmlFor="w-ref">How did you hear about Ronaq? (optional)</label>
              <Select id="w-ref" className="input" value={d.referralSource} onChange={(e) => set("referralSource", e.target.value)}><option value="">Choose…</option>{heard.map((h) => <option key={h}>{h}</option>)}</Select>
            </div>
          </div>
        )}
      </div>

      <FormMessage state={state} />
      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && <button type="button" className="btn" onClick={() => setStep(step - 1)}>Back</button>}
        {step < LAST_STEP ? (
          <button type="button" className="btn btn-red" disabled={!canNext} onClick={() => setStep(step + 1)}>Next</button>
        ) : (
          <Submit pendingText="Publishing…">Publish my dukaan</Submit>
        )}
        {!canNext && step < LAST_STEP && <p className="text-sm text-mute">{["Choose at least one category.", "Add your business name.", "Choose your city and how you work."][step]}</p>}
      </div>
    </form>
  );
}
