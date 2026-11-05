import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { EVENT_TYPES } from "@/db/catalog";
import { EventForm } from "@/components/planner/EventForm";
import { DeleteEventButton } from "@/components/planner/EventActions";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/events/${id}/edit`);
  const ev = await db.query.events.findFirst({ where: and(eq(s.events.id, id), eq(s.events.userId, user.id)) });
  if (!ev) notFound();
  return (
    <div className="wrap max-w-3xl py-10">
      <Link href={`/events/${ev.id}`} className="text-sm font-bold text-blue underline">← Back to event</Link>
      <h1 className="h-display mb-6 mt-3 text-4xl">Edit event</h1>
      <EventForm ev={ev} types={EVENT_TYPES} />
      <div className="mt-8 rounded-2xl border-2 border-red p-5">
        <h2 className="font-display text-lg text-red">Delete this event</h2>
        <p className="mt-1 text-sm text-mute">Removes the event, its checklist, quotes and reminders. Your conversations with vendors stay in Messages.</p>
        <div className="mt-3"><DeleteEventButton id={ev.id} /></div>
      </div>
    </div>
  );
}
