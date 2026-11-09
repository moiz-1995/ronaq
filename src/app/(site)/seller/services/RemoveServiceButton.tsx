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
      <button type="button" className="btn btn-sm" onClick={() => setOpen(true)}><Trash2 size={15} /> Remove</button>
      {canRemove ? (
        <ConfirmDialog open={open} title={`Remove ${title}?`} confirmLabel="Yes, remove it" cancelLabel="Keep it" busy={busy} onClose={() => setOpen(false)}
          onConfirm={() => start(async () => { await deleteService(id); setOpen(false); })}>
          It will disappear from your profile and the marketplace. Your photos stay in your portfolio. Only taking a break? Open the service and untick &ldquo;Show this service on my profile&rdquo; instead.
        </ConfirmDialog>
      ) : (
        <ConfirmDialog open={open} title="This is your only service" cancelLabel="Okay" onClose={() => setOpen(false)}>
          Families find you through your services, so your profile needs at least one. Add the new service first, then remove this one.
        </ConfirmDialog>
      )}
    </>
  );
}
