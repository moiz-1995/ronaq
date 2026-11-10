import { BadgeCheck, Mail, Phone, ShieldCheck } from "lucide-react";

/** Why Ronaq: four tiles, each with a small looping illustration of the promise it makes. */
export function WhyBento() {
  return (
    <section className="wrap pb-6">
      <div data-stagger suppressHydrationWarning className="grid gap-4 md:grid-cols-6">
        <article className="panel overflow-hidden p-5 md:col-span-4">
          <div aria-hidden className="grid gap-2 rounded-2xl bg-sand/70 p-4">
            <p className="bento-bubble w-fit max-w-[80%] rounded-2xl rounded-bl-sm border-2 border-ink bg-white px-3 py-2 text-sm">Assalam o alaikum! 26 December ko available hain?</p>
            <p className="bento-bubble bento-bubble-2 ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm border-2 border-ink bg-blue px-3 py-2 text-sm text-sand">Ji bilkul. Package bhej raha hoon.</p>
            <p className="bento-bubble bento-bubble-3 flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm border-2 border-ink bg-white px-3 py-2.5"><i className="bento-dot" /><i className="bento-dot" /><i className="bento-dot" /></p>
          </div>
          <h3 className="mt-4 font-display text-lg">Your number stays private</h3>
          <p className="mt-1 text-sm text-mute">Message vendors in Ronaq and share only the event details you choose.</p>
        </article>

        <article className="panel overflow-hidden p-5 md:col-span-2">
          <div aria-hidden className="flex h-[132px] flex-col justify-center gap-2 rounded-2xl bg-sand/70 p-4">
            {["PKR 1,200 per person", "PKR 350 per item", "PKR 85,000 package"].map((x, i) => (
              <span key={x} className="bento-price chip w-fit bg-white" style={{ animationDelay: `${i * 1.3}s` }}>{x.toUpperCase()}</span>
            ))}
          </div>
          <h3 className="mt-4 font-display text-lg">Honest price units</h3>
          <p className="mt-1 text-sm text-mute">Per person, per item or package, never mixed up. Custom quotes are clearly marked.</p>
        </article>

        <article className="panel overflow-hidden p-5 md:col-span-2">
          <div aria-hidden className="grid h-[132px] place-items-center rounded-2xl bg-ink text-sand">
            <p className="bento-free font-shade text-6xl leading-none">FREE</p>
          </div>
          <h3 className="mt-4 font-display text-lg">Free for families, always</h3>
          <p className="mt-1 text-sm text-mute">Browse, plan and message as much as you like. No fees.</p>
        </article>

        <article className="panel overflow-hidden p-5 md:col-span-4">
          <div aria-hidden className="flex h-[132px] flex-wrap content-center items-center gap-2 rounded-2xl bg-sand/70 p-4">
            {[[Phone, "Phone verified"], [Mail, "Email verified"], [ShieldCheck, "Profile reviewed by Ronaq"], [BadgeCheck, "Founding vendor"]].map(([I, t], i) => {
              const Icon = I as typeof Phone;
              return <span key={t as string} className="bento-badge inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-white px-3 py-1.5 text-sm font-bold" style={{ animationDelay: `${i * 0.9}s` }}><Icon size={15} className="text-blue" /> {t as string}</span>;
            })}
          </div>
          <h3 className="mt-4 font-display text-lg">Verified badges</h3>
          <p className="mt-1 text-sm text-mute">Badges show exactly what the Ronaq team has checked, and anyone can report a profile.</p>
        </article>
      </div>
    </section>
  );
}
