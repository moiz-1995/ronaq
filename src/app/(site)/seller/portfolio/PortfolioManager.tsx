"use client";
import { Select } from "@/components/ui/Select";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, FolderPlus, ImagePlus, Pencil, Trash2, X } from "lucide-react";
import { createAlbum, deleteAlbum, deletePortfolioItem, movePhotosToAlbum, movePortfolioItem, renameAlbum, updatePortfolioItem, uploadPortfolio } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";
import { Picture } from "@/components/art/CraftArt";
import { StatusChip } from "@/components/ui/badges";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type Item = { id: string; imageUrl: string; caption: string | null; tags: string[]; priceExample: string | null; serviceId: string | null; albumId: string | null; status: string; moderationReason: string | null };
type Svc = { id: string; title: string; art: string };
type Album = { id: string; name: string };

/** Photos of the vendor's work, grouped into albums they name themselves. */
export function PortfolioManager({ items, services, albums }: { items: Item[]; services: Svc[]; albums: Album[] }) {
  const [view, setView] = useState<string>("all"); // "all", "none" or an album id
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [newAlbumOpen, setNewAlbumOpen] = useState(false);
  const [error, setError] = useState("");
  const album = albums.find((a) => a.id === view) ?? null;
  // an album that isn't in the list (just deleted, or just created and still arriving) shows all photos meanwhile
  const active = view === "all" || view === "none" || album ? view : "all";
  const shown = items.filter((it) => active === "all" || (active === "none" ? !it.albumId : it.albumId === active));
  const count = (id: string | null) => items.filter((it) => (id ? it.albumId === id : !it.albumId)).length;
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const stopSelecting = () => { setSelecting(false); setPicked([]); };
  const run = (fn: () => Promise<{ error?: string } | void>) => start(async () => { setError(""); const r = await fn(); if (r && r.error) setError(r.error); });

  return (
    <div className="mt-6 grid gap-6">
      <UploadForm services={services} albums={albums} defaultAlbum={album?.id ?? ""} />

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Albums">
          <Tab on={active === "all"} onClick={() => setView("all")}>All photos · {items.length}</Tab>
          {albums.map((a) => <Tab key={a.id} on={active === a.id} onClick={() => setView(a.id)}>{a.name} · {count(a.id)}</Tab>)}
          {albums.length > 0 && count(null) > 0 && <Tab on={active === "none"} onClick={() => setView("none")}>Not in an album · {count(null)}</Tab>}
          <button type="button" onClick={() => setNewAlbumOpen(true)} className="check !border-dashed !text-xs"><FolderPlus size={14} /> New album</button>
        </div>
        {newAlbumOpen && <NewAlbum onCancel={() => setNewAlbumOpen(false)} onCreate={(name) => run(async () => { const r = await createAlbum(name, []); if (r.id) { setView(r.id); setNewAlbumOpen(false); } return r; })} />}
        {album && <AlbumHeader album={album} busy={pending} onRename={(name) => run(() => renameAlbum(album.id, name))} onDelete={() => run(async () => { await deleteAlbum(album.id); setView("all"); })} />}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-mute">{selecting ? "Tap photos to choose them, then move them to an album." : "Group similar photos into albums, maslan Bridal, Party, Arabic designs."}</p>
          {items.length > 0 && (selecting
            ? <button type="button" className="btn btn-sm" onClick={stopSelecting}>Done</button>
            : <button type="button" className="btn btn-sm btn-blue" onClick={() => setSelecting(true)}><Check size={14} /> Select photos</button>)}
        </div>
        {error && <p role="alert" className="rounded-xl border-2 border-red bg-red-soft px-3 py-2 text-sm font-medium text-red">{error}</p>}
      </section>

      <ul className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${pending ? "opacity-70" : ""}`}>
        {shown.length === 0 && <li className="col-span-full rounded-2xl border-2 border-dashed border-ink/30 p-8 text-center text-mute">{items.length === 0 ? "No photos yet." : album ? "No photos in this album yet. Choose Select photos, pick some, and move them here." : "Nothing here."}</li>}
        {shown.map((it) => {
          const i = items.indexOf(it);
          const on = picked.includes(it.id);
          return (
            <li key={it.id} className={`card overflow-hidden bg-white transition ${on ? "!border-red shadow-[5px_5px_0_var(--color-red)]" : ""}`}>
              <div className="relative aspect-square border-b-[3px] border-ink">
                <Picture src={it.imageUrl} alt={it.caption ?? "Portfolio photo"} className="h-full w-full" />
                {it.status !== "visible" && <span className="absolute left-2 top-2"><StatusChip status={it.status} /></span>}
                {it.albumId && view === "all" && <span className="absolute bottom-2 left-2 max-w-[85%] truncate rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-bold text-sand">{albums.find((a) => a.id === it.albumId)?.name}</span>}
                {selecting && (
                  <button type="button" onClick={() => toggle(it.id)} aria-pressed={on} aria-label={on ? "Unselect photo" : "Select photo"} className="absolute inset-0 grid place-items-start p-2">
                    <span className={`grid h-7 w-7 place-items-center rounded-full border-[3px] border-ink ${on ? "bg-red text-sand" : "bg-white/90"}`}>{on && <Check size={15} strokeWidth={3} />}</span>
                  </button>
                )}
              </div>
              {editing === it.id ? (
                <EditItem it={it} services={services} onDone={() => setEditing(null)} />
              ) : (
                <div className="grid gap-2 p-3">
                  <p className="truncate text-sm font-bold">{it.caption ?? <span className="font-normal text-mute">No caption</span>}</p>
                  {it.moderationReason && <p className="text-xs text-red">Hidden by Ronaq: {it.moderationReason}</p>}
                  {!selecting && (
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
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {selecting && picked.length > 0 && (
        <MoveBar
          count={picked.length}
          albums={albums}
          busy={pending}
          onMove={(target) => run(async () => { await movePhotosToAlbum(picked, target); stopSelecting(); })}
          onNewAlbum={(name) => run(async () => { const r = await createAlbum(name, picked); if (r.id) { stopSelecting(); setView(r.id); } return r; })}
        />
      )}
    </div>
  );
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" role="tab" aria-selected={on} onClick={onClick} className={`check !text-xs ${on ? "!bg-ink !text-sand" : ""}`}>{children}</button>;
}

function NewAlbum({ onCreate, onCancel }: { onCreate: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) onCreate(name); }} className="flex flex-wrap items-end gap-2 rounded-2xl border-2 border-ink/15 bg-white p-3">
      <div className="field min-w-[220px] flex-1"><label className="label text-xs" htmlFor="album-new">Album name</label><input id="album-new" autoFocus className="input" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bridal mehndi" /></div>
      <button className="btn btn-sm btn-red" disabled={!name.trim()}>Create album</button>
      <button type="button" className="btn btn-sm" onClick={onCancel}>Cancel</button>
    </form>
  );
}

function AlbumHeader({ album, busy, onRename, onDelete }: { album: Album; busy: boolean; onRename: (name: string) => void; onDelete: () => void }) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(album.name);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { setName(album.name); setRenaming(false); }, [album.id, album.name]);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-sand/70 p-3">
      {renaming ? (
        <form className="flex flex-1 flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onRename(name); setRenaming(false); } }}>
          <input autoFocus aria-label="Album name" className="input !min-h-10 max-w-xs !py-1.5" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn btn-sm btn-ink" disabled={busy || !name.trim()}>Save</button>
          <button type="button" className="btn btn-sm" onClick={() => setRenaming(false)}>Cancel</button>
        </form>
      ) : (
        <>
          <p className="flex-1 font-display text-lg">{album.name}</p>
          <button type="button" className="btn btn-sm" onClick={() => setRenaming(true)}><Pencil size={14} /> Rename</button>
          <button type="button" className="btn btn-sm" onClick={() => setConfirm(true)}><Trash2 size={14} /> Delete album</button>
        </>
      )}
      <ConfirmDialog open={confirm} title={`Delete the ${album.name} album?`} confirmLabel="Yes, delete album" cancelLabel="Keep it" busy={busy} onClose={() => setConfirm(false)} onConfirm={() => { setConfirm(false); onDelete(); }}>
        Only the album goes. Its photos stay in your portfolio, under &ldquo;Not in an album&rdquo;.
      </ConfirmDialog>
    </div>
  );
}

function MoveBar({ count, albums, busy, onMove, onNewAlbum }: { count: number; albums: Album[]; busy: boolean; onMove: (albumId: string | null) => void; onNewAlbum: (name: string) => void }) {
  const [target, setTarget] = useState(albums[0]?.id ?? "__new");
  const [name, setName] = useState("");
  const makeNew = target === "__new";
  return (
    <div className="sticky bottom-[84px] z-30 flex flex-wrap items-end gap-2 rounded-2xl border-[3px] border-ink bg-sun p-3 shadow-[5px_5px_0_var(--color-ink)] md:bottom-4">
      <p className="self-center font-bold">{count} photo{count > 1 ? "s" : ""} selected</p>
      <div className="field min-w-[180px] flex-1">
        <label className="label text-xs" htmlFor="move-to">Move to</label>
        <Select id="move-to" className="input !min-h-10 !py-1.5" value={target} onChange={(e) => setTarget(e.target.value)}>
          {albums.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          <option value="__new">+ New album…</option>
          <option value="__none">Not in an album</option>
        </Select>
      </div>
      {makeNew && <div className="field min-w-[180px] flex-1"><label className="label text-xs" htmlFor="move-new">New album name</label><input id="move-new" className="input !min-h-10 !py-1.5" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Party looks" /></div>}
      <button type="button" className="btn btn-sm btn-red" disabled={busy || (makeNew && !name.trim())}
        onClick={() => (makeNew ? onNewAlbum(name) : onMove(target === "__none" ? null : target))}>
        Move
      </button>
    </div>
  );
}

function UploadForm({ services, albums, defaultAlbum }: { services: Svc[]; albums: Album[]; defaultAlbum: string }) {
  const [state, action] = useActionState(uploadPortfolio, undefined);
  const [previews, setPreviews] = useState<string[]>([]);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) { ref.current?.reset(); setPreviews([]); } }, [state]);
  return (
    <form ref={ref} action={action} className="card grid gap-4 bg-white p-5 sm:p-6">
      <label className="grid cursor-pointer place-items-center gap-2 rounded-2xl border-[3px] border-dashed border-ink/40 p-8 text-center transition hover:border-red hover:bg-red-soft/40">
        <ImagePlus size={32} className="text-red" />
        <span className="font-display">Choose photos</span>
        <span className="text-sm text-mute">Up to 10 at a time · JPG, PNG or WebP · 5 MB each.</span>
        <input type="file" name="images" multiple accept="image/jpeg,image/png,image/webp" className="sr-only"
          onChange={(e) => setPreviews(Array.from(e.target.files ?? []).slice(0, 10).map((f) => URL.createObjectURL(f)))} />
      </label>
      {previews.length > 0 && (
        <>
          <div className="flex gap-2 overflow-x-auto">{previews.map((p) => <img key={p} src={p} alt="" className="h-20 w-20 flex-none rounded-xl border-2 border-ink object-cover" />)}</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="field"><label className="label text-xs" htmlFor="pf-cap">Caption</label><input id="pf-cap" name="caption" className="input" placeholder="e.g. Bridal mehndi, December" /></div>
            <div className="field"><label className="label text-xs" htmlFor="pf-album">Album</label><Select key={defaultAlbum} id="pf-album" name="albumId" className="input" defaultValue={defaultAlbum}><option value="">Not in an album</option>{albums.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></div>
            <div className="field"><label className="label text-xs" htmlFor="pf-svc">Service</label><Select id="pf-svc" name="serviceId" className="input"><option value="">—</option>{services.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</Select></div>
            <div className="field"><label className="label text-xs" htmlFor="pf-tags">Tags (comma separated)</label><input id="pf-tags" name="tags" className="input" placeholder="bridal, arabic, feet" /></div>
            <div className="field sm:col-span-2"><label className="label text-xs" htmlFor="pf-price">Price example (optional)</label><input id="pf-price" name="priceExample" className="input" placeholder="e.g. PKR 15,000 full hands" /></div>
          </div>
          <div><Submit pendingText="Uploading…">Upload {previews.length} photo{previews.length > 1 ? "s" : ""}</Submit></div>
        </>
      )}
      <FormMessage state={state} />
    </form>
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
