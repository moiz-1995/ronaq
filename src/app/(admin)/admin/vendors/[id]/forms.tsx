"use client";
import { useActionState } from "react";
import { adminEditVendor, moderateVendor } from "@/app/actions/admin";
import { FormMessage, Submit } from "@/components/ui/form";

export function VendorEditForm({ v }: { v: { id: string; name: string; description: string | null; ownerName: string | null; phone: string | null; whatsapp: string | null } }) {
  const [state, action] = useActionState(adminEditVendor, undefined);
  return (
    <form action={action} className="mt-3 grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={v.id} />
      <div className="field"><label className="label text-xs" htmlFor="ae-name">Name</label><input id="ae-name" name="name" className="input" defaultValue={v.name} /></div>
      <div className="field"><label className="label text-xs" htmlFor="ae-owner">Owner</label><input id="ae-owner" name="ownerName" className="input" defaultValue={v.ownerName ?? ""} /></div>
      <div className="field"><label className="label text-xs" htmlFor="ae-phone">Phone</label><input id="ae-phone" name="phone" className="input" defaultValue={v.phone ?? ""} /></div>
      <div className="field"><label className="label text-xs" htmlFor="ae-wa">WhatsApp</label><input id="ae-wa" name="whatsapp" className="input" defaultValue={v.whatsapp ?? ""} /></div>
      <div className="field sm:col-span-2"><label className="label text-xs" htmlFor="ae-desc">Description</label><textarea id="ae-desc" name="description" className="input" defaultValue={v.description ?? ""} /></div>
      <div className="field sm:col-span-2"><label className="label text-xs" htmlFor="ae-reason">Why are you editing? (audit note)</label><input id="ae-reason" name="reason" className="input" placeholder="e.g. Vendor asked on call to update phone" /></div>
      <div className="sm:col-span-2"><FormMessage state={state} /></div>
      <div><Submit className="btn btn-sm btn-ink">Save changes</Submit></div>
    </form>
  );
}

export function VerifyForm({ id, phone, email, reviewed }: { id: string; phone: boolean; email: boolean; reviewed: boolean }) {
  const [state, action] = useActionState(moderateVendor, undefined);
  return (
    <form action={action} className="mt-2 grid gap-2 text-sm">
      <input type="hidden" name="id" value={id} /><input type="hidden" name="op" value="verify" />
      <label className="flex items-center gap-2"><input type="checkbox" name="phoneVerified" defaultChecked={phone} className="accent-blue" /> Phone verified</label>
      <label className="flex items-center gap-2"><input type="checkbox" name="emailVerified" defaultChecked={email} className="accent-blue" /> Email verified</label>
      <label className="flex items-center gap-2"><input type="checkbox" name="profileReviewed" defaultChecked={reviewed} className="accent-blue" /> Profile reviewed</label>
      <FormMessage state={state} />
      <div><Submit className="btn btn-sm">Save badges</Submit></div>
    </form>
  );
}
