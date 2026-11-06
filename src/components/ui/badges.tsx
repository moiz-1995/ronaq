import { BadgeCheck, Phone, Mail, Star, ShieldCheck } from "lucide-react";

const BULBS = ["#ffc93c", "#e0262f", "#1f4fe0", "#ffc93c", "#efdfbd", "#e0262f", "#1f4fe0"];
const POINTS: [number, number][] = [[2, 40], [5, 25], [14, 14], [26, 21], [38, 12], [51, 13], [64, 15]];

/** Founding vendor badge with a string of lights draped over its top-left corner. */
export function FoundingBadge({ number, className = "" }: { number?: number | null; className?: string }) {
  return (
    <span className={`relative inline-flex items-center gap-1 rounded-[9px] border-[3px] border-ink bg-sand py-1.5 pl-3.5 pr-2.5 font-display text-[11px] leading-none text-ink shadow-[3px_3px_0_var(--color-ink)] ${className}`}>
      <svg viewBox="0 0 74 50" aria-hidden className="pointer-events-none absolute -left-[22px] -top-[24px] h-[50px] w-[74px] overflow-visible">
        <path d="M3 49 Q-1 30 8 20 Q15 12 16 15 Q26 23 36 13 Q44 6 52 13 Q60 19 72 10" fill="none" stroke="#1b1340" strokeWidth={1.6} />
        {POINTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y + 3} r={3.4} fill={BULBS[i]} stroke="#1b1340" strokeWidth={1}
            className="animate-twinkle" style={{ filter: `drop-shadow(0 0 3px ${BULBS[i]})`, animationDelay: `${-i * 0.37}s` }} />
        ))}
      </svg>
      FOUNDING{number ? <span className="opacity-60">#{number}</span> : null}
    </span>
  );
}

export function Stars({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  if (!count) return <span className="text-sm text-mute">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-bold" aria-label={`Rated ${value.toFixed(1)} out of 5 from ${count} reviews`}>
      <Star size={size} className="fill-sun text-ink" strokeWidth={1.5} />
      {value.toFixed(1)} <span className="font-normal text-mute">({count})</span>
    </span>
  );
}

/** §13: verification badges never imply a quality guarantee. */
export function VerificationBadges({ v }: { v: { phoneVerified: boolean; emailVerified: boolean; profileReviewed: boolean } }) {
  const items = [
    v.phoneVerified && { icon: Phone, label: "Phone verified" },
    v.emailVerified && { icon: Mail, label: "Email verified" },
    v.profileReviewed && { icon: ShieldCheck, label: "Profile reviewed by Ronaq" },
  ].filter(Boolean) as { icon: typeof Phone; label: string }[];
  if (!items.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Verification">
      {items.map(({ icon: I, label }) => (
        <li key={label} className="inline-flex items-center gap-1.5 rounded-full bg-blue-soft px-3 py-1 text-xs font-bold text-blue">
          <I size={13} /> {label}
        </li>
      ))}
    </ul>
  );
}

export function VendorDeclared() {
  return <span className="ml-1 rounded bg-sand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-mute" title="Declared by the vendor, not verified by Ronaq">vendor-declared</span>;
}

export function Verified() {
  return <BadgeCheck size={16} className="inline text-blue" aria-label="Verified" />;
}

const STATUS_STYLE: Record<string, string> = {
  not_started: "bg-white text-ink",
  searching: "bg-blue text-sand",
  shortlisted: "bg-red text-sand",
  booked: "bg-green text-white",
  completed: "bg-ink text-sand",
  sent: "bg-sand text-ink",
  delivered: "bg-blue-soft text-blue",
  responded: "bg-green text-white",
  closed: "bg-white text-mute",
  draft: "bg-white text-ink",
  pending: "bg-sun text-ink",
  approved: "bg-green text-white",
  rejected: "bg-red text-sand",
  suspended: "bg-ink text-sand",
  open: "bg-red text-sand",
  assigned: "bg-blue text-sand",
  resolved: "bg-green text-white",
  dismissed: "bg-white text-mute",
  published: "bg-green text-white",
  hidden: "bg-ink text-sand",
  visible: "bg-green text-white",
  removed: "bg-red text-sand",
};

export function StatusChip({ status, label }: { status: string; label?: string }) {
  return <span className={`chip ${STATUS_STYLE[status] ?? "bg-white"}`}>{(label ?? status.replace(/_/g, " ")).toUpperCase()}</span>;
}
