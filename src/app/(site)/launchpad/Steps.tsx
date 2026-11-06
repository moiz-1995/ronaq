"use client";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { Plus, X, Sparkles } from "lucide-react";
import { finishLaunchpad, launchpadChecklist, launchpadDates, launchpadSkipTo } from "@/app/actions/planner";
import { FormMessage, Submit } from "@/components/ui/form";
import { CraftArt } from "@/components/art/CraftArt";
import { Confetti } from "@/components/ui/Confetti";
import { GuestPicker } from "@/components/planner/GuestPicker";

type Tpl = { slug: string; name: string; items: { label: string; categorySlug?: string }[] };

export function ChecklistStep({ templates, cats, existing, initialTemplate }: { templates: Tpl[]; cats: { slug: string; name: string; art: string }[]; existing: string[]; initialTemplate: string }) {
  const [state, action] = useActionState(launchpadChecklist, undefined);
  const [tpl, setTpl] = useState(initialTemplate);
  const [pending, start] = useTransition();
  const t = templates.find((x) => x.slug === tpl)!;
  const [items, setItems] = useState<{ label: string; categorySlug?: string; on: boolean }[]>([]);
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  useEffect(() => { setItems(t.items.map((i) => ({ ...i, on: true }))); }, [t]);
  const extra = useMemo(() => cats.filter((c) => !items.some((i) => i.categorySlug === c.slug)), [cats, items]);
  return (
    <form action={action} className="grid gap-6">
      <section>
        <h2 className="font-display text-xl">1. Start from a template</h2>
        <p className="text-sm text-mute">Nothing is mandatory. Untick what you don&apos;t need.</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-sun px-3 py-2 text-sm font-bold">✦ These are just templates to get you started. Ap ki ronaq, ap ki marzi! Add, remove or rename anything.</p>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Templates">
          {templates.map((x) => (
            <label key={x.slug} className="check"><input type="radio" name="template" value={x.slug} checked={tpl === x.slug} onChange={() => setTpl(x.slug)} className="sr-only" /> {x.name}</label>
          ))}
        </div>
      </section>
      <section className="card bg-white p-5">
        {existing.length > 0 && <p className="mb-3 rounded-lg bg-sand px-3 py-2 text-sm">Already on your checklist: {existing.join(", ")}. New picks are added alongside.</p>}
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((it, i) => {
            const cat = cats.find((c) => c.slug === it.categorySlug);
            return (
              <li key={it.label + i}>
                <label className={`flex items-center gap-3 rounded-xl border-2 p-2 pr-3 ${it.on ? "border-ink bg-white" : "border-ink/20 bg-paper opacity-60"}`}>
                  <input type="checkbox" name="item" value={`${it.label}|${it.categorySlug ?? ""}`} checked={it.on} onChange={() => setItems((xs) => xs.map((x, k) => (k === i ? { ...x, on: !x.on } : x)))} className="h-5 w-5 accent-red" />
                  <span className="h-10 w-10 flex-none overflow-hidden rounded-lg border-2 border-ink">{cat ? <CraftArt kind={cat.art} seed={i} className="h-full w-full" /> : <span className="grid h-full w-full place-items-center bg-sand text-xs font-bold">✎</span>}</span>
                  <span className="font-medium">{it.label}<small className="block text-xs text-mute">{cat ? cat.name : "Your own task"}</small></span>
                </label>
              </li>
            );
          })}
          {custom.map((c, i) => (
            <li key={"c" + i} className="flex items-center gap-3 rounded-xl border-2 border-ink bg-white p-2 pr-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg border-2 border-ink bg-sand text-xs font-bold">✎</span>
              <span className="flex-1 font-medium">{c}</span>
              <button type="button" onClick={() => setCustom((xs) => xs.filter((_, k) => k !== i))} aria-label={`Remove ${c}`} className="rounded p-1 hover:bg-sand"><X size={16} /></button>
            </li>
          ))}
        </ul>
        <input type="hidden" name="custom" value={custom.join("\n")} />
        {extra.length > 0 && (
          <div className="mt-4">
            <p className="label">Add a service</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {extra.map((c) => (
                <button key={c.slug} type="button" className="check" onClick={() => setItems((xs) => [...xs, { label: c.name, categorySlug: c.slug, on: true }])}><Plus size={14} /> {c.name}</button>
              ))}
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <label className="sr-only" htmlFor="custom-item">Add your own task</label>
          <input id="custom-item" className="input" placeholder="Add your own, e.g. “Book the shuttle for guests”" value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (draft.trim()) { setCustom((xs) => [...xs, draft.trim()]); setDraft(""); } } }} />
          <button type="button" className="btn btn-sm" onClick={() => { if (draft.trim()) { setCustom((xs) => [...xs, draft.trim()]); setDraft(""); } }}>Add</button>
        </div>
      </section>
      <FormMessage state={state} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Submit pendingText="Saving…">Save &amp; continue</Submit>
        <button type="button" className="btn btn-sm" disabled={pending} onClick={() => start(() => launchpadSkipTo(2))}>Skip for now →</button>
      </div>
    </form>
  );
}

type EvLite = { name: string; type: string; label: string | null; date: string | null; time: string | null; location: string | null; guestCount: number | null; budget: number | null; description: string | null } | null;

