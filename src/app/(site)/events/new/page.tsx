import { requireUser } from "@/lib/auth";
import { getTemplates } from "@/lib/queries";
import { EVENT_TYPES } from "@/db/catalog";
import { EventForm } from "@/components/planner/EventForm";

export const metadata = { title: "New event" };

export default async function NewEventPage() {
  await requireUser("/events/new");
  const templates = await getTemplates();
  return (
    <div className="wrap max-w-3xl py-10">
      <p className="kicker">Planner</p>
      <h1 className="h-display mb-6 mt-2 text-4xl">New event</h1>
      <EventForm types={EVENT_TYPES} templates={templates.filter((t) => t.slug !== "custom").map((t) => ({ slug: t.slug, name: t.name }))} />
    </div>
  );
}
