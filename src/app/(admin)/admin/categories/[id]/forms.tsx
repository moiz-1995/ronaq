"use client";
import { useActionState, useState, useTransition } from "react";
import { Trash2, Pencil, Plus } from "lucide-react";
import { deleteAttribute, saveAttribute, saveCategory } from "@/app/actions/admin";
import { FormMessage, Submit } from "@/components/ui/form";
import { PRICING_LABELS } from "@/lib/price";
import { CraftArt } from "@/components/art/CraftArt";

const ARTS = ["henna", "makeup", "daig", "decor", "camera", "cake", "gift", "stitch", "dhol", "rental"];
type Cat = { id: string; name: string; slug: string; description: string | null; noun: string; art: string; priceModels: string[]; active: boolean; sortOrder: number };
type Attr = { id: string; key: string; label: string; type: string; options: string[]; unit: string | null; required: boolean; filterable: boolean; showOnProfile: boolean; vendorDeclared: boolean; help: string | null; sortOrder: number };

export function CategoryForm({ cat }: { cat: Cat | null }) {
  const [state, action] = useActionState(saveCategory, undefined);
  const [art, setArt] = useState(cat?.art ?? "henna");
  return (
    <form action={action} className="grid content-start gap-3 rounded-2xl border-[3px] border-ink bg-white p-5">
      {cat && <input type="hidden" name="id" value={cat.id} />}
      <h2 className="font-display">Category</h2>
      <div className="field"><label className="label text-xs" htmlFor="c-name">Name</label><input id="c-name" name="name" className="input" defaultValue={cat?.name} required /></div>
      <div className="field"><label className="label text-xs" htmlFor="c-slug">URL slug</label><input id="c-slug" name="slug" className="input font-mono" defaultValue={cat?.slug} placeholder="auto from name" /></div>
      <div className="field"><label className="label text-xs" htmlFor="c-noun">Vendor noun</label><input id="c-noun" name="noun" className="input" defaultValue={cat?.noun ?? "vendors"} placeholder="artists, kitchens…" /></div>
      <div className="field"><label className="label text-xs" htmlFor="c-desc">Description</label><textarea id="c-desc" name="description" className="input !min-h-20" defaultValue={cat?.description ?? ""} /></div>
      <fieldset><legend className="label mb-1 text-xs">Default illustration</legend>
        <div className="grid grid-cols-5 gap-1.5">{ARTS.map((a) => (
          <label key={a} className={`cursor-pointer overflow-hidden rounded-lg border-2 ${art === a ? "border-red ring-2 ring-red" : "border-ink/20"}`}>
            <input type="radio" name="art" value={a} checked={art === a} onChange={() => setArt(a)} className="sr-only" />
            <CraftArt kind={a} seed={1} className="aspect-square w-full" label={a} />
          </label>
        ))}</div>
      </fieldset>
      <fieldset><legend className="label mb-1 text-xs">Pricing models sellers can use</legend>
        <div className="flex flex-wrap gap-1.5">{Object.entries(PRICING_LABELS).map(([k, l]) => <label key={k} className="check !text-xs"><input type="checkbox" name="priceModels" value={k} defaultChecked={cat?.priceModels.includes(k) ?? k === "quote"} className="sr-only" /> {l}</label>)}</div>
      </fieldset>
      <div className="grid grid-cols-2 gap-2">
        <div className="field"><label className="label text-xs" htmlFor="c-sort">Sort order</label><input id="c-sort" name="sortOrder" type="number" className="input" defaultValue={cat?.sortOrder ?? 99} /></div>
        <label className="flex items-center gap-2 self-end pb-3 text-sm"><input type="checkbox" name="active" defaultChecked={cat?.active ?? true} className="accent-red" /> Visible</label>
      </div>
      <FormMessage state={state} />
      <Submit className="btn btn-sm btn-red">{cat ? "Save category" : "Create category"}</Submit>
    </form>
  );
}

