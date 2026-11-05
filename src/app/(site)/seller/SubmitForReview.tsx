"use client";
import { useTransition } from "react";
import { submitForReview } from "@/app/actions/seller";

export function SubmitForReview({ ready }: { ready: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button className="btn btn-sm btn-red" disabled={!ready || pending} onClick={() => start(() => submitForReview())} title={ready ? "" : "Complete the checklist first"}>
      {pending ? "Submitting…" : "Submit for review"}
    </button>
  );
}
