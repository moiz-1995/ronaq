"use client";
import { Select } from "@/components/ui/Select";
import { useActionState, useEffect, useRef, useState } from "react";
import { startSelling } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";
import { CraftArt } from "@/components/art/CraftArt";
import { ImagePlus } from "lucide-react";
import { ReferenceFields, ReferencesEditor } from "@/components/vendor/ReferencesEditor";
import type { WorkReference } from "@/lib/references";

type Props = {
  user: { name: string; phone: string | null };
  cities: { id: string; name: string }[];
  areas: { id: string; name: string; cityId: string }[];
  cats: { slug: string; name: string; art: string; description: string }[];
  businessTypes: string[];
  modes: { value: string; label: string }[];
  heard: string[];
};

const STEPS = ["Aap ka kaam", "Aap ki dukaan", "Kahan kaam", "Pichla kaam", "Rabta"];
const LAST_STEP = STEPS.length - 1;
const MAX_PHOTOS = 6;
const DRAFT_KEY = "ronaq-seller-draft";

/** Seller questionnaire (§9.1). Steps are client-side; nothing is lost if you go back. Draft kept in this browser. */
export function SellerWizard({ user, cities, areas, cats, businessTypes, modes, heard }: Props) {
  const [state, action] = useActionState(startSelling, undefined);
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
    modes: [] as string[], phone: user.phone ?? "", whatsapp: "", referralSource: "", references: [] as WorkReference[],
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

      <div ref={card} className="card card-shadow bg-white p-5 sm:p-7">
        {step === 0 && (
          <fieldset className="grid gap-3">
            <legend className="font-display text-xl">Aap kya kaam karte hain?</legend>
            <p className="-mt-1 text-sm text-mute">Jitne bhi kaam karte hain sab chun lein (choose all that apply). Har ek ka apna rate aur tafseel hogi.</p>
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
            <h2 className="font-display text-xl sm:col-span-2">Apni dukaan ke baare mein</h2>
            <div className="field sm:col-span-2"><label className="label" htmlFor="w-name">Dukaan ka naam (Business name)</label><input id="w-name" className="input" value={d.name} onChange={(e) => set("name", e.target.value)} placeholder="Maslan Hina's Henna Studio" /></div>
            <div className="field"><label className="label" htmlFor="w-owner">Maalik ka naam (Owner)</label><input id="w-owner" className="input" value={d.ownerName} onChange={(e) => set("ownerName", e.target.value)} /></div>
            <div className="field"><label className="label" htmlFor="w-type">Karobar ki qisam (Business type)</label>
              <Select id="w-type" className="input" value={d.businessType} onChange={(e) => set("businessType", e.target.value)}><option value="">Chunein…</option>{businessTypes.map((b) => <option key={b}>{b}</option>)}</Select>
            </div>
            <div className="field"><label className="label" htmlFor="w-exp">Kitne saal ka tajurba (Experience)</label><input id="w-exp" className="input" inputMode="numeric" value={d.experienceYears} onChange={(e) => set("experienceYears", e.target.value.replace(/\D/g, ""))} /></div>
            <div className="field sm:col-span-2"><label className="label" htmlFor="w-desc">Apne kaam ke baare mein batayein</label><textarea id="w-desc" className="input" value={d.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} placeholder="Aap ka kaam khaas kyun hai? Log aap ko kyun pasand karte hain?" /><p className="hint">Abhi zaroori nahi. Do teen lines se khareedar ko faisla karna aasan hota hai.</p></div>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-5">
            <h2 className="font-display text-xl">Kahan aur kaise kaam karte hain</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field"><label className="label" htmlFor="w-city">Sheher (City)</label>
                <Select id="w-city" className="input" value={d.cityId} onChange={(e) => setD((x) => ({ ...x, cityId: e.target.value, areaId: "", serviceAreaIds: [] }))}>{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
              </div>
              <div className="field"><label className="label" htmlFor="w-area">Aap ka ilaqa (Base area)</label>
                <Select id="w-area" className="input" value={d.areaId} onChange={(e) => set("areaId", e.target.value)}><option value="">Chunein…</option>{cityAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select>
              </div>
            </div>
            <fieldset className="grid gap-2">
              <legend className="label mb-1">Service kaise dete hain?</legend>
              <div className="flex flex-wrap gap-2">{modes.map((m) => <button type="button" key={m.value} className={`check ${d.modes.includes(m.value) ? "!bg-ink !text-sand" : ""}`} aria-pressed={d.modes.includes(m.value)} onClick={() => toggle("modes", m.value)}>{m.label}</button>)}</div>
            </fieldset>
            <fieldset className="grid gap-2">
              <legend className="label mb-1">Kin ilaqon mein jaate hain?</legend>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={d.servesWholeCity} onChange={(e) => set("servesWholeCity", e.target.checked)} className="h-4 w-4 accent-red" /> Poora sheher</label>
              {!d.servesWholeCity && (
                <>
                  <div className="flex flex-wrap gap-2">{cityAreas.map((a) => <button type="button" key={a.id} className={`check !text-xs ${d.serviceAreaIds.includes(a.id) ? "!bg-ink !text-sand" : ""}`} aria-pressed={d.serviceAreaIds.includes(a.id)} onClick={() => toggle("serviceAreaIds", a.id)}>{a.name}</button>)}</div>
                  <div className="field max-w-xs"><label className="label text-xs" htmlFor="w-rad">…ya apne ilaqe se kitne km tak</label><input id="w-rad" className="input" inputMode="numeric" value={d.serviceRadiusKm} onChange={(e) => set("serviceRadiusKm", e.target.value.replace(/\D/g, ""))} /></div>
                </>
              )}
            </fieldset>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3">
            <h2 className="font-display text-xl">Pichla kaam aur references</h2>
            <p className="-mt-1 text-sm text-mute">Zaroori nahi. Jo events kiye hain woh batayein taake khareedar bharosa kar sakein. Naye hain? Bas Aagay dabayein.</p>
            <ReferencesEditor value={d.references} onChange={(references) => set("references", references)} />
          </div>
        )}
        {/* stays mounted so chosen photos survive moving between steps */}
        <div className={step === 3 ? "mt-5 grid gap-2" : "hidden"}>
          <p className="label">Apne kaam ki photos (optional)</p>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-[3px] border-dashed border-ink/40 p-5 font-bold hover:bg-sand">
            <ImagePlus size={18} /> {previews.length ? `${previews.length} photo chuni gayi. Badlein` : "Photos chunein"}
            <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => {
              const chosen = [...(e.target.files ?? [])];
              if (chosen.length > MAX_PHOTOS) { e.target.value = ""; setPreviews([]); setPhotoNote(`Abhi ${MAX_PHOTOS} tak chunein. Baqi dashboard se add kar sakte hain.`); return; }
              setPhotoNote("");
              setPreviews(chosen.map((f) => URL.createObjectURL(f)));
            }} />
          </label>
          {photoNote && <p className="text-sm font-bold text-red">{photoNote}</p>}
          {previews.length > 0 && <div className="flex flex-wrap gap-2">{previews.map((p) => <img key={p} src={p} alt="Chosen work" className="h-16 w-16 rounded-xl border-2 border-ink object-cover" />)}</div>}
          <p className="hint">Abhi photos nahi? Koi baat nahi. Card par aap ke kaam ki tasveer nazar aayegi.</p>
        </div>
        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <h2 className="font-display text-xl sm:col-span-2">Rabta (Contact details)</h2>
            <p className="-mt-2 text-sm text-mute sm:col-span-2">Ronaq team aap se rabta kar sake. Khareedar ko number tab hi dikhega jab aap khud profile mein on karenge.</p>
            <div className="field"><label className="label" htmlFor="w-phone">Phone</label><input id="w-phone" className="input" inputMode="tel" value={d.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0300 1234567" /></div>
            <div className="field"><label className="label" htmlFor="w-wa">WhatsApp (agar alag hai)</label><input id="w-wa" className="input" inputMode="tel" value={d.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></div>
            <div className="field sm:col-span-2"><label className="label" htmlFor="w-ref">Ronaq ke baare mein kahan se suna? (optional)</label>
              <Select id="w-ref" className="input" value={d.referralSource} onChange={(e) => set("referralSource", e.target.value)}><option value="">Chunein…</option>{heard.map((h) => <option key={h}>{h}</option>)}</Select>
            </div>
          </div>
        )}
      </div>

      <FormMessage state={state} />
      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && <button type="button" className="btn" onClick={() => setStep(step - 1)}>Wapas</button>}
        {step < LAST_STEP ? (
          <button type="button" className="btn btn-red" disabled={!canNext} onClick={() => setStep(step + 1)}>Aagay</button>
        ) : (
          <Submit pendingText="Publish ho raha hai…">Dukaan publish karein</Submit>
        )}
        {!canNext && step < LAST_STEP && <p className="text-sm text-mute">{["Kam az kam ek kaam chunein.", "Dukaan ka naam likhein.", "Sheher aur service ka tareeqa chunein."][step]}</p>}
      </div>
    </form>
  );
}
