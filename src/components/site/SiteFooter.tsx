import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="dot-bg mt-20 pb-24 text-sand md:pb-10">
      <div className="patti" />
      <div className="wrap grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-shade text-3xl">RONAQ</p>
          <p className="mt-3 max-w-xs text-sm text-sand/80">Apki ronaq, ek jagah. Local talent for every celebration in Rawalpindi and Islamabad.</p>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <p className="font-display text-xs tracking-wide text-sand/60">FAMILIES</p>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/plan">Plan an event</Link>
          <Link href="/signup">Join free</Link>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <p className="font-display text-xs tracking-wide text-sand/60">VENDORS</p>
          <Link href="/sell">Start selling</Link>
          <Link href="/seller">Vendor dashboard</Link>
          <Link href="/sell/claim">Claim your profile</Link>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <p className="font-display text-xs tracking-wide text-sand/60">RONAQ</p>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/disclaimer">How Ronaq works</Link>
        </div>
      </div>
      <div className="wrap border-t border-sand/15 pt-6 text-xs text-sand/60">
        Ronaq helps you discover and contact vendors. Prices, availability and services are agreed directly between you and the vendor.
      </div>
    </footer>
  );
}
