"use client";
import { Select } from "@/components/ui/Select";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Trash2, ArrowUp, ArrowDown, Search, MessageCircle, Check, X, Plus } from "lucide-react";
import {
  addChecklistItem, addQuote, deleteItem, deleteQuote, linkVendor, moveItem, selectVendor, setItemStatus, toggleQuoteCommitted, unlinkVendor, updateChecklistItem,
} from "@/app/actions/planner";
import { FormMessage, Submit } from "@/components/ui/form";
import { Picture, VendorLogo } from "@/components/art/CraftArt";
import { STATUS_LABELS } from "@/lib/domain";
import { pkr } from "@/lib/price";
import { formatDate } from "@/lib/time";

type Item = { id: string; label: string; status: string; categoryId: string | null; notes: string | null; budget: number | null; deadline: string | null; selectedVendorId: string | null };
type V = { id: string; name: string; slug: string; coverImage: string | null; logoImage: string | null };
type Q = { id: string; checklistItemId: string; vendorName: string | null; amount: number; unit: string; notes: string | null; quoteDate: string | null; validUntil: string | null; committed: boolean };
type Cat = { id: string; name: string; art: string };

const STATUS_COLORS: Record<string, string> = { not_started: "bg-white", searching: "bg-blue text-sand", shortlisted: "bg-red text-sand", booked: "bg-green text-white", completed: "bg-ink text-sand" };

export function Checklist({ eventId, items, links, quotes, vendors, cats, shortlist, cityId }: {
  eventId: string; items: Item[]; links: { checklistItemId: string; vendorId: string }[]; quotes: Q[]; vendors: V[]; cats: Cat[]; shortlist: V[]; cityId: string | null;
}) {
  const [filter, setFilter] = useState<string>("all");
  const shown = items.filter((i) => filter === "all" || i.status === filter);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {["all", ...Object.keys(STATUS_LABELS)].map((k) => {
          const n = k === "all" ? items.length : items.filter((i) => i.status === k).length;
          return <button key={k} role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={`check !text-xs ${filter === k ? "!bg-ink !text-sand" : ""}`}>{k === "all" ? "All" : STATUS_LABELS[k]} · {n}</button>;
        })}
      </div>
      <ul className="grid gap-3">
        {shown.map((it, idx) => (
          <Row
            key={it.id} it={it} first={idx === 0} last={idx === shown.length - 1}
            linked={vendors.filter((v) => links.some((l) => l.checklistItemId === it.id && l.vendorId === v.id))}
            quotes={quotes.filter((q) => q.checklistItemId === it.id)}
            cat={cats.find((c) => c.id === it.categoryId)} shortlist={shortlist} cityId={cityId} eventId={eventId}
          />
        ))}
        {shown.length === 0 && <li className="rounded-2xl border-2 border-dashed border-ink/30 p-6 text-center text-mute">Nothing here.</li>}
      </ul>
      <AddItem eventId={eventId} cats={cats} />
    </div>
  );
}

