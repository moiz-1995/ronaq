"use client";
import { Select } from "@/components/ui/Select";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Trash2, Pencil, X } from "lucide-react";
import { deletePortfolioItem, movePortfolioItem, updatePortfolioItem, uploadPortfolio } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";
import { Picture } from "@/components/art/CraftArt";
import { StatusChip } from "@/components/ui/badges";

type Item = { id: string; imageUrl: string; caption: string | null; tags: string[]; priceExample: string | null; serviceId: string | null; status: string; moderationReason: string | null };
type Svc = { id: string; title: string; art: string };

export function PortfolioManager({ items, services }: { items: Item[]; services: Svc[] }) {
  const [state, action] = useActionState(uploadPortfolio, undefined);
  const [previews, setPreviews] = useState<string[]>([]);
  const ref = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, start] = useTransition();
  useEffect(() => { if (state?.ok) { ref.current?.reset(); setPreviews([]); } }, [state]);
  return (
    <div className="mt-6 grid gap-8">
      <form ref={ref} action={action} className="card grid gap-4 bg-white p-5 sm:p-6">
        <label className={`grid cursor-pointer place-items-center gap-2 rounded-2xl border-[3px] border-dashed border-ink/40 p-8 text-center transition hover:border-red hover:bg-red-soft/40`}>
          <ImagePlus size={32} className="text-red" />
          <span className="font-display">Photos chunein</span>
          <span className="text-sm text-mute">Ek waqt mein 10 tak · JPG, PNG ya WebP · har photo 5 MB tak.</span>
          <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp" className="sr-only"
            onChange={(e) => setPreviews(Array.from(e.target.files ?? []).slice(0, 10).map((f) => URL.createObjectURL(f)))} />
        </label>
        {previews.length > 0 && (
          <>
            <div className="flex gap-2 overflow-x-auto">{previews.map((p) => <img key={p} src={p} alt="" className="h-20 w-20 flex-none rounded-xl border-2 border-ink object-cover" />)}</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="field"><label className="label text-xs" htmlFor="pf-cap">Photo ka caption</label><input id="pf-cap" name="caption" className="input" placeholder="Maslan bridal mehndi, December" /></div>
              <div className="field"><label className="label text-xs" htmlFor="pf-svc">Service</label><Select id="pf-svc" name="serviceId" className="input"><option value="">—</option>{services.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</Select></div>
              <div className="field"><label className="label text-xs" htmlFor="pf-tags">Tags (comma laga kar)</label><input id="pf-tags" name="tags" className="input" placeholder="bridal, arabic, feet" /></div>
              <div className="field"><label className="label text-xs" htmlFor="pf-price">Rate ki misaal (optional)</label><input id="pf-price" name="priceExample" className="input" placeholder="Maslan PKR 15,000 poore haath" /></div>
            </div>
            <div><Submit pendingText="Uploading…">Upload {previews.length} photo{previews.length > 1 ? "s" : ""}</Submit></div>
          </>
        )}
        <FormMessage state={state} />
      </form>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.length === 0 && <li className="col-span-full rounded-2xl border-2 border-dashed border-ink/30 p-8 text-center text-mute">No photos yet.</li>}
        {items.map((it, i) => (
          <li key={it.id} className={`card overflow-hidden bg-white ${pending ? "opacity-70" : ""}`}>
            <div className="relative aspect-square border-b-[3px] border-ink">
              <Picture src={it.imageUrl} alt={it.caption ?? "Portfolio photo"} className="h-full w-full" />
              {it.status !== "visible" && <span className="absolute left-2 top-2"><StatusChip status={it.status} /></span>}
            </div>
            {editing === it.id ? (
              <EditItem it={it} services={services} onDone={() => setEditing(null)} />
            ) : (
              <div className="grid gap-2 p-3">
                <p className="truncate text-sm font-bold">{it.caption ?? <span className="font-normal text-mute">No caption</span>}</p>
                {it.moderationReason && <p className="text-xs text-red">Hidden by Ronaq: {it.moderationReason}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex">
                    <button aria-label="Move earlier" disabled={i === 0} onClick={() => start(() => movePortfolioItem(it.id, -1))} className="rounded p-1.5 hover:bg-sand disabled:opacity-20"><ArrowLeft size={15} /></button>
                    <button aria-label="Move later" disabled={i === items.length - 1} onClick={() => start(() => movePortfolioItem(it.id, 1))} className="rounded p-1.5 hover:bg-sand disabled:opacity-20"><ArrowRight size={15} /></button>
                  </div>
                  <div className="flex">
                    <button aria-label="Edit details" onClick={() => setEditing(it.id)} className="rounded p-1.5 hover:bg-sand"><Pencil size={15} /></button>
                    <button aria-label="Delete photo" onClick={() => start(() => deletePortfolioItem(it.id))} className="rounded p-1.5 hover:bg-red-soft"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditItem({ it, services, onDone }: { it: Item; services: Svc[]; onDone: () => void }) {
  const [state, action] = useActionState(updatePortfolioItem, undefined);
  useEffect(() => { if (state?.ok) onDone(); }, [state, onDone]);
  return (
    <form action={action} className="grid gap-2 p-3">
      <input type="hidden" name="id" value={it.id} />
      <input name="caption" className="input !min-h-9 !py-1 text-sm" defaultValue={it.caption ?? ""} placeholder="Caption" aria-label="Caption" />
      <input name="tags" className="input !min-h-9 !py-1 text-sm" defaultValue={it.tags.join(", ")} placeholder="Tags" aria-label="Tags" />
      <input name="priceExample" className="input !min-h-9 !py-1 text-sm" defaultValue={it.priceExample ?? ""} placeholder="Price example" aria-label="Price example" />
      <Select name="serviceId" className="input !min-h-9 !py-1 text-sm" defaultValue={it.serviceId ?? ""} aria-label="Service"><option value="">—</option>{services.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</Select>
      <div className="flex gap-1"><Submit className="btn btn-sm btn-ink">Save</Submit><button type="button" onClick={onDone} className="btn btn-sm" aria-label="Cancel"><X size={14} /></button></div>
    </form>
  );
}
