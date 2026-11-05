export function Marquee({ items, tone = "red" }: { items: string[]; tone?: "red" | "blue" }) {
  const list = [...items, ...items];
  return (
    <div aria-hidden className={`overflow-hidden whitespace-nowrap border-y-4 border-ink ${tone === "red" ? "bg-red" : "bg-blue"} text-sand`}>
      <div className="inline-block animate-marquee py-3.5 font-display text-xl">
        {list.map((x, i) => <span key={i} className="mr-7"><span className="text-ink">✦</span> {x.toUpperCase()}</span>)}
      </div>
    </div>
  );
}
