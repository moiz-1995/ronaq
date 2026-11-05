export default function Loading() {
  return (
    <div className="wrap py-10" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-sand" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[22px] border-[3px] border-ink/10">
            <div className="aspect-[4/3] animate-pulse bg-sand" />
            <div className="grid gap-2 p-4"><div className="h-4 w-2/3 animate-pulse rounded bg-sand" /><div className="h-3 w-1/2 animate-pulse rounded bg-sand" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
