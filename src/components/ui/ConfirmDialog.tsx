"use client";
import { useEffect, useRef } from "react";

/** Branded modal on the native <dialog>, which gives focus trapping and Escape for free. */
export function ConfirmDialog({ open, title, children, confirmLabel, cancelLabel = "Cancel", onConfirm, onClose, busy = false }: {
  open: boolean; title: string; children: React.ReactNode; confirmLabel?: string; cancelLabel?: string; onConfirm?: () => void; onClose: () => void; busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="card card-shadow m-auto w-[min(440px,calc(100vw-32px))] bg-white p-0 text-ink backdrop:bg-ink/55"
    >
      <div className="grid gap-3 p-6">
        <h2 className="font-display text-xl leading-tight">{title}</h2>
        <div className="text-[15px] text-mute">{children}</div>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn btn-sm" onClick={onClose} disabled={busy}>{cancelLabel}</button>
          {onConfirm && confirmLabel && <button type="button" className="btn btn-sm btn-red" onClick={onConfirm} disabled={busy}>{busy ? "One moment…" : confirmLabel}</button>}
        </div>
      </div>
    </dialog>
  );
}
