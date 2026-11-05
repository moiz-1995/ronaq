"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Picture } from "@/components/art/CraftArt";

type Item = { id: string; imageUrl: string; caption: string | null; priceExample: string | null; tags: string[] | null };

/** FR-MKT-011: responsive portfolio gallery with a keyboard-friendly lightbox. */
export function Gallery({ items, vendorName }: { items: Item[]; vendorName: string }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i! + 1) % items.length);
      if (e.key === "ArrowLeft") setOpen((i) => (i! - 1 + items.length) % items.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, items.length]);
  if (!items.length) return <p className="text-mute">No portfolio images yet.</p>;
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it, i) => (
          <li key={it.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
            <button type="button" onClick={() => setOpen(i)} className="group relative block aspect-square w-full overflow-hidden rounded-2xl border-[3px] border-ink" aria-label={`Open photo: ${it.caption ?? "portfolio image"}`}>
              <Picture src={it.imageUrl} alt={it.caption ?? `${vendorName} portfolio`} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
              {it.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-2 pt-6 text-left text-xs font-bold text-sand">{it.caption}</span>}
            </button>
          </li>
        ))}
      </ul>
      {open != null && (
        <div role="dialog" aria-modal="true" aria-label="Portfolio viewer" className="fixed inset-0 z-[70] grid place-items-center bg-ink/90 p-4" onClick={() => setOpen(null)}>
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-square max-h-[80vh] w-full overflow-hidden rounded-3xl border-4 border-sand sm:aspect-[4/3]">
              <Picture src={items[open].imageUrl} alt={items[open].caption ?? "portfolio image"} className="h-full w-full" />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sand">
              <p className="font-bold">{items[open].caption}{items[open].priceExample && <span className="ml-2 font-normal opacity-80">· {items[open].priceExample}</span>}</p>
              <p className="text-sm opacity-70">{open + 1} / {items.length}</p>
            </div>
            <button type="button" onClick={() => setOpen(null)} className="absolute -top-3 right-0 grid h-10 w-10 -translate-y-full place-items-center rounded-full bg-sand text-ink" aria-label="Close"><X /></button>
            <button type="button" onClick={() => setOpen((open - 1 + items.length) % items.length)} className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-[3px] border-ink bg-sand" aria-label="Previous"><ChevronLeft /></button>
            <button type="button" onClick={() => setOpen((open + 1) % items.length)} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border-[3px] border-ink bg-sand" aria-label="Next"><ChevronRight /></button>
          </div>
        </div>
      )}
    </>
  );
}
