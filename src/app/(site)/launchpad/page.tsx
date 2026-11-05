import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { Check } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { getCategories, getPrimaryEvent, getTemplates } from "@/lib/queries";
import { EVENT_TYPES } from "@/db/catalog";
import { ChecklistStep, DatesStep, MarketStep } from "./Steps";

export const metadata = { title: "Launchpad" };

const STEPS = ["Checklist", "Event date", "Marketplace"];

export default async function LaunchpadPage({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  const user = await requireUser("/launchpad");
  const sp = await searchParams;
  const ev = await getPrimaryEvent(user.id);
  const auto = user.launchpadStep >= 4 ? 1 : Math.min(3, Math.max(1, user.launchpadStep || 1));
  const step = Math.min(3, Math.max(1, Number(sp.step) || auto));
  const [templates, cats] = await Promise.all([getTemplates(), getCategories()]);
  const items = ev ? await db.select().from(s.checklistItems).where(eq(s.checklistItems.eventId, ev.id)).orderBy(asc(s.checklistItems.sortOrder)) : [];

  return (
    <div className="wrap max-w-4xl py-10">
      <p className="kicker">Event Launchpad</p>
      <h1 className="h-display mt-2 text-[clamp(2rem,6vw,3.4rem)]">Plan your ronaq in three moves</h1>
      <ol className="mt-6 grid grid-cols-3 gap-2" aria-label="Steps">
        {STEPS.map((t, i) => {
          const n = i + 1, done = n < step || user.launchpadStep > n, cur = n === step;
          return (
            <li key={t}>
              <Link href={`/launchpad?step=${n}`} aria-current={cur ? "step" : undefined} className={`flex items-center gap-2 rounded-xl border-[3px] border-ink px-3 py-2 text-sm font-bold ${cur ? "bg-red text-sand" : done ? "bg-sand" : "bg-white"}`}>
                <span className={`grid h-7 w-7 flex-none place-items-center rounded-full border-2 border-current font-display text-xs`}>{done && !cur ? <Check size={14} /> : n}</span>
                <span className="truncate">{t}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="mt-8">
        {step === 1 && (
          <ChecklistStep
            templates={templates.map((t) => ({ slug: t.slug, name: t.name, items: t.items ?? [] }))}
            cats={cats.map((c) => ({ slug: c.slug, name: c.name, art: c.art }))}
            existing={items.map((i) => i.label)}
            initialTemplate={templates.find((t) => t.eventType === ev?.type)?.slug ?? "wedding"}
          />
        )}
        {step === 2 && (
          <DatesStep
            types={EVENT_TYPES}
            ev={ev ? { name: ev.name, type: ev.type, label: ev.label, date: ev.date, time: ev.time, location: ev.location, guestCount: ev.guestCount, budget: ev.budget, description: ev.description } : null}
          />
        )}
        {step === 3 && <MarketStep cats={cats.filter((c) => items.some((i) => i.categoryId === c.id)).map((c) => ({ slug: c.slug, name: c.name, art: c.art }))} hasEvent={!!ev} />}
      </div>
    </div>
  );
}
