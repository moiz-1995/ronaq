const PETALS = [
  [6, 0, 11, "#ff6b72"], [14, -4, 14, "#ffcc00"], [23, -9, 12, "#e5197f"], [33, -2, 15, "#ff8a00"], [44, -7, 11, "#ffcc00"],
  [55, -12, 13, "#ff6b72"], [64, -5, 16, "#00a19a"], [73, -10, 12, "#ffcc00"], [82, -3, 14, "#e5197f"], [92, -8, 13, "#ff8a00"],
] as const;

/** Slow-falling rose petals behind the hero. Decorative, drawn with CSS only. */
export function Petals() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PETALS.map(([left, delay, duration, color], i) => (
        <span key={i} className="petal" style={{ left: `${left}%`, background: color, animationDelay: `${delay}s`, animationDuration: `${duration}s` }} />
      ))}
    </div>
  );
}
