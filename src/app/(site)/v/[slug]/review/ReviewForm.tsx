"use client";
import { Select } from "@/components/ui/Select";
import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { createReview } from "@/app/actions/reviews";
import { FormMessage, Submit } from "@/components/ui/form";

const OCCASIONS = ["Wedding", "Mehndi", "Barat", "Walima", "Dholki", "Engagement", "Birthday", "Aqeeqa", "Corporate", "Other"];

export function ReviewForm({ vendorId, needsEvidence, premoderated }: { vendorId: string; needsEvidence: boolean; premoderated: boolean }) {
  const [state, action] = useActionState(createReview, undefined);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  return (
    <form action={action} className="card card-shadow mt-6 grid gap-5 bg-white p-6">
      <input type="hidden" name="vendorId" value={vendorId} />
      <input type="hidden" name="rating" value={rating} />
      <fieldset>
        <legend className="label mb-2">Your rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n} className="rounded-lg p-1 transition-transform hover:scale-110">
              <Star size={36} strokeWidth={1.6} className={(hover || rating) >= n ? "fill-sun text-ink" : "text-ink/30"} />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label className="label" htmlFor="occasion">Occasion</label>
        <Select id="occasion" name="occasion" className="input" defaultValue="">
          <option value="">Choose…</option>
          {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
        </Select>
      </div>
      <div className="field">
        <label className="label" htmlFor="text">Your review</label>
        <textarea id="text" name="text" className="input" maxLength={1500} placeholder="Were they on time? How was the quality? Would you hire them again?" />
      </div>
      {needsEvidence && (
        <div className="field">
          <label className="label" htmlFor="evidence">How did you use this vendor? (only Ronaq staff see this)</label>
          <input id="evidence" name="evidence" className="input" maxLength={500} placeholder="e.g. Mehndi on 12 Oct in G-11, paid PKR 30,000" />
        </div>
      )}
      <FormMessage state={state} />
      <Submit pendingText="Posting…">Post review</Submit>
      {premoderated && <p className="text-xs text-mute">Reviews are checked by our team before they appear.</p>}
    </form>
  );
}