export function AttributeEditor({ categoryId, attrs }: { categoryId: string; attrs: Attr[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <section className="grid content-start gap-3">
      <div className="flex items-center justify-between"><h2 className="font-display text-lg">Attributes</h2><button className="btn btn-sm" onClick={() => setEditing("new")}><Plus size={14} /> Add attribute</button></div>
      {editing === "new" && <AttrForm categoryId={categoryId} onDone={() => setEditing(null)} />}
      <ul className="grid gap-2">
        {attrs.map((a) => (
          <li key={a.id} className="rounded-2xl border-2 border-ink/10 bg-white p-4">
            {editing === a.id ? <AttrForm categoryId={categoryId} a={a} onDone={() => setEditing(null)} /> : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{a.label} <span className="font-mono text-xs text-mute">{a.key}</span></p>
                  <p className="text-sm text-mute">{a.type}{a.options.length ? `: ${a.options.join(", ")}` : ""}{a.unit ? ` (${a.unit})` : ""}</p>
                  <p className="mt-1 flex flex-wrap gap-1">{a.required && <span className="chip bg-red text-sand">REQUIRED</span>}{a.filterable && <span className="chip bg-blue text-sand">FILTER</span>}{a.showOnProfile && <span className="chip bg-white">ON PROFILE</span>}{a.vendorDeclared && <span className="chip bg-sand">VENDOR-DECLARED</span>}</p>
                </div>
                <div className="flex gap-1">
                  <button className="rounded p-1.5 hover:bg-sand" aria-label={`Edit ${a.label}`} onClick={() => setEditing(a.id)}><Pencil size={15} /></button>
                  <button className="rounded p-1.5 hover:bg-red-soft" aria-label={`Delete ${a.label}`} disabled={pending} onClick={() => start(() => deleteAttribute(a.id))}><Trash2 size={15} /></button>
                </div>
              </div>
            )}
          </li>
        ))}
        {attrs.length === 0 && <li className="rounded-2xl border-2 border-dashed border-ink/20 p-6 text-center text-mute">No attributes yet.</li>}
      </ul>
    </section>
  );
}

function AttrForm({ categoryId, a, onDone }: { categoryId: string; a?: Attr; onDone: () => void }) {
  const [state, action] = useActionState(saveAttribute, undefined);
  const [type, setType] = useState(a?.type ?? "select");
  return (
    <form action={action} className="grid gap-3 rounded-2xl border-[3px] border-ink bg-white p-4 sm:grid-cols-2">
      <input type="hidden" name="categoryId" value={categoryId} />
      {a && <input type="hidden" name="id" value={a.id} />}
      <div className="field"><label className="label text-xs" htmlFor="a-label">Label</label><input id="a-label" name="label" className="input" defaultValue={a?.label} required /></div>
      <div className="field"><label className="label text-xs" htmlFor="a-key">Key</label><input id="a-key" name="key" className="input font-mono" defaultValue={a?.key} placeholder="auto from label" /></div>
      <div className="field"><label className="label text-xs" htmlFor="a-type">Type</label>
        <select id="a-type" name="type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="select">Single choice</option><option value="multiselect">Multiple choice</option><option value="boolean">Yes / no</option><option value="number">Number</option><option value="text">Text</option>
        </select>
      </div>
      <div className="field"><label className="label text-xs" htmlFor="a-unit">Unit (optional)</label><input id="a-unit" name="unit" className="input" defaultValue={a?.unit ?? ""} placeholder="guests, hours…" /></div>
      {(type === "select" || type === "multiselect") && <div className="field sm:col-span-2"><label className="label text-xs" htmlFor="a-opt">Options (one per line)</label><textarea id="a-opt" name="options" className="input" defaultValue={a?.options.join("\n")} /></div>}
      <div className="field sm:col-span-2"><label className="label text-xs" htmlFor="a-help">Help text</label><input id="a-help" name="help" className="input" defaultValue={a?.help ?? ""} /></div>
      <div className="flex flex-wrap gap-3 text-sm sm:col-span-2">
        <label className="flex items-center gap-1.5"><input type="checkbox" name="required" defaultChecked={a?.required} className="accent-red" /> Required</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" name="filterable" defaultChecked={a?.filterable} className="accent-red" /> Use as filter</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" name="showOnProfile" defaultChecked={a?.showOnProfile ?? true} className="accent-red" /> Show on profile</label>
        <label className="flex items-center gap-1.5"><input type="checkbox" name="vendorDeclared" defaultChecked={a?.vendorDeclared} className="accent-red" /> Vendor-declared claim</label>
        <label className="flex items-center gap-1.5">Order <input name="sortOrder" type="number" defaultValue={a?.sortOrder ?? 0} className="input !min-h-8 !w-16 !py-0.5" aria-label="Sort order" /></label>
      </div>
      <div className="sm:col-span-2"><FormMessage state={state} /></div>
      <div className="flex gap-2"><Submit className="btn btn-sm btn-ink">Save attribute</Submit><button type="button" className="btn btn-sm" onClick={onDone}>Close</button></div>
    </form>
  );
}
