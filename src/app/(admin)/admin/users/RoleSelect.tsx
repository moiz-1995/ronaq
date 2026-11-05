"use client";
import { useActionState } from "react";
import { moderateUser } from "@/app/actions/admin";

export function RoleSelect({ id, role }: { id: string; role: string }) {
  const [state, action, pending] = useActionState(moderateUser, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="op" value="role" />
      <select name="role" defaultValue={role} disabled={pending} onChange={(e) => e.currentTarget.form?.requestSubmit()} className="rounded-lg border-2 border-ink/20 px-2 py-1" aria-label="Role">
        <option value="user">user</option><option value="moderator">moderator</option><option value="admin">admin</option>
      </select>
      {state?.error && <p className="text-xs text-red">{state.error}</p>}
    </form>
  );
}
