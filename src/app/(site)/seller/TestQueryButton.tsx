"use client";
import { useTransition } from "react";
import { FlaskConical } from "lucide-react";
import { sendTestQuery } from "@/app/actions/inquiries";

export function TestQueryButton({ className = "btn btn-sm btn-blue" }: { className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className={className} disabled={pending} onClick={() => start(() => sendTestQuery())}>
      <FlaskConical size={15} /> {pending ? "Sending…" : "Send a test query"}
    </button>
  );
}
