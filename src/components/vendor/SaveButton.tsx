"use client";
import { Heart } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { usePathname } from "next/navigation";
import { toggleShortlist } from "@/app/actions/market";

export function SaveButton({ vendorId, saved, variant = "icon" }: { vendorId: string; saved: boolean; variant?: "icon" | "full" }) {
  const path = usePathname();
  const [optimistic, set] = useOptimistic(saved);
  const [pending, start] = useTransition();
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    start(async () => {
      set(!optimistic);
      await toggleShortlist(vendorId, path);
    });
  };
  if (variant === "full")
    return (
      <button type="button" onClick={onClick} disabled={pending} className={`btn ${optimistic ? "btn-red" : ""}`} aria-pressed={optimistic}>
        <Heart size={18} className={optimistic ? "fill-sand" : ""} /> {optimistic ? "Saved" : "Save"}
      </button>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? "Remove from shortlist" : "Save to shortlist"}
      className={`grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink shadow-[2px_2px_0_var(--color-ink)] transition-transform active:scale-90 ${optimistic ? "bg-red text-sand" : "bg-white text-ink"}`}
    >
      <Heart size={18} className={optimistic ? "fill-sand" : ""} />
    </button>
  );
}
