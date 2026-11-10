"use client";
import { useTransition } from "react";
import { publishProfile } from "@/app/actions/seller";

/** Drafts go live straight away. A profile the team sent back goes to them for another look. */
export function PublishButton({ ready, resubmit }: { ready: boolean; resubmit: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button className="btn btn-sm btn-red" disabled={!ready || pending} onClick={() => start(() => publishProfile())} title={ready ? "" : "Add the missing basics first"}>
      {pending ? "One moment…" : resubmit ? "Send for review" : "Publish my dukaan"}
    </button>
  );
}
