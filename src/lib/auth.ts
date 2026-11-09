import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import type { User } from "@/db/schema";

const COOKIE = "ronaq_session";
if (process.env.NODE_ENV === "production" && process.env.VERCEL && !process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET must be set in production.");
}
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-only-secret-change-me-in-production-please");

export async function hashPassword(p: string) {
  return bcrypt.hash(p, 10);
}
export async function checkPassword(p: string, hash: string) {
  return bcrypt.compare(p, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    const user = await db.query.users.findFirst({ where: eq(s.users.id, payload.sub) });
    if (!user || user.status !== "active") return null;
    return user;
  } catch {
    return null;
  }
});

/** FR-CUS-002/003: send guests to sign in, remembering where they were going. */
export async function requireUser(next = "/dashboard"): Promise<User> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireStaff(): Promise<User> {
  const user = await requireUser("/admin");
  if (user.role !== "admin" && user.role !== "moderator") redirect("/");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/admin");
  return user;
}

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
