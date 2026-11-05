"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema as s } from "@/db";
import { getUser } from "@/lib/auth";
import { track } from "@/lib/track";
import { rateLimit, TOO_MANY } from "@/lib/ratelimit";

/** FR-MKT-009: guests are sent to sign in and brought back to the vendor. */
export async function toggleShortlist(vendorId: string, returnTo: string) {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}&reason=${encodeURIComponent("Sign in to save vendors to your shortlist.")}`);
  const existing = await db.query.shortlist.findFirst({ where: and(eq(s.shortlist.userId, user.id), eq(s.shortlist.vendorId, vendorId)) });
  if (existing) {
    await db.delete(s.shortlist).where(and(eq(s.shortlist.userId, user.id), eq(s.shortlist.vendorId, vendorId)));
    await track("shortlist_removed", { userId: user.id });
  } else {
    await db.insert(s.shortlist).values({ userId: user.id, vendorId });
    await track("shortlist_added", { userId: user.id });
  }
  revalidatePath(returnTo);
  revalidatePath("/shortlist");
  return !existing;
}

const reportSchema = z.object({
  targetType: z.enum(["vendor", "review", "message", "portfolio", "user"]),
  targetId: z.string().min(1),
  reason: z.string().min(1, "Choose a reason."),
  details: z.string().max(1000).optional(),
});

/** FR-MKT-013: anyone, including guests, can report. */
export async function submitReport(_: unknown, form: FormData): Promise<{ error?: string; message?: string } | undefined> {
  if (!(await rateLimit("report", 10, 60 * 60 * 1000))) return { error: TOO_MANY };
  const parsed = reportSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const user = await getUser();
  await db.insert(s.reports).values({ ...parsed.data, reporterId: user?.id ?? null });
  await track("report_submitted", { userId: user?.id, props: { targetType: parsed.data.targetType } });
  return { message: "Thanks. Our team will review this report, usually within two working days." };
}

export async function recordContactClick(vendorId: string) {
  const user = await getUser();
  await db.update(s.vendors).set({ contactClicks: sql`${s.vendors.contactClicks} + 1` }).where(eq(s.vendors.id, vendorId));
  await track("contact_cta_clicked", { userId: user?.id, props: { vendor: vendorId.slice(0, 8) } });
}
