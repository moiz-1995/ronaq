"use client";
import { Select } from "@/components/ui/Select";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Attribute, Area, Category, City } from "@/db/schema";
import { SERVICE_MODES } from "@/db/catalog";
import { PRICING_LABELS } from "@/lib/price";
import { BudgetRange } from "./BudgetRange";

type Props = {
  cities: City[];
  areas: Area[];
  categories: Category[];
  attributes: Attribute[];
  fixedCategory?: Category | null;
};

// Filters and sort open the results with a normal page load. In-page navigation was occasionally cancelled
// mid-flight in production, which left people pressing "Show results" with nothing happening.
const go = (href: string) => window.location.assign(href);

/** FR-MKT-003…008: only the filters that make sense for the chosen category appear. */
export function Filters({ cities, areas, categories, attributes, fixedCategory }: Props) {
  const path = usePathname();
  const sp = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [city, setCity] = useState(sp.get("city") ?? "");
  const [open, setOpen] = useState(false);
  const category = fixedCategory ?? categories.find((c) => c.id === sp.get("category"));
  const filterable = attributes.filter((a) => a.filterable);
  const unitHint = category?.priceModels?.filter((m) => m !== "quote").map((m) => PRICING_LABELS[m as keyof typeof PRICING_LABELS].toLowerCase()).join(" / ");

  const apply = () => {
    const fd = new FormData(formRef.current!);
    const qs = new URLSearchParams();
    for (const [k, v] of fd.entries()) if (typeof v === "string" && v !== "") qs.append(k, v);
    if (!fd.get("quote")) qs.set("quote", "0");
    else qs.delete("quote");
    go(`${path}?${qs.toString()}`);
  };
  const clear = () => {
    const keep = new URLSearchParams();
    if (sp.get("q")) keep.set("q", sp.get("q")!);
    go(`${path}?${keep}`);
    setCity("");
  };
  const count = [...new Set([...sp.keys()].filter((k) => !["q", "sort", "page", "quote"].includes(k)))].length;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="filter-drawer" className={`btn btn-sm ${count ? "btn-ink" : ""}`}>
        <SlidersHorizontal size={16} /> Filters{count ? ` · ${count}` : ""}
      </button>
      <div className={`fixed inset-0 z-50 transition-colors duration-300 ${open ? "bg-ink/55" : "pointer-events-none bg-transparent"}`} onClick={() => setOpen(false)} aria-hidden={!open}>
        <form
          id="filter-drawer"
          ref={formRef}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          onSubmit={(e) => { e.preventDefault(); apply(); setOpen(false); }}
          className={`absolute inset-y-0 left-0 grid w-[min(380px,90vw)] content-start gap-5 overflow-y-auto border-r-4 border-ink bg-paper p-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pt-[calc(20px+env(safe-area-inset-top,0px))] shadow-[8px_0_0_var(--color-red)] transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-[110%]"}`}
          aria-label="Filters"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Filters</h2>
            <div className="flex items-center gap-1">
              {count > 0 && <button type="button" onClick={clear} className="text-sm font-bold text-red underline">Clear all</button>}
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-sand" aria-label="Close filters"><X size={18} /></button>
            </div>
          </div>
          {sp.get("q") && <input type="hidden" name="q" value={sp.get("q")!} />}
          {sp.get("sort") && <input type="hidden" name="sort" value={sp.get("sort")!} />}

          {!fixedCategory && (
            <div className="field">
              <label className="label" htmlFor="f-cat">Category</label>
              <Select id="f-cat" name="category" className="input" defaultValue={sp.get("category") ?? ""}>
                <option value="">All categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
          )}

          <div className="field">
            <label className="label" htmlFor="f-city">City</label>
            <Select id="f-city" name="city" className="input" value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Any city</option>
              {cities.map((c) => <option key={c.id} value={c.id} disabled={!c.active}>{c.name}{c.active ? "" : " (coming soon)"}</option>)}
            </Select>
          </div>
          {city && (
            <div className="field">
              <label className="label" htmlFor="f-area">Area or sector</label>
              <Select id="f-area" name="area" className="input" defaultValue={sp.get("area") ?? ""}>
                <option value="">Anywhere in the city</option>
                {areas.filter((a) => a.cityId === city).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
              <p className="hint">Shows vendors who serve this area.</p>
            </div>
          )}

          <fieldset className="grid gap-2">
            <legend className="label mb-1">Budget</legend>
            <BudgetRange key={`${sp.get("min")}-${sp.get("max")}`} min={sp.get("min")} max={sp.get("max")} />
            {unitHint && <p className="hint">Prices in this category are {unitHint}.</p>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="quote" value="1" defaultChecked={sp.get("quote") !== "0"} className="accent-red" /> Include vendors who give custom quotes</label>
          </fieldset>

          <div className="field">
            <label className="label" htmlFor="f-mode">How they work</label>
            <Select id="f-mode" name="mode" className="input" defaultValue={sp.get("mode") ?? ""}>
              <option value="">Any</option>
              {SERVICE_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </Select>
          </div>

          <div className="field">
            <label className="label" htmlFor="f-date">Available on</label>
            <input id="f-date" type="date" name="date" className="input" defaultValue={sp.get("date") ?? ""} />
            <p className="hint">Based on the vendor&apos;s own calendar. Confirm directly with them.</p>
          </div>

          {filterable.map((a) => (
            <fieldset key={a.id} className="grid gap-2">
              <legend className="label mb-1">{a.label}{a.vendorDeclared && <span className="ml-1 text-xs font-normal text-mute">(vendor-declared)</span>}</legend>
              {a.type === "boolean" ? (
                <label className="check w-fit"><input type="checkbox" name={`a_${a.key}`} value="true" defaultChecked={sp.getAll(`a_${a.key}`).includes("true")} /> Yes</label>
              ) : a.type === "number" ? (
                <input name={`a_${a.key}`} inputMode="numeric" placeholder={`At least… ${a.unit ?? ""}`} className="input" defaultValue={sp.get(`a_${a.key}`) ?? ""} aria-label={a.label} />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(a.options ?? []).map((o) => (
                    <label key={o} className="check"><input type="checkbox" className="sr-only" name={`a_${a.key}`} value={o} defaultChecked={sp.getAll(`a_${a.key}`).includes(o)} /> {o}</label>
                  ))}
                </div>
              )}
            </fieldset>
          ))}

          <div className="sticky -bottom-5 -mx-5 border-t-2 border-ink/10 bg-paper px-5 pb-1 pt-3"><button type="submit" className="btn btn-red w-full">Show results</button></div>
        </form>
      </div>
    </>
  );
}

export function SortSelect() {
  const path = usePathname();
  const sp = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-sm font-bold">
      Sort
      <Select
        className="input !min-h-10 !w-auto !py-1.5"
        value={sp.get("sort") ?? "relevance"}
        onChange={(e) => {
          const qs = new URLSearchParams(sp);
          qs.set("sort", e.target.value);
          qs.delete("page");
          go(`${path}?${qs}`);
        }}
      >
        <option value="relevance">Best match</option>
        <option value="rating">Highest rated</option>
        <option value="price">Lowest listed price</option>
        <option value="newest">Newest</option>
        {sp.get("area") && <option value="distance">Nearest</option>}
      </Select>
    </label>
  );
}
