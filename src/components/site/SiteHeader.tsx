import Link from "next/link";
import { Bell, MessageCircle, Store, ShieldCheck } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getBadgeCounts, getMyVendor } from "@/lib/queries";
import { AccountMenu } from "./AccountMenu";
import { MobileTabs } from "./MobileTabs";

export async function SiteHeader() {
  const user = await getUser();
  const counts = user ? await getBadgeCounts(user) : null;
  const vendor = user ? await getMyVendor(user.id) : null;
  return (
    <>
      <header className="dot-bg sticky top-[env(safe-area-inset-top,0px)] z-40 text-sand">
        <div className="wrap flex h-16 items-center justify-between gap-3">
          <Link href="/" className="font-shade text-[28px] leading-none tracking-wide text-sand" aria-label="Ronaq home">
            RONAQ
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-bold md:flex" aria-label="Main">
            <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href="/marketplace">Marketplace</Link>
            <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href={user ? "/dashboard" : "/plan"}>Plan an event</Link>
            {user && <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href="/events">Events</Link>}
            {user && <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href="/shortlist">Shortlist</Link>}
            <Link className="rounded-lg px-3 py-2 hover:bg-white/10" href={vendor ? "/seller" : "/sell"}>{vendor ? "My business" : "For vendors"}</Link>
          </nav>
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                {(user.role === "admin" || user.role === "moderator") && (
                  <Link href="/admin" className="hidden rounded-lg p-2 hover:bg-white/10 sm:inline-flex" aria-label="Admin console"><ShieldCheck size={20} /></Link>
                )}
                {vendor && (
                  <Link href="/seller/inquiries" className="relative rounded-lg p-2 hover:bg-white/10" aria-label={`Business inbox, ${counts!.vendorInbox} unread`}>
                    <Store size={20} />
                    {counts!.vendorInbox > 0 && <Dot n={counts!.vendorInbox} />}
                  </Link>
                )}
                <Link href="/inbox" className="relative rounded-lg p-2 hover:bg-white/10" aria-label={`Messages, ${counts!.inbox} unread`}>
                  <MessageCircle size={20} />
                  {counts!.inbox > 0 && <Dot n={counts!.inbox} />}
                </Link>
                <Link href="/notifications" className="relative rounded-lg p-2 hover:bg-white/10" aria-label={`Notifications, ${counts!.notifications} unread`}>
                  <Bell size={20} />
                  {counts!.notifications > 0 && <Dot n={counts!.notifications} />}
                </Link>
                <AccountMenu name={user.name} isSeller={!!vendor} isStaff={user.role !== "user"} />
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-bold hover:bg-white/10">Sign in</Link>
                <Link href="/signup" className="btn btn-sm btn-red !border-sand !shadow-[3px_3px_0_var(--color-blue)]">Join free</Link>
              </>
            )}
          </div>
        </div>
        <div className="patti !h-2" />
      </header>
      <MobileTabs signedIn={!!user} />
    </>
  );
}

function Dot({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-ink bg-red px-1 text-[10px] font-bold leading-none text-sand tabular">
      {n > 9 ? "9+" : n}
    </span>
  );
}
