"use client";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { deletePortfolioItem, uploadPortfolio } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";
import { Picture } from "@/components/art/CraftArt";

type Sample = { id: string; imageUrl: string; caption: string | null };

/** "Add your samples": photos of this service's work. They also appear in the vendor's portfolio. */
export function ServiceSamples({ serviceId, serviceTitle, samples }: { serviceId: string; serviceTitle: string; samples: Sample[] }) {
  const [state, action] = useActionState(uploadPortfolio, undefined);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) { ref.current?.reset(); setPreviews([]); } }, [state]);
  return (
    <section id="samples" className="card mt-6 grid scroll-mt-24 gap-4 bg-white p-5 sm:p-6">
      <div>
        <h2 className="font-display text-lg">Add your samples</h2>
        <p className="mt-1 text-sm text-mute">Photos of your {serviceTitle.toLowerCase()} work. Customers yahi dekh kar faisla karte hain. They also show in your portfolio.</p>
      </div>
      {samples.length > 0 && (
        <ul className={`grid grid-cols-3 gap-3 sm:grid-cols-4 ${pending ? "opacity-70" : ""}`}>
          {samples.map((s) => (
            <li key={s.id} className="relative overflow-hidden rounded-xl border-2 border-ink">
              <div className="aspect-square"><Picture src={s.imageUrl} alt={s.caption ?? `${serviceTitle} sample`} className="h-full w-full" /></div>
              <button type="button" onClick={() => start(() => deletePortfolioItem(s.id))} aria-label="Delete sample" className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-white hover:bg-red-soft"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      <form ref={ref} action={action} className="grid gap-3">
        <input type="hidden" name="serviceId" value={serviceId} />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-[3px] border-dashed border-ink/40 p-5 font-bold transition hover:border-red hover:bg-red-soft/40">
          <ImagePlus size={20} className="text-red" /> {previews.length ? `${previews.length} photo${previews.length > 1 ? "s" : ""} selected. Change` : "Choose sample photos"}
          <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp" className="sr-only"
            onChange={(e) => setPreviews(Array.from(e.target.files ?? []).slice(0, 10).map((f) => URL.createObjectURL(f)))} />
        </label>
        {previews.length > 0 && (
          <>
            <div className="flex gap-2 overflow-x-auto">{previews.map((p) => <img key={p} src={p} alt="" className="h-16 w-16 flex-none rounded-xl border-2 border-ink object-cover" />)}</div>
            <div className="field"><label className="label text-xs" htmlFor="smp-cap">Caption (optional)</label><input id="smp-cap" name="caption" className="input" placeholder="e.g. Bridal mehndi, December" /></div>
            <div><Submit pendingText="Uploading…">Upload {previews.length} sample{previews.length > 1 ? "s" : ""}</Submit></div>
          </>
        )}
        <p className="hint">Up to 10 at a time · JPG, PNG or WebP · 5 MB each.</p>
        <FormMessage state={state} />
      </form>
    </section>
  );
}
