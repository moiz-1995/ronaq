"use client";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SendHorizonal } from "lucide-react";
import { sendMessage, setInquiryClosed } from "@/app/actions/inquiries";

export function Composer({ inquiryId, role }: { inquiryId: string; role: "consumer" | "vendor" }) {
  const [state, action, pending] = useActionState(sendMessage, undefined);
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  // light polling so new replies show up without a refresh (free-tier friendly: every 15s, only when visible)
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, 15000);
    return () => clearInterval(t);
  }, [router]);
  return (
    <form ref={ref} action={action} className="grid gap-2">
      <input type="hidden" name="inquiryId" value={inquiryId} />
      <input type="hidden" name="as" value={role} />
      <div className="flex items-end gap-2">
        <label htmlFor="body" className="sr-only">Message</label>
        <textarea
          id="body" name="body" rows={2} maxLength={2000} required placeholder="Write a message…" className="input !min-h-12 flex-1 resize-none"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ref.current?.requestSubmit(); } }}
        />
        <button className="btn btn-red !h-12 !px-4" disabled={pending} aria-label="Send"><SendHorizonal size={18} /></button>
      </div>
      {state?.error && <p role="alert" className="text-sm text-red">{state.error}</p>}
    </form>
  );
}

export function CloseToggle({ inquiryId, closed, role }: { inquiryId: string; closed: boolean; role: "consumer" | "vendor" }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="btn btn-sm" disabled={pending} onClick={() => start(() => setInquiryClosed(inquiryId, !closed, role))}
      title={closed ? "Move this conversation back to active so you can keep messaging" : "Move this conversation out of your active list. It doesn't cancel anything with the vendor, and you can reopen it any time."}>
      {closed ? "Reopen conversation" : "Mark as done"}
    </button>
  );
}
