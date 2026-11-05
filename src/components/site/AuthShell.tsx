export function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="wrap grid gap-10 py-10 md:grid-cols-[1fr_1.1fr] md:py-16">
      <div className="card card-shadow order-2 grid content-start gap-5 p-6 sm:p-8 md:order-1">
        <div>
          <h1 className="h-display text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-2 text-mute">{sub}</p>
        </div>
        {children}
      </div>
      <div className="dot-bg relative order-1 hidden overflow-hidden rounded-[28px] border-[3px] border-ink p-8 text-sand md:order-2 md:grid md:content-end">
        <p className="font-shade text-6xl leading-none">RONAQ</p>
        <p className="mt-4 max-w-sm text-lg">Free for families. Browse, plan and message local vendors in Rawalpindi and Islamabad.</p>
        <div className="patti absolute inset-x-0 top-0" />
      </div>
    </div>
  );
}
