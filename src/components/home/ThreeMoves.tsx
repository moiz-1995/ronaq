"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarHeart, ListChecks, Store } from "lucide-react";
import { Magnetic } from "@/components/motion/Magnetic";

const STEPS = [
  { icon: ListChecks, t: "Pick a checklist", d: "Wedding, Mehndi, Birthday, or start blank.", c: "bg-sand" },
  { icon: CalendarHeart, t: "Lock the date", d: "Add dholki and walima nights as extra dates.", c: "bg-red text-sand" },
  { icon: Store, t: "Find vendors", d: "Message them, save quotes, mark them booked.", c: "bg-blue text-sand" },
];
const ROWS = [
  ["Mehndi artist", "Hina's Henna Studio", "BOOKED", "bg-green text-white"],
  ["Catering", "3 vendors shortlisted", "SHORTLISTED", "bg-red text-sand"],
  ["Photography", "Comparing packages", "SEARCHING", "bg-blue text-sand"],
  ["Stage decor", "Budget PKR 250,000", "NOT STARTED", "bg-white"],
];

/** "Plan your ronaq in three moves". On large screens the section pins and the example dashboard builds itself as you scroll. */
export function ThreeMoves({ href }: { href: string }) {
  const section = useRef<HTMLElement>(null);
  const [pinned, setPinned] = useState(false);
  const [step, setStep] = useState(2);
  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)");
    const apply = () => { setPinned(mq.matches); if (!mq.matches) setStep(2); };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    const read = () => {
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
      setStep(p < 0.3 ? 0 : p < 0.62 ? 1 : 2);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(read); };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, [pinned]);

  return (
    <section ref={section} className={pinned ? "h-[240vh]" : ""}>
      <div className={`wrap grid items-center gap-12 py-20 lg:grid-cols-2 ${pinned ? "sticky top-16 h-[calc(100vh-4rem)] !py-6" : ""}`}>
        <div className="min-w-0">
          <p className="kicker">Event Launchpad</p>
          <h2 className="h-display mt-3 text-[clamp(2rem,5vw,3.6rem)]">Plan your ronaq in three moves.</h2>
          <p className="mt-3 max-w-[54ch] text-lg text-mute">A checklist, a date and a marketplace that already knows what you still need.</p>
          <ol className="relative mt-7 grid gap-3">
            {STEPS.map(({ icon: I, t, d, c }, i) => {
              const on = !pinned || i === step, done = pinned && i < step;
              return (
                <li key={t} className={`card flex items-center gap-4 p-4 transition-all duration-500 ${pinned ? (on ? "translate-x-2 shadow-[6px_6px_0_var(--color-red)]" : "opacity-55") : ""}`}>
                  <span className={`grid h-12 w-12 flex-none place-items-center rounded-full border-[3px] border-ink font-display transition-transform duration-500 ${c} ${pinned && on ? "scale-110" : ""}`}>{done ? "✓" : i + 1}</span>
                  <div><b className="flex items-center gap-2"><I size={16} /> {t}</b><p className="text-sm text-mute">{d}</p></div>
                </li>
              );
            })}
          </ol>
          <Magnetic className="mt-7"><Link href={href} className="btn btn-red">Start planning <ArrowRight size={16} /></Link></Magnetic>
          {pinned && <p className="mt-4 text-xs font-bold text-mute" aria-hidden>Scroll karein ↓</p>}
        </div>

        <div className="card relative bg-white p-6 shadow-[10px_10px_0_var(--color-blue)]" aria-label="Example dashboard">
          <div className="absolute inset-x-[-3px] top-[-3px] h-4 rounded-t-[20px] bg-[repeating-linear-gradient(90deg,var(--color-red)_0_22px,var(--color-sand)_22px_44px,var(--color-blue)_44px_66px)]" />
          <div className="mt-3 flex items-center justify-between text-sm font-bold">
            <span className="chip bg-ink text-sand">PRIMARY EVENT</span>
            <span key={step >= 1 ? "d" : "n"} className={step >= 1 ? "flip" : "text-mute"}>{step >= 1 ? "Sat 26 Dec 2026" : "Date abhi baqi"}</span>
          </div>
          <h3 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-none text-red">Shaadi ki Ronaq</h3>
          <p className="mt-1 flex items-baseline gap-2 font-bold">
            <span key={step >= 1 ? "c" : "x"} className={`font-shade text-7xl leading-none ${step >= 1 ? "flip text-blue" : "text-ink/15"}`}>{step >= 1 ? "50" : "??"}</span> din baqi
          </p>
          <div className={`flex flex-wrap gap-1.5 overflow-hidden transition-all duration-500 ${step >= 1 ? "mt-3 max-h-10 opacity-100" : "max-h-0 opacity-0"}`}>
            {["Dholki", "Mehndi", "Barat", "Walima"].map((x) => <span key={x} className="chip bg-sand">{x.toUpperCase()}</span>)}
          </div>
          <div className="mt-4 h-3.5 overflow-hidden rounded-lg border-[3px] border-ink">
            <div className="h-full bg-[repeating-linear-gradient(-45deg,var(--color-red)_0_8px,var(--color-blue)_8px_16px)] transition-[width] duration-700 ease-out" style={{ width: step === 2 ? "36%" : "0%" }} />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-1 text-[13px] font-medium"><span>{step === 2 ? "4 of 11 services sorted" : "0 of 11 services sorted"}</span><span>{step === 2 ? "PKR 742,000 / 1,800,000" : "Budget PKR 1,800,000"}</span></div>
          <ul className="mt-3">
            {ROWS.map(([a, b, st, c], i) => (
              <li key={a} className="dashed-top flex items-center justify-between gap-3 py-2.5">
                <div>{a}<small className="block text-[13px] text-mute">{step === 2 ? b : "On your checklist"}</small></div>
                <span key={step === 2 ? "s" : "n"} className={`chip ${step === 2 ? `flip ${c}` : "bg-white"}`} style={step === 2 ? { animationDelay: `${i * 110}ms` } : undefined}>{step === 2 ? st : "NOT STARTED"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-mute">Example. Your own dashboard appears after you sign up.</p>
        </div>
      </div>
    </section>
  );
}
