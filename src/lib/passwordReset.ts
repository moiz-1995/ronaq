import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db, schema as s } from "@/db";

const hash = (raw: string) => createHash("sha256").update(raw).digest("hex");

/** One live reset link per person. Only a hash is stored, so a database leak can't be used to reset passwords. */
export async function createResetToken(userId: string, ttlMs: number): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  await db.delete(s.tokens).where(and(eq(s.tokens.userId, userId), eq(s.tokens.kind, "reset_password")));
  await db.insert(s.tokens).values({ token: hash(raw), userId, kind: "reset_password", expiresAt: new Date(Date.now() + ttlMs) });
  return raw;
}

export async function findResetToken(raw: string) {
  const t = await db.query.tokens.findFirst({ where: and(eq(s.tokens.token, hash(raw)), eq(s.tokens.kind, "reset_password")) });
  return t && t.expiresAt.getTime() > Date.now() ? t : null;
}

export async function clearResetTokens(userId: string) {
  await db.delete(s.tokens).where(and(eq(s.tokens.userId, userId), eq(s.tokens.kind, "reset_password")));
}
