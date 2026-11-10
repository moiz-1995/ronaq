"use client";
import { Select } from "@/components/ui/Select";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addService } from "@/app/actions/seller";
import { FormMessage, Submit } from "@/components/ui/form";

export function AddServiceForm({ cats }: { cats: { id: string; name: string }[] }) {
  const [state, action] = useActionState(addService, undefined);
  if (!cats.length) return null;
  return (
    <form action={action} className="card mt-6 flex flex-wrap items-end gap-3 border-dashed bg-sand/50 p-4">
      <div className="field min-w-[220px] flex-1">
        <label className="label" htmlFor="new-cat">Add another service</label>
        <Select id="new-cat" name="categoryId" className="input">{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
      </div>
      <Submit className="btn btn-red"><Plus size={16} /> Add service</Submit>
      <FormMessage state={state} />
    </form>
  );
}
