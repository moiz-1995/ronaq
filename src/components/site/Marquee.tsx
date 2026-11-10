export function Marquee({ items, tone = "red", reverse = false }: { items: string[]; tone?: "red" | "blue"; reverse?: boolean }) {
  const list = [...items, ...items, ...items, ...items];
  return (
    <div aria-hidden className={`overflow-hidden whitespace-nowrap border-y-4 border-ink ${reverse ? "-mt-1" : ""} ${tone === "red" ? "bg-red" : "bg-blue"} text-sand`}>
      <div className={`inline-block py-3.5 font-display text-xl ${reverse ? "marquee-back" : "animate-marquee"}`}>
        {list.map((x, i) => <span key={i} className="mr-7"><span className={tone === "red" ? "text-ink" : "text-sun"}>✦</span> {x.toUpperCase()}</span>)}
      </div>
    </div>
  );
}