export function DatesStep({ types, ev }: { types: { value: string; label: string; heading: string }[]; ev: EvLite }) {
  const [state, action] = useActionState(launchpadDates, undefined);
  const [type, setType] = useState(ev?.type ?? "wedding");
  const [label, setLabel] = useState(ev?.label ?? types.find((t) => t.value === (ev?.type ?? "wedding"))?.heading ?? "");
  const [sec, setSec] = useState<{ name: string; date: string }[]>([]);
  const [pending, start] = useTransition();
  return (
    <form action={action} className="grid gap-6">
      <div className="card grid gap-5 bg-white p-5 sm:p-7">
        <div className="dot-bg rounded-2xl p-5 text-sand">
          <p className="text-xs uppercase tracking-widest text-sand/60">Your dashboard will say</p>
          <p className="font-display text-[clamp(1.8rem,5vw,2.8rem)] leading-none text-[#ff6b72]">{label.trim() ? `${label.trim()} ki Ronaq` : "Ap ki Ronaq"}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field sm:col-span-2"><label className="label" htmlFor="name">Event name</label><input id="name" name="name" className="input" required defaultValue={ev?.name ?? ""} placeholder="e.g. Ayesha & Bilal's wedding" /></div>
          <div className="field">
            <label className="label" htmlFor="type">Type</label>
            <select id="type" name="type" className="input" value={type} onChange={(e) => { setType(e.target.value); setLabel(types.find((t) => t.value === e.target.value)?.heading ?? ""); }}>
              {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="field"><label className="label" htmlFor="label">Heading word</label><input id="label" name="label" className="input" value={label} maxLength={28} onChange={(e) => setLabel(e.target.value)} placeholder="Shaadi" /><p className="hint">Appears as “{label || "…"} ki Ronaq”.</p></div>
          <div className="field"><label className="label" htmlFor="date">Date</label><input id="date" name="date" type="date" className="input" defaultValue={ev?.date ?? ""} /><p className="hint">Not sure yet? Leave it blank and add it later.</p></div>
          <div className="field"><label className="label" htmlFor="location">Location (optional)</label><input id="location" name="location" className="input" defaultValue={ev?.location ?? ""} placeholder="e.g. Marquee on GT Road" /></div>
          <GuestPicker defaultValue={ev?.guestCount} label="Guests (optional)" />
          <div className="field"><label className="label" htmlFor="budget">Overall budget, PKR (optional)</label><input id="budget" name="budget" inputMode="numeric" className="input" defaultValue={ev?.budget ?? ""} /></div>
          <div className="field sm:col-span-2"><label className="label" htmlFor="description">Notes (optional)</label><textarea id="description" name="description" className="input" defaultValue={ev?.description ?? ""} /></div>
        </div>
      </div>
      <div className="card grid gap-3 bg-white p-5 sm:p-7">
        <h2 className="font-display text-lg">Other functions <span className="font-sans text-sm font-normal text-mute">(optional)</span></h2>
        <p className="text-sm text-mute">Dholki, mehndi, walima… they go on your calendar without replacing the main countdown.</p>
        {sec.map((x, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_auto] items-end gap-2">
            <input name="secName" className="input" value={x.name} onChange={(e) => setSec((xs) => xs.map((y, k) => (k === i ? { ...y, name: e.target.value } : y)))} placeholder="e.g. Mehndi night" aria-label="Function name" />
            <input name="secDate" type="date" className="input" value={x.date} onChange={(e) => setSec((xs) => xs.map((y, k) => (k === i ? { ...y, date: e.target.value } : y)))} aria-label="Function date" />
            <button type="button" onClick={() => setSec((xs) => xs.filter((_, k) => k !== i))} className="btn btn-sm" aria-label="Remove"><X size={14} /></button>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {["Dholki", "Mehndi", "Barat", "Walima"].map((n) => <button key={n} type="button" className="check" onClick={() => setSec((xs) => [...xs, { name: n, date: "" }])}><Plus size={14} /> {n}</button>)}
          <button type="button" className="check" onClick={() => setSec((xs) => [...xs, { name: "", date: "" }])}><Plus size={14} /> Other</button>
        </div>
      </div>
      <FormMessage state={state} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Submit pendingText="Saving…">Save &amp; continue</Submit>
        <button type="button" className="btn btn-sm" disabled={pending} onClick={() => start(() => launchpadSkipTo(3))}>Skip, I&apos;ll add it later →</button>
      </div>
    </form>
  );
}

export function MarketStep({ cats, hasEvent }: { cats: { slug: string; name: string; art: string }[]; hasEvent: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="card relative grid gap-6 overflow-hidden bg-white p-6 sm:p-8">
      <Confetti />
      <div className="flex items-center gap-3"><Sparkles className="text-red" /><h2 className="h-display text-3xl">You&apos;re all set!</h2></div>
      <p className="max-w-[56ch] text-mute">{hasEvent ? "Your dashboard is ready. The marketplace will show what's still on your checklist first, and every other category is one tap away." : "Head into the marketplace. You can come back and plan any time from your dashboard."}</p>
      {cats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cats.slice(0, 8).map((c, i) => (
            <Link key={c.slug} href={`/c/${c.slug}`} className="card overflow-hidden transition hover:-translate-y-1">
              <div className="aspect-square border-b-[3px] border-ink"><CraftArt kind={c.art} seed={i + 30} className="h-full w-full" /></div>
              <p className="p-2 text-center font-display text-xs">{c.name}</p>
            </Link>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <button className="btn btn-red" disabled={pending} onClick={() => start(() => finishLaunchpad())}>Open the marketplace</button>
        <Link href="/dashboard" className="btn">Go to my dashboard</Link>
      </div>
    </div>
  );
}
