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
      <button type="button" className="btn btn-sm" onClick={() => setOpen(true)}><Trash2 size={15} /> Delete</button>
      {canRemove ? (
        <ConfirmDialog open={open} title={`Delete ${title}?`} confirmLabel="Yes, delete" cancelLabel="Keep it" busy={busy} onClose={() => setOpen(false)}
          onConfirm={() => start(async () => { await deleteService(id); setOpen(false); })}>
          Yeh aap ki profile aur marketplace se hat jayegi. Your photos stay safe. Sirf break chahiye? Service kholein aur &ldquo;Show this service on my profile&rdquo; untick kar dein.
        </ConfirmDialog>
      ) : (
        <ConfirmDialog open={open} title="This is your only service" cancelLabel="Okay" onClose={() => setOpen(false)}>
          Customers aap ko services se hi dhoondte hain, so you need at least one. Pehle nayi service add karein, phir yeh delete karein.
        </ConfirmDialog>
      )}
    </>
  );
}
