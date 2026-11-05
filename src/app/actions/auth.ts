"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { checkPassword, createSession, destroySession, hashPassword, safeNext, getUser } from "@/lib/auth";
import { track } from "@/lib/track";
import { rateLimit, TOO_MANY } from "@/lib/ratelimit";

export type FormState = { error?: string; fields?: Record<string, string>; ok?: boolean; message?: string } | undefined;

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters for your password."),
  intent: z.enum(["plan", "sell"]).default("plan"),
});

export async function signUpAction(_: FormState, form: FormData): Promise<FormState> {
  if (!(await rateLimit("signup", 10, 60 * 60 * 1000))) return { error: TOO_MANY };
  const raw = Object.fromEntries(form) as Record<string, string>;
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields: { name: raw.name ?? "", email: raw.email ?? "" } };
  const { name, email, password, intent } = parsed.data;
  const exists = await db.query.users.findFirst({ where: eq(s.users.email, email) });
  if (exists) return { error: "An account with this email already exists. Sign in instead.", fields: { name, email } };
  const [user] = await db.insert(s.users).values({ name, email, passwordHash: await hashPassword(password), isSeller: intent === "sell" }).returning();
  // Email verification: in development the link is printed to the server console. Plug a free email
  // provider (e.g. Resend free tier) into sendVerification() for production.
  const token = crypto.randomUUID();
  await db.insert(s.tokens).values({ token, userId: user.id, kind: "verify_email", expiresAt: new Date(Date.now() + 3 * 86400000) });
  console.info(`[ronaq] verify ${email}: /verify?token=${token}`);
  await createSession(user.id);
  await track("registration_completed", { userId: user.id, props: { intent } });
  const next = raw.next ? safeNext(raw.next) : null;
  if (intent === "sell") redirect("/seller/onboarding");
  redirect(next ?? "/onboarding");
}

export async function signInAction(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", fields: { email } };
  if (!(await rateLimit("login", 10, 15 * 60 * 1000)) || !(await rateLimit("login-email", 8, 15 * 60 * 1000, email))) return { error: TOO_MANY, fields: { email } };
  const user = await db.query.users.findFirst({ where: eq(s.users.email, email) });
  if (!user || !(await checkPassword(password, user.passwordHash))) return { error: "That email and password don't match. Check them and try again.", fields: { email } };
  if (user.status === "suspended") return { error: "This account is suspended. Contact support@ronaq.pk if you think this is a mistake.", fields: { email } };
  await createSession(user.id);
  redirect(safeNext(String(form.get("next") ?? ""), user.role !== "user" ? "/admin" : "/dashboard"));
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}

export async function verifyEmail(token: string): Promise<boolean> {
  const t = await db.query.tokens.findFirst({ where: eq(s.tokens.token, token) });
  if (!t || t.kind !== "verify_email" || t.expiresAt.getTime() < Date.now()) return false;
  await db.update(s.users).set({ emailVerified: true }).where(eq(s.users.id, t.userId));
  await db.delete(s.tokens).where(eq(s.tokens.token, token));
  return true;
}

export async function resendVerification(): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Sign in first." };
  const token = crypto.randomUUID();
  await db.insert(s.tokens).values({ token, userId: user.id, kind: "verify_email", expiresAt: new Date(Date.now() + 3 * 86400000) });
  console.info(`[ronaq] verify ${user.email}: /verify?token=${token}`);
  return { ok: true, message: "We've sent a new verification link to your email." };
}
