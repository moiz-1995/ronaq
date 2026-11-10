"use client";
import { Heart } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { toggleShortlist } from "@/app/actions/market";
import { toast } from "@/components/ui/Toaster";

export function SaveButton({ vendorId, vendorName, saved, variant = "icon" }: { vendorId: string; vendorName: string; saved: boolean; variant?: "icon" | "full" }) {
  const path = usePathname();
  const [optimistic, set] = useOptimistic(saved);
  const [pending, start] = useTransition();
  const [pressed, setPressed] = useState(false);
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPressed(true);
    start(async () => {
      set(!optimistic);
      const added = await toggleShortlist(vendorId, path);
      toast(added ? { message: `${vendorName} is shortlisted!`, href: "/shortlist", action: "View shortlist" } : { message: `${vendorName} removed from your shortlist` });
    });
  };
  if (variant === "full")
    return (
      <button type="button" onClick={onClick} disabled={pending} className={`btn ${optimistic ? "btn-red" : ""}`} aria-pressed={optimistic}>
        <Heart size={18} className={optimistic ? `fill-sand ${pressed ? "heart-pop" : ""}` : ""} /> {optimistic ? "Shortlisted" : "Shortlist"}
      </button>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={optimistic}
      aria-label={optimistic ? `Remove ${vendorName} from shortlist` : `Add ${vendorName} to shortlist`}
      className={`grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink shadow-[2px_2px_0_var(--color-ink)] transition-transform active:scale-90 ${optimistic ? "bg-red text-sand" : "bg-white text-ink"}`}
    >
      <Heart size={18} className={optimistic ? `fill-sand ${pressed ? "heart-pop" : ""}` : ""} />
    </button>
  );
}
