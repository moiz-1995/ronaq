import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { track } from "@/lib/track";
import { VendorLogo } from "@/components/art/CraftArt";
import { getAllCategories } from "@/lib/queries";
import { InquiryForm } from "./InquiryForm";

export const metadata = { title: "Send an inquiry" };

export default async function ContactPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ item?: string; event?: string }> }) {
  const { slug } = await params;
  const { item, event } = await searchParams;
  const user = await requireUser(`/v/${slug}/contact${item ? `?item=${item}` : ""}`);
  const v = await db.query.vendors.findFirst({ where: eq(s.vendors.slug, slug) });
  if (!v || v.status !== "approved") notFound();
  const events = await db.select().from(s.events).where(eq(s.events.userId, user.id)).orderBy(asc(s.events.date));
  let checklistItem = null;
  if (item) {
    const ci = await db.query.checklistItems.findFirst({ where: eq(s.checklistItems.id, item) });
    if (ci && events.some((e) => e.id === ci.eventId)) checklistItem = ci;
  }
  const existing = await db.query.inquiries.findFirst({ where: and(eq(s.inquiries.consumerId, user.id), eq(s.inquiries.vendorId, v.id)) });
  const svc = await db.query.vendorServices.findFirst({ where: eq(s.vendorServices.vendorId, v.id) });
  const cat = (await getAllCategories()).find((c) => c.id === svc?.categoryId);
  await track("contact_cta_clicked", { userId: user.id, cityId: v.cityId, categoryId: cat?.id });
  const defaultEvent = checklistItem?.eventId ?? event ?? events.find((e) => e.isPrimary)?.id ?? events[0]?.id;

  return (
    <div className="wrap max-w-3xl py-10">
      <Link href={`/v/${v.slug}`} className="text-sm font-bold text-blue underline">← Back to {v.name}</Link>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border-[3px] border-ink"><VendorLogo src={v.logoImage} name={v.name} className="h-full w-full" /></div>
        <div>
          <p className="kicker">Send an inquiry</p>
          <h1 className="h-display text-3xl">{v.name}</h1>
        </div>
      </div>
      {existing && (
        <p className="mt-5 rounded-xl border-2 border-blue bg-blue-soft p-3 text-sm">
          You already have a conversation with {v.name}. <Link className="font-bold underline" href={`/inbox/${existing.id}`}>Continue it</Link>, or start a new inquiry below for a different event.
        </p>
      )}
      <InquiryForm
        vendorId={v.id}
        vendorName={v.name}
        events={events.map((e) => ({ id: e.id, name: e.name, date: e.date, location: e.location, guestCount: e.guestCount, budget: e.budget }))}
        defaultEventId={defaultEvent}
        checklistItemId={checklistItem?.id}
        defaultService={checklistItem?.label ?? svc?.title ?? ""}
        defaultBudget={checklistItem?.budget ?? null}
      />
    </div>
  );
}
