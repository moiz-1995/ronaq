"use client";
import { useActionState } from "react";
import { saveTemplate } from "@/app/actions/admin";
import { FormMessage, Submit } from "@/components/ui/form";

export function TemplateForm({ t }: { t: { id: string; name: string; label: string; items: string } }) {
  const [state, action] = useActionState(saveTemplate, undefined);
  return (
    <form action={action} className="grid gap-3 rounded-2xl border-2 border-ink/10 bg-white p-5">
      <input type="hidden" name="id" value={t.id} />
      <div className="grid grid-cols-2 gap-2">
        <div className="field"><label className="label text-xs" htmlFor={`tn-${t.id}`}>Name</label><input id={`tn-${t.id}`} name="name" className="input" defaultValue={t.name} /></div>
        <div className="field"><label className="label text-xs" htmlFor={`tl-${t.id}`}>Heading word</label><input id={`tl-${t.id}`} name="label" className="input" defaultValue={t.label} /></div>
      </div>
      <div className="field"><label className="label text-xs" htmlFor={`ti-${t.id}`}>Items</label><textarea id={`ti-${t.id}`} name="items" className="input !min-h-48 font-mono text-sm" defaultValue={t.items} /></div>
      <FormMessage state={state} />
      <div><Submit className="btn btn-sm btn-ink">Save</Submit></div>
    </form>
  );
}
