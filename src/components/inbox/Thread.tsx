import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { CalendarDays, MapPin, Users, Wallet, Briefcase, Info } from "lucide-react";
import { db, schema as s } from "@/db";
import type { Inquiry } from "@/db/schema";
import { formatDate, formatDateTime } from "@/lib/time";
import { pkr } from "@/lib/price";
import { INQUIRY_STATUS_LABELS, guestLabel } from "@/lib/domain";
import { StatusChip } from "@/components/ui/badges";
import { ReportButton } from "@/components/vendor/ReportButton";
import { Composer, CloseToggle } from "./Composer";

export async function Thread({ inq, role, title, subtitle }: { inq: Inquiry; role: "consumer" | "vendor"; title: React.ReactNode; subtitle?: React.ReactNode }) {
  const msgs = await db.select().from(s.messages).where(eq(s.messages.inquiryId, inq.id)).orderBy(asc(s.messages.createdAt));
  const sh = inq.shared ?? {};
  const facts = [
    sh.eventName && { icon: CalendarDays, t: sh.eventName },
    sh.eventDate && { icon: CalendarDays, t: formatDate(sh.eventDate) },
    sh.location && { icon: MapPin, t: sh.location },
    sh.guestCount && { icon: Users, t: guestLabel(sh.guestCount)! },
    sh.budget && { icon: Wallet, t: `Budget ${pkr(sh.budget)}` },
    sh.service && { icon: Briefcase, t: sh.service },
  ].filter(Boolean) as { icon: typeof MapPin; t: string }[];
  return (
    <div className="card card-shadow grid overflow-hidden bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink p-4 sm:p-5">
        <div className="min-w-0">
          <h1 className="font-display text-xl leading-tight">{title}</h1>
          {subtitle && <div className="text-sm text-mute">{subtitle}</div>}
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={inq.status} label={INQUIRY_STATUS_LABELS[inq.status]} />
          <CloseToggle inquiryId={inq.id} closed={inq.status === "closed"} role={role} />
        </div>
      </header>
      {inq.isTest && (
        <div className="border-b-[3px] border-ink bg-sun px-4 py-3 text-sm sm:px-5">
          <p className="font-bold">This is a test query. Sirf aap ko nazar aa rahi hai.</p>
          {role === "vendor" ? (
            <p>Reply below, phir <Link className="font-bold underline" href={`/inbox/${inq.id}`}>customer view mein dekhein</Link> ke reply pohanch gaya.</p>
          ) : (
            <p>You&apos;re seeing it as the customer. <Link className="font-bold underline" href={`/seller/inquiries/${inq.id}`}>Back to vendor view</Link>.</p>
          )}
        </div>
      )}
      {facts.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b-2 border-ink/10 bg-sand/60 px-4 py-3 text-sm">
          <span className="font-bold">{role === "vendor" ? "They shared:" : "You shared:"}</span>
          {facts.map(({ icon: I, t }, i) => <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1"><I size={13} /> {t}</span>)}
        </div>
      )}
      <ol className="grid max-h-[60vh] min-h-[240px] content-start gap-3 overflow-y-auto p-4 sm:p-5" aria-label="Messages">
        {msgs.map((m) => {
          const mine = m.senderRole === role;
          return (
            <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl border-2 border-ink px-4 py-2.5 ${mine ? "rounded-br-sm bg-blue text-sand" : "rounded-bl-sm bg-sand"}`}>
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <div className={`mt-1 flex items-center justify-between gap-3 text-[11px] ${mine ? "text-sand/70" : "text-mute"}`}>
                  <time dateTime={new Date(m.createdAt).toISOString()}>{formatDateTime(m.createdAt)}</time>
                  {!mine && !inq.isTest && <ReportButton targetType="message" targetId={m.id} label="" />}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="border-t-[3px] border-ink p-3 sm:p-4">
        {inq.status === "closed" ? <p className="text-center text-sm text-mute">You marked this conversation as done, so it&apos;s out of your active list. Tap <b>Reopen conversation</b> above to message again.</p> : <Composer inquiryId={inq.id} role={role} />}
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-mute"><Info size={13} className="mt-px flex-none" /> <span>Replied doesn&apos;t mean booked. Ronaq doesn&apos;t guarantee price, availability or service. Done with this chat? Use <b>Mark as done</b> to tidy your inbox. It doesn&apos;t cancel anything.</span></p>
      </div>
    </div>
  );
}
