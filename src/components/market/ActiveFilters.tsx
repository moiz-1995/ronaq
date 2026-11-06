import Link from "next/link";
import { X } from "lucide-react";
import type { Area, Attribute, Category, City } from "@/db/schema";
import { SERVICE_MODES } from "@/db/catalog";

type SP = Record<string, string | string[] | undefined>;

/** Removable chips for every filter in use, so people can see and undo what's applied without reopening the drawer. */
export function ActiveFilters({ searchParams, basePath, cities, areas, categories, attrs }: { searchParams: SP; basePath: string; cities: City[]; areas: Area[]; categories: Category[]; attrs: Attribute[] }) {
  const chips: { label: string; key: string; value?: string }[] = [];
  const one = (k: string) => (Array.isArray(searchParams[k]) ? searchParams[k]![0] : searchParams[k]) as string | undefined;
  if (one("category")) chips.push({ label: categories.find((c) => c.id === one("category"))?.name ?? "Category", key: "category" });
  if (one("city")) chips.push({ label: cities.find((c) => c.id === one("city"))?.name ?? "City", key: "city" });
  if (one("area")) chips.push({ label: areas.find((a) => a.id === one("area"))?.name ?? "Area", key: "area" });
  if (one("min") || one("max")) chips.push({ label: `PKR ${one("min") ?? "0"}–${one("max") ?? "any"}`, key: "min|max" });
  if (one("quote") === "0") chips.push({ label: "Priced vendors only", key: "quote" });
  if (one("mode")) chips.push({ label: SERVICE_MODES.find((m) => m.value === one("mode"))?.label ?? "Mode", key: "mode" });
  if (one("date")) chips.push({ label: `Free on ${one("date")}`, key: "date" });
  for (const [k, v] of Object.entries(searchParams)) {
    if (!k.startsWith("a_") || !v) continue;
    const def = attrs.find((a) => a.key === k.slice(2));
    for (const val of Array.isArray(v) ? v : [v]) chips.push({ label: def?.type === "boolean" ? def.label : `${def?.label ?? k.slice(2)}: ${val}`, key: k, value: val });
  }
  if (!chips.length) return null;
  const without = (key: string, value?: string) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v == null || k === "page" || key.split("|").includes(k) && value === undefined) continue;
      for (const x of Array.isArray(v) ? v : [v]) if (!(k === key && x === value)) u.append(k, x);
    }
    return `${basePath}?${u}`;
  };
  return (
    <ul className="-mt-1 mb-5 flex flex-wrap gap-2" aria-label="Filters in use">
      {chips.map((c, i) => (
        <li key={i}>
          <Link href={without(c.key, c.value)} scroll={false} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-sun px-3 py-1 text-sm font-bold hover:bg-red hover:text-sand" aria-label={`Remove filter: ${c.label}`}>
            {c.label} <X size={14} />
          </Link>
        </li>
      ))}
      <li><Link href={`${basePath}${one("q") ? `?q=${encodeURIComponent(one("q")!)}` : ""}`} scroll={false} className="inline-flex px-2 py-1 text-sm font-bold text-red underline">Clear all</Link></li>
    </ul>
  );
}
