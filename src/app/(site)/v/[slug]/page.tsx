import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { MapPin, Clock, CalendarDays, Briefcase, MessageCircle, Truck, Home as HomeIcon, Building2, Store, Laptop, PenLine, Info } from "lucide-react";
import { db, schema as s } from "@/db";
import { getUser } from "@/lib/auth";
import { getAllCategories, getAreas, getCities, getShortlistIds } from "@/lib/queries";
import { displayPrice } from "@/lib/price";
import { todayPKT, formatDate, timeAgo } from "@/lib/time";
import { track } from "@/lib/track";
import { getSetting } from "@/lib/settings";
import { reviewEligibility } from "@/lib/domain";
import { Picture } from "@/components/art/CraftArt";
import { FoundingBadge, Stars, StatusChip, VendorDeclared, VerificationBadges } from "@/components/ui/badges";
import { SaveButton } from "@/components/vendor/SaveButton";
import { Gallery } from "@/components/vendor/Gallery";
import { ReportButton } from "@/components/vendor/ReportButton";
import { ContactReveal } from "@/components/vendor/ContactReveal";

const MODES: Record<string, { label: string; icon: typeof Truck }> = {
  home_visit: { label: "Comes to your home", icon: HomeIcon },
  on_site: { label: "Works at your venue", icon: Building2 },
  premises: { label: "You visit their studio/shop", icon: Store },
  delivery: { label: "Delivers", icon: Truck },
  remote: { label: "Online / remote", icon: Laptop },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const v = await db.query.vendors.findFirst({ where: eq(s.vendors.slug, (await params).slug) });
  return { title: v?.name ?? "Vendor", description: v?.description?.slice(0, 150) };
}

