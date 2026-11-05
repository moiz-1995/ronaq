"use client";
import { useState } from "react";
import { Phone } from "lucide-react";
import { recordContactClick } from "@/app/actions/market";

/** FR-COM-007: numbers are hidden by default and only shown when the vendor opted in, to signed-in users, on tap. */
export function ContactReveal({ vendorId, phone, whatsapp }: { vendorId: string; phone: string | null; whatsapp: string | null }) {
  const [shown, setShown] = useState(false);
  if (!phone && !whatsapp) return null;
  return shown ? (
    <div className="grid gap-1 rounded-xl bg-sand p-3 text-sm">
      {phone && <p>Phone: <b className="select-all">{phone}</b></p>}
      {whatsapp && <p>WhatsApp: <b className="select-all">{whatsapp}</b></p>}
      <p className="text-xs text-mute">Shared by the vendor. Mention Ronaq when you call.</p>
    </div>
  ) : (
    <button type="button" className="btn btn-sm w-full" onClick={() => { setShown(true); recordContactClick(vendorId); }}>
      <Phone size={15} /> Show phone number
    </button>
  );
}
