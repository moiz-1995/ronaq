import "server-only";
import { createHash } from "crypto";
import { db, schema as s } from "@/db";

/** PRD §18: pseudonymous analytics. Never pass message bodies or private event details in props. */
export async function track(
  name: string,
  opts: { userId?: string | null; cityId?: string | null; categoryId?: string | null; props?: Record<string, string | number | boolean | null> } = {},
) {
  try {
    const actor = opts.userId ? createHash("sha256").update("ronaq:" + opts.userId).digest("hex").slice(0, 16) : null;
    await db.insert(s.analyticsEvents).values({ name, actor, cityId: opts.cityId ?? null, categoryId: opts.categoryId ?? null, props: opts.props ?? {} });
  } catch {
    // analytics must never break a user flow
  }
}

/** FR-ADM-010: record sensitive actions. */
export async function audit(entry: { actorId: string | null; action: string; objectType: string; objectId?: string | null; reason?: string | null; before?: unknown; after?: unknown }) {
  await db.insert(s.auditLog).values({ ...entry, objectId: entry.objectId ?? null, reason: entry.reason ?? null });
}

export async function notify(userId: string | null | undefined, n: { type: string; title: string; body?: string; href?: string }) {
  if (!userId) return;
  await db.insert(s.notifications).values({ userId, ...n });
}
