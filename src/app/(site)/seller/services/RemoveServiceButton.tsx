"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteService } from "@/app/actions/seller";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function RemoveServiceButton({ id, title, canRemove }: { id: string; title: string; canRemove: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, start] = useTransition();
  return (
    <>
      <button type="button" className="btn btn-sm" onClick={() => setOpen(true)}><Trash2 size={15} /> Hatayein</button>
      {canRemove ? (
        <ConfirmDialog open={open} title={`${title} hatana hai?`} confirmLabel="Haan, hata dein" cancelLabel="Rehne dein" busy={busy} onClose={() => setOpen(false)}
          onConfirm={() => start(async () => { await deleteService(id); setOpen(false); })}>
          Yeh aap ki profile aur marketplace se hat jayegi. Aap ki photos mehfooz rahengi. Sirf kuch din ka break hai? To service khol kar &ldquo;Profile par dikhayein&rdquo; ka tick hata dein.
        </ConfirmDialog>
      ) : (
        <ConfirmDialog open={open} title="Yeh aap ki akeli service hai" cancelLabel="Theek hai" onClose={() => setOpen(false)}>
          Khareedar aap ko services se hi dhoondte hain, is liye kam az kam ek zaroori hai. Pehle nayi service add karein, phir yeh hatayein.
        </ConfirmDialog>
      )}
    </>
  );
}