export default async function VendorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await db.query.vendors.findFirst({ where: eq(s.vendors.slug, slug) });
  if (!v) notFound();
  const user = await getUser();
  const isOwner = !!user && user.id === v.ownerId;
  const isStaff = !!user && user.role !== "user";
  if (v.status !== "approved" && !isOwner && !isStaff) notFound();

  const [services, portfolio, reviewRows, cats, areas, cities, saved, blocked, policy] = await Promise.all([
    db.select().from(s.vendorServices).where(and(eq(s.vendorServices.vendorId, v.id), eq(s.vendorServices.active, true))).orderBy(asc(s.vendorServices.createdAt)),
    db.select().from(s.portfolioItems).where(and(eq(s.portfolioItems.vendorId, v.id), eq(s.portfolioItems.status, "visible"))).orderBy(asc(s.portfolioItems.sortOrder)),
    db.select({ r: s.reviews, author: s.users.name }).from(s.reviews).innerJoin(s.users, eq(s.users.id, s.reviews.authorId)).where(and(eq(s.reviews.vendorId, v.id), eq(s.reviews.status, "published"))).orderBy(desc(s.reviews.createdAt)).limit(30),
    getAllCategories(), getAreas(), getCities(), getShortlistIds(user?.id),
    db.select().from(s.availability).where(and(eq(s.availability.vendorId, v.id), gte(s.availability.date, todayPKT()))).orderBy(asc(s.availability.date)).limit(60),
    getSetting("reviewPolicy"),
  ]);
  const attrDefs = services.length ? await db.select().from(s.attributes).where(inArray(s.attributes.categoryId, services.map((x) => x.categoryId))) : [];
  const mainCat = cats.find((c) => c.id === services[0]?.categoryId);
  const area = areas.find((a) => a.id === v.areaId);
  const city = cities.find((c) => c.id === v.cityId);
  const servedAreas = areas.filter((a) => v.serviceAreaIds?.includes(a.id));

  // review eligibility for the viewer
  let canReview: ReturnType<typeof reviewEligibility> | null = null;
  if (user && !isOwner) {
    const inq = await db.query.inquiries.findFirst({ where: and(eq(s.inquiries.consumerId, user.id), eq(s.inquiries.vendorId, v.id)) });
    const replies = inq ? (await db.select({ n: sql<number>`count(*)` }).from(s.messages).where(and(eq(s.messages.inquiryId, inq.id), eq(s.messages.senderRole, "vendor"))))[0].n : 0;
    const mine = await db.query.reviews.findFirst({ where: and(eq(s.reviews.authorId, user.id), eq(s.reviews.vendorId, v.id)) });
    canReview = reviewEligibility(policy, { signedIn: true, isOwner, alreadyReviewed: !!mine, hasInquiry: !!inq, vendorReplies: Number(replies) });
  }

  if (!isOwner && v.status === "approved") {
    await db.update(s.vendors).set({ views: sql`${s.vendors.views} + 1` }).where(eq(s.vendors.id, v.id));
    await track("vendor_profile_viewed", { userId: user?.id, cityId: v.cityId, categoryId: mainCat?.id });
  }

  const contactHref = `/v/${v.slug}/contact`;
  const cover = v.coverImage;
  // 14-day availability strip
  const today = todayPKT();
  const days = Array.from({ length: 14 }, (_, i) => new Date(Date.parse(today + "T00:00:00Z") + i * 86400000).toISOString().slice(0, 10));
  const blockedMap = new Map(blocked.map((b) => [b.date, b.status]));

  return (
    <div className="pb-28 md:pb-10">
      {v.status !== "approved" && (
        <div className="bg-sun py-2 text-center text-sm font-bold text-ink">
          Preview: this profile is <StatusChip status={v.status} /> and only visible to you{isStaff && !isOwner ? " and Ronaq staff" : ""}.
        </div>
      )}
      {/* Cover */}
      <section className="relative">
        <div className="relative h-[clamp(200px,34vw,380px)] overflow-hidden border-b-4 border-ink">
          <Picture src={cover} alt={`${v.name} cover`} fallbackKind={mainCat?.art ?? "henna"} seed={7} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        </div>
        <div className="wrap relative -mt-20 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="card card-shadow min-w-0 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-20 w-20 flex-none overflow-hidden rounded-2xl border-[3px] border-ink bg-sand">
                <Picture src={v.logoImage} alt={`${v.name} logo`} fallbackKind={mainCat?.art ?? "henna"} seed={1} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  {mainCat && <Link href={`/c/${mainCat.slug}`} className="font-display text-xs tracking-wide text-blue">{mainCat.name.toUpperCase()}</Link>}
                  {v.founding && <FoundingBadge number={v.foundingNumber} className="ml-3" />}
                </div>
                <h1 className="h-display mt-2 text-[clamp(1.8rem,4.6vw,3rem)]">{v.name}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mute">
                  <span className="inline-flex items-center gap-1"><MapPin size={14} /> {[area?.name, city?.name].filter(Boolean).join(", ")}</span>
                  <Stars value={v.ratingAvg} count={v.ratingCount} />
                </p>
              </div>
            </div>
            <div className="mt-4"><VerificationBadges v={v} /></div>
            {v.description && <p className="mt-5 max-w-[65ch] whitespace-pre-line text-[17px] leading-relaxed">{v.description}</p>}
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              {v.experienceYears != null && <Fact icon={Briefcase} k="Experience" val={`${v.experienceYears} years${v.businessType ? ` · ${v.businessType}` : ""}`} />}
              {v.workingHours && <Fact icon={Clock} k="Working hours" val={v.workingHours} />}
              {v.advanceNoticeDays != null && <Fact icon={CalendarDays} k="Book ahead" val={`At least ${v.advanceNoticeDays} days`} />}
              <Fact icon={MapPin} k="Serves" val={v.servesWholeCity ? `All of ${city?.name}` : [servedAreas.map((a) => a.name).join(", "), v.serviceRadiusKm ? `within ${v.serviceRadiusKm} km of ${area?.name}` : ""].filter(Boolean).join(" · ") || "Ask the vendor"} />
            </dl>
            {!!v.modes?.length && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {v.modes.map((m) => { const M = MODES[m]; if (!M) return null; const I = M.icon; return <li key={m} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-sm font-medium"><I size={14} /> {M.label}</li>; })}
              </ul>
            )}
          </div>

          {/* Contact box */}
          <aside className="lg:row-span-3">
            <div className="card card-shadow grid gap-3 bg-white p-5 lg:sticky lg:top-24">
              {services[0] && <PriceLine model={services[0].pricingModel} amount={services[0].priceAmount} />}
              {isOwner ? (
                <Link href="/seller/profile" className="btn btn-blue w-full"><PenLine size={16} /> Edit your profile</Link>
              ) : (
                <Link href={user ? contactHref : `/login?next=${encodeURIComponent(contactHref)}&reason=${encodeURIComponent(`Sign in to message ${v.name}. You'll come straight back here.`)}`} className="btn btn-red w-full">
                  <MessageCircle size={17} /> Send an inquiry
                </Link>
              )}
              {!isOwner && <SaveButton vendorId={v.id} saved={saved.has(v.id)} variant="full" />}
              {user && v.revealContact && !isOwner && <ContactReveal vendorId={v.id} phone={v.phone} whatsapp={v.whatsapp} />}
              <p className="flex gap-2 rounded-xl bg-sand p-3 text-xs text-mute">
                <Info size={15} className="flex-none text-ink" />
                Ronaq connects you with vendors. Prices, dates and services are agreed directly with them. Ronaq doesn&apos;t take payments or guarantee bookings.
              </p>
              <div className="text-center"><ReportButton targetType="vendor" targetId={v.id} label="Report this profile" /></div>
            </div>
          </aside>

          {/* Services */}
          <section className="min-w-0" aria-labelledby="svc">
            <h2 id="svc" className="h-display text-2xl">Services &amp; prices</h2>
            <div className="mt-4 grid gap-4">
              {services.map((svc) => {
                const cat = cats.find((c) => c.id === svc.categoryId);
                const p = displayPrice(svc.pricingModel, svc.priceAmount);
                const defs = attrDefs.filter((a) => a.categoryId === svc.categoryId && a.showOnProfile);
                return (
                  <article key={svc.id} className="panel p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-[11px] tracking-wide text-blue">{cat?.name.toUpperCase()}</p>
                        <h3 className="mt-1 text-xl font-bold">{svc.title}</h3>
                      </div>
                      <p className="text-right"><span className="text-xs text-mute">{p.lead} </span><b className="font-display text-xl text-red">{p.amount}</b> <span className="text-sm text-mute">{p.unit}</span></p>
                    </div>
                    {svc.description && svc.description !== v.description && <p className="mt-2 text-mute">{svc.description}</p>}
                    {svc.minOrder && <p className="mt-2 text-sm"><b>Minimum order:</b> {svc.minOrder}</p>}
                    {defs.length > 0 && (
                      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                        {defs.map((a) => {
                          const val = svc.attributes?.[a.key];
                          if (val == null || val === "" || (Array.isArray(val) && !val.length)) return null;
                          const shown = typeof val === "boolean" ? (val ? "Yes" : "No") : Array.isArray(val) ? val.join(", ") : `${val}${a.unit ? ` ${a.unit}` : ""}`;
                          return (
                            <div key={a.id} className="flex flex-wrap gap-x-2">
                              <dt className="text-mute">{a.label}:</dt>
                              <dd className="font-medium">{shown}{a.vendorDeclared && <VendorDeclared />}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="min-w-0" aria-labelledby="port">
            <h2 id="port" className="h-display mb-4 text-2xl">Portfolio</h2>
            <Gallery items={portfolio} vendorName={v.name} />
          </section>

          <section className="min-w-0" aria-labelledby="avail">
            <h2 id="avail" className="h-display text-2xl">Next two weeks</h2>
            <p className="mt-1 text-sm text-mute">From the vendor&apos;s own calendar. Availability isn&apos;t confirmed until they reply to you.</p>
            <ul className="mt-4 grid grid-cols-7 gap-2">
              {days.map((d) => {
                const st = blockedMap.get(d);
                return (
                  <li key={d} className={`rounded-xl border-2 border-ink p-2 text-center text-xs ${st === "unavailable" ? "bg-ink/10 text-mute line-through" : st === "limited" ? "bg-sun/40" : "bg-white"}`}>
                    <span className="block font-bold">{formatDate(d, { weekday: "short" })}</span>
                    <span className="font-display text-base">{Number(d.slice(8))}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 flex gap-4 text-xs text-mute"><span>■ white: open</span><span className="text-[#b58a00]">■ limited</span><span>struck: unavailable</span></p>
          </section>

          <section className="min-w-0" aria-labelledby="rev">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="rev" className="h-display text-2xl">Reviews</h2>
                <div className="mt-1"><Stars value={v.ratingAvg} count={v.ratingCount} size={16} /></div>
              </div>
              {canReview?.allowed && <Link href={`/v/${v.slug}/review`} className="btn btn-sm btn-blue">Write a review</Link>}
            </div>
            {canReview && !canReview.allowed && <p className="mt-2 text-sm text-mute">{canReview.reason}</p>}
            <p className="mt-2 text-xs text-mute">
              {policy.basis === "inquiry" ? "Reviews come from people who contacted this vendor through Ronaq." : policy.basis === "admin_evidence" ? "Reviews are published after Ronaq checks evidence of the event." : "Reviews come from signed-in Ronaq members."} Ronaq doesn&apos;t verify that a booking took place.
            </p>
            <ul className="mt-5 grid gap-4">
              {reviewRows.length === 0 && <li className="panel p-5 text-mute">No reviews yet.</li>}
              {reviewRows.map(({ r, author }) => (
                <li key={r.id} className="panel p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{author.split(" ")[0]} {author.split(" ")[1]?.[0] ? author.split(" ")[1][0] + "." : ""}</p>
                    <p className="text-sm text-mute">{timeAgo(r.createdAt)}</p>
                  </div>
                  <p className="mt-1 text-sun" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}<span className="text-ink/20">{"★".repeat(5 - r.rating)}</span></p>
                  {r.text && <p className="mt-2">{r.text}</p>}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-mute">
                    <span>{[r.occasion, r.basis === "inquiry" ? "Contacted via Ronaq" : r.basis === "admin_evidence" ? "Evidence checked by Ronaq" : "Ronaq member"].filter(Boolean).join(" · ")}</span>
                    <ReportButton targetType="review" targetId={r.id} label="Report review" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      {/* mobile sticky contact */}
      {!isOwner && (
        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-30 border-t-[3px] border-ink bg-paper p-3 md:hidden" style={{ paddingLeft: "max(12px, env(safe-area-inset-left,0px))", paddingRight: "max(12px, env(safe-area-inset-right,0px))" }}>
          <Link href={user ? contactHref : `/login?next=${encodeURIComponent(contactHref)}`} className="btn btn-red w-full"><MessageCircle size={17} /> Send an inquiry</Link>
        </div>
      )}
    </div>
  );
}

function Fact({ icon: I, k, val }: { icon: typeof Clock; k: string; val: string }) {
  return (
    <div className="flex gap-2">
      <I size={16} className="mt-0.5 flex-none text-red" />
      <div><dt className="text-mute">{k}</dt><dd className="font-medium">{val}</dd></div>
    </div>
  );
}

function PriceLine({ model, amount }: { model: Parameters<typeof displayPrice>[0]; amount: number | null }) {
  const p = displayPrice(model, amount);
  return (
    <div>
      <p className="text-sm text-mute">{p.lead || "Price"}</p>
      <p><b className="font-display text-3xl text-red">{p.amount}</b> <span className="text-mute">{p.unit}</span></p>
    </div>
  );
}