function Row({ it, linked, quotes, cat, shortlist, cityId, first, last }: { it: Item; linked: V[]; quotes: Q[]; cat?: Cat; shortlist: V[]; cityId: string | null; first: boolean; last: boolean; eventId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const selected = linked.find((v) => v.id === it.selectedVendorId);
  const lowest = quotes.length ? Math.min(...quotes.map((q) => q.amount)) : null;
  return (
    <li className={`card overflow-hidden bg-white ${pending ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
        <div className="flex flex-col">
          <button aria-label={`Move ${it.label} up`} disabled={first || pending} onClick={() => start(() => moveItem(it.id, -1))} className="rounded p-0.5 hover:bg-sand disabled:opacity-20"><ArrowUp size={14} /></button>
          <button aria-label={`Move ${it.label} down`} disabled={last || pending} onClick={() => start(() => moveItem(it.id, 1))} className="rounded p-0.5 hover:bg-sand disabled:opacity-20"><ArrowDown size={14} /></button>
        </div>
        <span className="h-11 w-11 flex-none overflow-hidden rounded-xl border-2 border-ink">{cat ? <Picture src={null} alt="" fallbackKind={cat.art} seed={3} className="h-full w-full" /> : <span className="grid h-full w-full place-items-center bg-sand font-bold">✎</span>}</span>
        <button className="min-w-0 flex-1 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <p className={`font-bold ${it.status === "completed" ? "line-through opacity-60" : ""}`}>{it.label}</p>
          <p className="truncate text-xs text-mute">
            {selected ? `✓ ${selected.name}` : linked.length ? `${linked.length} vendor${linked.length > 1 ? "s" : ""} linked` : cat ? cat.name : "Your own task"}
            {it.budget ? ` · budget ${pkr(it.budget)}` : ""}{lowest ? ` · best quote ${pkr(lowest)}` : ""}{it.deadline ? ` · due ${formatDate(it.deadline, { day: "numeric", month: "short" })}` : ""}
          </p>
        </button>
        <label className="sr-only" htmlFor={`st-${it.id}`}>Status for {it.label}</label>
        <Select id={`st-${it.id}`} value={it.status} disabled={pending} onChange={(e) => start(() => setItemStatus(it.id, e.target.value))}
          className={`rounded-lg border-2 border-ink px-2 py-1.5 font-display text-[11px] ${STATUS_COLORS[it.status]}`}>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-white text-ink">{v.toUpperCase()}</option>)}
        </Select>
        <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Collapse" : "Expand"} className="rounded-lg p-1.5 hover:bg-sand">{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
      </div>
      {open && (
        <div className="grid gap-5 border-t-2 border-dashed border-ink/20 bg-paper p-4 sm:p-5 lg:grid-cols-2">
          {/* vendors */}
          <section className="grid content-start gap-3">
            <h3 className="font-display text-sm">Vendors</h3>
            {linked.length === 0 && <p className="text-sm text-mute">No vendors linked yet.</p>}
            <ul className="grid gap-2">
              {linked.map((v) => (
                <li key={v.id} className={`flex items-center gap-2 rounded-xl border-2 p-2 ${v.id === it.selectedVendorId ? "border-green bg-[#e5f6ea]" : "border-ink/15 bg-white"}`}>
                  <span className="h-9 w-9 flex-none overflow-hidden rounded-lg border-2 border-ink"><VendorLogo src={v.logoImage} name={v.name} className="h-full w-full" /></span>
                  <Link href={`/v/${v.slug}`} className="min-w-0 flex-1 truncate text-sm font-bold hover:underline">{v.name}</Link>
                  {v.id === it.selectedVendorId ? (
                    <button className="chip bg-green text-white" onClick={() => start(() => selectVendor(it.id, null))} title="Unselect">CHOSEN</button>
                  ) : (
                    <button className="btn btn-sm !min-h-8" onClick={() => start(() => selectVendor(it.id, v.id))}><Check size={13} /> Choose</button>
                  )}
                  <Link className="rounded p-1 hover:bg-sand" href={`/v/${v.slug}/contact?item=${it.id}`} aria-label={`Message ${v.name}`}><MessageCircle size={16} /></Link>
                  <button className="rounded p-1 hover:bg-red-soft" onClick={() => start(() => unlinkVendor(it.id, v.id))} aria-label={`Unlink ${v.name}`}><X size={16} /></button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {shortlist.filter((v) => !linked.some((l) => l.id === v.id)).length > 0 && (
                <Select className="input !min-h-10 !w-auto !py-1.5 text-sm" defaultValue="" aria-label="Link a vendor from your shortlist"
                  onChange={(e) => { const v = e.target.value; if (v) start(() => linkVendor(it.id, v)); e.target.value = ""; }}>
                  <option value="">+ Link from shortlist…</option>
                  {shortlist.filter((v) => !linked.some((l) => l.id === v.id)).map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </Select>
              )}
              {it.categoryId && <Link href={`/marketplace?category=${it.categoryId}${cityId ? `&city=${cityId}` : ""}`} className="btn btn-sm btn-blue"><Search size={14} /> Find vendors</Link>}
            </div>
          </section>

          {/* details */}
          <ItemDetails it={it} />

          {/* quotes */}
          <section className="grid content-start gap-3 lg:col-span-2">
            <h3 className="font-display text-sm">Quotes you&apos;ve recorded</h3>
            <p className="-mt-2 text-xs text-mute">Your own notes of what vendors told you. Ronaq doesn&apos;t verify them.</p>
            {quotes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead><tr className="text-left text-xs text-mute"><th className="py-1">Vendor</th><th>Amount</th><th>Valid until</th><th>Notes</th><th className="text-right">Committed</th><th /></tr></thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr key={q.id} className="border-t border-ink/10">
                        <td className="py-2 font-medium">{q.vendorName ?? "—"}</td>
                        <td className="tabular font-bold">{pkr(q.amount)} <span className="font-normal text-mute">{q.unit !== "total" ? q.unit : ""}</span></td>
                        <td>{q.validUntil ? formatDate(q.validUntil, { day: "numeric", month: "short" }) : "—"}</td>
                        <td className="max-w-[220px] truncate text-mute">{q.notes}</td>
                        <td className="text-right"><button onClick={() => start(() => toggleQuoteCommitted(q.id))} aria-pressed={q.committed} className={`chip ${q.committed ? "bg-green text-white" : "bg-white"}`}>{q.committed ? "YES" : "NO"}</button></td>
                        <td className="text-right"><button onClick={() => start(() => deleteQuote(q.id))} aria-label="Delete quote" className="rounded p-1 hover:bg-red-soft"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <QuoteForm itemId={it.id} vendors={linked} />
          </section>

          <div className="flex flex-wrap justify-between gap-2 lg:col-span-2">
            <span />
            <button className="btn btn-sm" onClick={() => start(() => deleteItem(it.id))}><Trash2 size={14} /> Remove item</button>
          </div>
        </div>
      )}
    </li>
  );
}

function ItemDetails({ it }: { it: Item }) {
  const [state, action] = useActionState(updateChecklistItem, undefined);
  return (
    <form action={action} className="grid content-start gap-3">
      <h3 className="font-display text-sm">Details</h3>
      <input type="hidden" name="id" value={it.id} />
      <div className="field"><label className="label text-xs" htmlFor={`l-${it.id}`}>Name</label><input id={`l-${it.id}`} name="label" className="input" defaultValue={it.label} /></div>
      <div className="grid grid-cols-2 gap-2">
        <div className="field"><label className="label text-xs" htmlFor={`b-${it.id}`}>Budget (PKR)</label><input id={`b-${it.id}`} name="budget" inputMode="numeric" className="input" defaultValue={it.budget ?? ""} /></div>
        <div className="field"><label className="label text-xs" htmlFor={`d-${it.id}`}>Deadline</label><input id={`d-${it.id}`} name="deadline" type="date" className="input" defaultValue={it.deadline ?? ""} /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="remind" className="accent-red" /> Remind me on the deadline</label>
      <div className="field"><label className="label text-xs" htmlFor={`n-${it.id}`}>Notes</label><textarea id={`n-${it.id}`} name="notes" className="input !min-h-20" defaultValue={it.notes ?? ""} /></div>
      <FormMessage state={state} />
      <div><Submit className="btn btn-sm btn-ink">Save details</Submit></div>
    </form>
  );
}

function QuoteForm({ itemId, vendors }: { itemId: string; vendors: V[] }) {
  const [state, action] = useActionState(addQuote, undefined);
  const [open, setOpen] = useState(false);
  if (!open) return <div><button className="btn btn-sm" onClick={() => setOpen(true)}><Plus size={14} /> Record a quote</button></div>;
  return (
    <form action={action} className="grid gap-3 rounded-2xl border-2 border-ink/15 bg-white p-4 sm:grid-cols-3">
      <input type="hidden" name="itemId" value={itemId} />
      <div className="field">
        <label className="label text-xs" htmlFor={`qv-${itemId}`}>Vendor</label>
        {vendors.length ? (
          <Select id={`qv-${itemId}`} name="vendorId" className="input"><option value="">Someone else</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</Select>
        ) : <input id={`qv-${itemId}`} name="vendorName" className="input" placeholder="Vendor name" />}
      </div>
      <div className="field"><label className="label text-xs" htmlFor={`qa-${itemId}`}>Amount (PKR)</label><input id={`qa-${itemId}`} name="amount" inputMode="numeric" className="input" required /></div>
      <div className="field"><label className="label text-xs" htmlFor={`qu-${itemId}`}>Unit</label>
        <Select id={`qu-${itemId}`} name="unit" className="input"><option value="total">Total</option><option value="per person">Per person</option><option value="per item">Per item</option><option value="per day">Per day</option></Select>
      </div>
      <div className="field"><label className="label text-xs" htmlFor={`qd-${itemId}`}>Quote date</label><input id={`qd-${itemId}`} name="quoteDate" type="date" className="input" /></div>
      <div className="field"><label className="label text-xs" htmlFor={`qvu-${itemId}`}>Valid until</label><input id={`qvu-${itemId}`} name="validUntil" type="date" className="input" /></div>
      <label className="flex items-center gap-2 self-end pb-3 text-sm"><input type="checkbox" name="committed" className="accent-green" /> I&apos;ve committed to this</label>
      <div className="field sm:col-span-3"><label className="label text-xs" htmlFor={`qn-${itemId}`}>Notes</label><input id={`qn-${itemId}`} name="notes" className="input" placeholder="e.g. includes zarda, 50% advance" /></div>
      <div className="flex gap-2 sm:col-span-3"><Submit className="btn btn-sm btn-red">Save quote</Submit><button type="button" className="btn btn-sm" onClick={() => setOpen(false)}>Cancel</button></div>
      <div className="sm:col-span-3"><FormMessage state={state} /></div>
    </form>
  );
}

function AddItem({ eventId, cats }: { eventId: string; cats: Cat[] }) {
  const [state, action] = useActionState(addChecklistItem, undefined);
  return (
    <form action={action} className="card grid gap-3 border-dashed bg-sand/50 p-4 sm:grid-cols-[1fr_1fr_160px_auto] sm:items-end">
      <input type="hidden" name="eventId" value={eventId} />
      <div className="field"><label className="label text-xs" htmlFor="ai-cat">Service</label>
        <Select id="ai-cat" name="categoryId" className="input" defaultValue=""><option value="">Custom task (no category)</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
      </div>
      <div className="field"><label className="label text-xs" htmlFor="ai-label">Name</label><input id="ai-label" name="label" className="input" placeholder="e.g. Book shuttle for guests" /></div>
      <div className="field"><label className="label text-xs" htmlFor="ai-b">Budget (PKR)</label><input id="ai-b" name="budget" inputMode="numeric" className="input" /></div>
      <Submit className="btn btn-red"><Plus size={16} /> Add</Submit>
      {state?.error && <div className="sm:col-span-4"><FormMessage state={state} /></div>}
    </form>
  );
}

