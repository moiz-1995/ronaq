import { CakeArt, DholArt, MehndiHand } from "@/components/art/HeroArt";

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="wrap grid gap-6 py-8 md:grid-cols-[1fr_1.1fr] md:gap-10 md:py-14">
      <div className="card card-shadow order-2 grid content-start gap-5 p-6 sm:p-8 md:order-1">
        <div>
          <h1 className="h-display text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-2 text-mute">{sub}</p>
        </div>
        {children}
      </div>
      <aside className="dot-bg relative order-1 grid content-between gap-8 overflow-hidden rounded-[28px] border-[3px] border-ink p-6 pt-9 text-sand sm:p-9 sm:pt-12 md:order-2">
        <div className="patti absolute inset-x-0 top-0" />
        <div>
          <p className="font-shade text-3xl leading-none md:text-4xl">RONAQ</p>
          <p className="sticker-row mt-5 flex flex-wrap gap-x-2.5 gap-y-2 font-display text-[clamp(2.1rem,5.2vw,4.2rem)] leading-[.98]">
            <span className="inline-block -rotate-2 rounded-[12px] bg-red px-3 pb-1.5 pt-0.5">Ronaq</span>
            <span className="inline-block rotate-[1.5deg] rounded-[12px] bg-blue px-3 pb-1.5 pt-0.5">apke</span>
            <span className="inline-block -rotate-1 rounded-[12px] bg-sand px-3 pb-1.5 pt-0.5 text-ink">sath hai</span>
          </p>
        </div>
        <div aria-hidden data-stagger suppressHydrationWarning className="hidden grid-cols-3 items-center gap-2 md:grid">
          <div className="aspect-square -rotate-6"><DholArt /></div>
          <div className="aspect-square scale-125"><MehndiHand /></div>
          <div className="aspect-square rotate-6"><CakeArt /></div>
        </div>
        <div data-stagger suppressHydrationWarning className="hidden gap-3 md:grid lg:grid-cols-2">
          <div className="rounded-2xl border-[3px] border-sand bg-blue p-4">
            <p className="font-display text-lg">Khareedar</p>
            <p className="mt-1 text-sm text-sand/90">Shaadi ya function hai? Dukaandaar dhoondein, rates dekhein, message karein. Bilkul free.</p>
          </div>
          <div className="rounded-2xl border-[3px] border-sand bg-red p-4">
            <p className="font-display text-lg">Dukaandaar</p>
            <p className="mt-1 text-sm text-sand/90">Apna hunar online layein. Apni dukaan banayein aur khareedar se seedha queries paayein.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
