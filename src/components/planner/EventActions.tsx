"use client";
import { useState, useTransition } from "react";
import { Star, Trash2 } from "lucide-react";
import { deleteEvent, setPrimary } from "@/app/actions/planner";

export function DeleteEventButton({ id }: { id: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  return confirm ? (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-bold">Delete for good?</span>
      <button className="btn btn-red btn-sm" disabled={pending} onClick={() => start(() => deleteEvent(id))}>Yes, delete</button>
      <button className="btn btn-sm" onClick={() => setConfirm(false)}>Cancel</button>
    </div>
  ) : (
    <button className="btn btn-sm" onClick={() => setConfirm(true)}><Trash2 size={14} /> Delete event</button>
  );
}

export function MakePrimaryButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button className="btn btn-sm btn-sand" disabled={pending} onClick={() => start(() => setPrimary(id))}>
      <Star size={14} /> Make primary
    </button>
  );
}
