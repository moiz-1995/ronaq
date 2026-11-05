"use client";
import { useActionState, useState, useTransition } from "react";
import { deleteService, saveService } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";
import { PRICING_LABELS } from "@/lib/price";

type Attr = { key: string; label: string; type: string; options: string[]; unit: string | null; required: boolean; vendorDeclared: boolean; help: string | null };
type Svc = { id: string; title: string; description: string | null; pricingModel: string; priceAmount: number | null; minOrder: string | null; occasions: string[]; attributes: Record<string, unknown>; active: boolean };

const OCCASIONS = ["Wedding", "Mehndi", "Barat", "Walima", "Dholki", "Engagement", "Birthday", "Bridal shower", "Aqeeqa", "Eid", "Corporate"];

/** FR-SEL-002: the questions shown depend on the service's category (admin-configurable attributes). */
export function ServiceForm({ svc, priceModels, attrs, canDelete }: { svc: Svc; priceModels: string[]; attrs: Attr[]; canDelete: boolean }) {
  const [state, action] = useActionState(saveService, undefined);
  const [model, setModel] = useState(svc.pricingModel);
  const [pending, start] = useTransition();
  const models = Array.from(new Set([...priceModels, "quote"]));
  return (
    <form action={action} className="mt-6 grid gap-6">
      <input type="hidden" name="id" value={svc.id} />
      <section className="card grid gap-4 bg-white p-5 sm:p-6">
        <div className="field"><label className="label" htmlFor="s-title">Service title</label><input id="s-title" name="title" className="input" defaultValue={svc.title} required maxLength={100} /></div>
        <div className="field"><label className="label" htmlFor="s-desc">What&apos;s included</label><textarea id="s-desc" name="description" className="input" defaultValue={svc.description ?? ""} maxLength={1500} /></div>
        <fieldset className="grid gap-2">
          <legend className="label mb-1">Pricing</legend>
          <div className="flex flex-wrap gap-2">
            {models.map((m) => <label key={m} className="check"><input type="radio" name="pricingModel" value={m} checked={model === m} onChange={() => setModel(m)} className="sr-only" /> {PRICING_LABELS[m as keyof typeof PRICING_LABELS]}</label>)}
          </div>
          {model !== "quote" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="field"><label className="label text-xs" htmlFor="s-amt">Price in PKR {model === "per_person" ? "(per person)" : model === "per_item" ? "(per item)" : model === "starting" ? "(starting from)" : ""}</label><input id="s-amt" name="priceAmount" inputMode="numeric" className="input" defaultValue={svc.priceAmount ?? ""} /></div>
              <div className="field"><label className="label text-xs" htmlFor="s-min">Minimum order (optional)</label><input id="s-min" name="minOrder" className="input" defaultValue={svc.minOrder ?? ""} placeholder="e.g. 50 guests, 20 pieces" /></div>
            </div>
          ) : <p className="rounded-xl bg-sand p-3 text-sm">Families will see “Custom quote” and ask you for a price. You&apos;ll appear after priced vendors when they sort by price.</p>}
        </fieldset>
        <fieldset className="grid gap-2">
          <legend className="label mb-1">Occasions you do</legend>
          <div className="flex flex-wrap gap-2">{OCCASIONS.map((o) => <label key={o} className="check !text-xs"><input type="checkbox" name="occasions" value={o} defaultChecked={svc.occasions.includes(o)} className="sr-only" /> {o}</label>)}</div>
        </fieldset>
      </section>

      {attrs.length > 0 && (
        <section className="card grid gap-5 bg-white p-5 sm:p-6">
          <div><h2 className="font-display text-lg">Details</h2><p className="text-sm text-mute">These help families filter and compare.</p></div>
          {attrs.map((a) => {
            const val = svc.attributes[a.key];
            const name = `attr_${a.key}`;
            return (
              <div key={a.key} className="field">
                <span className="label" id={`lbl-${a.key}`}>{a.label}{a.required && <span className="text-red"> *</span>}{a.vendorDeclared && <span className="ml-2 text-xs font-normal text-mute">(shown as declared by you)</span>}</span>
                {a.type === "boolean" && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name={name} defaultChecked={val === true} className="h-4 w-4 accent-red" aria-labelledby={`lbl-${a.key}`} /> Yes</label>}
                {a.type === "multiselect" && <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`lbl-${a.key}`}>{a.options.map((o) => <label key={o} className="check !text-xs"><input type="checkbox" name={name} value={o} defaultChecked={Array.isArray(val) && val.includes(o)} className="sr-only" /> {o}</label>)}</div>}
                {a.type === "select" && <select name={name} className="input" defaultValue={String(val ?? "")} aria-labelledby={`lbl-${a.key}`}><option value="">Choose…</option>{a.options.map((o) => <option key={o}>{o}</option>)}</select>}
                {a.type === "number" && <div className="flex items-center gap-2"><input name={name} inputMode="numeric" className="input max-w-[160px]" defaultValue={typeof val === "number" ? val : ""} aria-labelledby={`lbl-${a.key}`} />{a.unit && <span className="text-sm text-mute">{a.unit}</span>}</div>}
                {a.type === "text" && <input name={name} className="input" defaultValue={typeof val === "string" ? val : ""} aria-labelledby={`lbl-${a.key}`} />}
                {a.help && <p className="hint">{a.help}</p>}
              </div>
            );
          })}
        </section>
      )}

      <label className="flex items-center gap-2 font-medium"><input type="checkbox" name="active" defaultChecked={svc.active} className="h-4 w-4 accent-red" /> Show this service on my profile</label>
      <FormMessage state={state} />
      <div className="flex flex-wrap justify-between gap-3">
        <Submit>Save service</Submit>
        {canDelete && <button type="button" className="btn btn-sm" disabled={pending} onClick={() => start(() => deleteService(svc.id))}>Delete service</button>}
      </div>
    </form>
  );
}
