// Small admin building blocks: page header, stat tile, single-series bar list.

export function AdminHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-ink bg-white px-4 py-5 sm:px-8">
      <div><h1 className="h-display text-3xl">{title}</h1>{sub && <p className="mt-1 text-sm text-mute">{sub}</p>}</div>
      {children}
    </header>
  );
}

export function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink/10 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-mute">{label}</p>
      <p className="mt-1 font-display text-3xl tabular">{typeof value === "number" ? value.toLocaleString("en-PK") : value}</p>
      {hint && <p className="text-xs text-mute">{hint}</p>}
    </div>
  );
}

/**
 * One-series horizontal bars (magnitude → one hue, no legend; the title names the series).
 * Values sit at the bar end in text ink; hover shows the exact value; a table view sits behind <details>.
 */
export function BarList({ title, rows, unit = "" }: { title: string; rows: { label: string; value: number }[]; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <figure className="rounded-2xl border-2 border-ink/10 bg-white p-5">
      <figcaption className="font-display text-base">{title}</figcaption>
      <ul className="mt-4 grid gap-2.5">
        {rows.map((r) => (
          <li key={r.label} className="group grid grid-cols-[minmax(90px,140px)_1fr_auto] items-center gap-3 text-sm" title={`${r.label}: ${r.value.toLocaleString("en-PK")}${unit}`}>
            <span className="truncate text-mute">{r.label}</span>
            <span className="relative h-3.5 rounded-r bg-transparent">
              <span className="absolute inset-y-0 left-0 rounded-r-[4px] bg-blue transition-[filter] group-hover:brightness-110" style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value ? 3 : 0 }} />
            </span>
            <span className="tabular font-bold">{r.value.toLocaleString("en-PK")}{unit}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-mute">No data yet for this filter.</li>}
      </ul>
      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-mute">Table view</summary>
        <table className="mt-2 w-full"><tbody>{rows.map((r) => <tr key={r.label} className="border-t border-ink/10"><td className="py-1">{r.label}</td><td className="text-right tabular">{r.value}</td></tr>)}</tbody></table>
      </details>
    </figure>
  );
}
