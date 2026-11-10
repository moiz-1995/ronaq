/** A heading whose words rise into place one after another the first time it scrolls into view. */
export function Words({ text, className = "", as: Tag = "h2" }: { text: string; className?: string; as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag data-stagger suppressHydrationWarning aria-label={text} className={`word-reveal ${className}`}>
      {text.split(" ").flatMap((w, i) => [
        <span key={i} aria-hidden className="w"><span style={{ animationDelay: `${i * 60}ms` }}>{w}</span></span>,
        " ",
      ])}
    </Tag>
  );
}
