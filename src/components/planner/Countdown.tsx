import type { Countdown as C } from "@/lib/time";

/** FR-EVT-005: big flip-card countdown. Never negative — past events show a post-event state. */
export function CountdownDisplay({ c, compact = false }: { c: C; compact?: boolean }) {
  if (c.state === "none") return <p className={compact ? "text-sm text-mute" : "text-lg"}>Add a date to start the countdown.</p>;
  if (c.state === "today") return <p className={`font-display ${compact ? "text-xl" : "text-[clamp(2.4rem,7vw,4.5rem)]"} leading-none text-sun`}>Aaj hai! Mubarak 🎉</p>;
  if (c.state === "past") return <p className={`font-display ${compact ? "text-base" : "text-2xl"} leading-tight`}>Mubarak ho! This was {c.daysAgo} day{c.daysAgo === 1 ? "" : "s"} ago. Leave reviews for your vendors.</p>;
  const digits = String(c.days).split("");
  if (compact) return <p className="font-display text-2xl leading-none">{c.days} <span className="font-sans text-sm font-normal">days to go</span></p>;
  return (
    <div className="flex items-end gap-3" aria-label={`${c.days} days to go`}>
      <div className="flex gap-1.5" style={{ perspective: "600px" }} aria-hidden>
        {digits.map((d, i) => (
          <span key={i} className="flip relative grid h-[clamp(4.5rem,13vw,7.5rem)] w-[clamp(3.2rem,9vw,5.2rem)] place-items-center overflow-hidden rounded-xl border-[3px] border-sand bg-blue font-shade text-[clamp(3rem,10vw,5.6rem)] leading-none text-sand shadow-[4px_4px_0_var(--color-red)]" style={{ animationDelay: `${i * 0.12}s` }}>
            {d}
            <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-ink/50" />
          </span>
        ))}
      </div>
      <span className="pb-2 font-display text-xl leading-tight">din<br />baqi</span>
    </div>
  );
}
