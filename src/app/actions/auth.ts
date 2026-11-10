"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { checkPassword, createSession, destroySession, hashPassword, safeNext, getUser } from "@/lib/auth";
import { track } from "@/lib/track";
import { rateLimit, TOO_MANY } from "@/lib/ratelimit";
import { notify } from "@/lib/track";
import { appUrl, emailEnabled, sendEmail } from "@/lib/email";
import { clearResetTokens, createResetToken, findResetToken } from "@/lib/passwordReset";

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

/** The reply is the same whether or not the email has an account, so this can't be used to discover who is on Ronaq. */
export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return { error: "Sahi email likhein (enter a valid email)." };
  if (!(await rateLimit("forgot", 10, 60 * 60 * 1000)) || !(await rateLimit("forgot-email", 3, 60 * 60 * 1000, email))) return { error: TOO_MANY };
  const byEmail = emailEnabled();
  const user = await db.query.users.findFirst({ where: eq(s.users.email, email) });
  if (user && user.status === "active") {
    if (byEmail) {
      const raw = await createResetToken(user.id, 60 * 60 * 1000);
      await sendEmail(email, "Ronaq: naya password banayein", `Assalam o alaikum ${user.name},\n\nNaya password banane ke liye yeh link kholein (1 ghante tak chalega):\n${appUrl()}/reset?token=${raw}\n\nAgar aap ne yeh nahi maanga to is email ko chhor dein.`);
    } else {
      const contact = String(form.get("contact") ?? "").replace(/[^\d+ ]/g, "").trim().slice(0, 20);
      const admins = await db.select({ id: s.users.id }).from(s.users).where(eq(s.users.role, "admin"));
      for (const a of admins) await notify(a.id, { type: "admin_password_reset", title: `${user.name} forgot their password`, body: contact ? `${email} · WhatsApp ${contact}` : email, href: `/admin/users?q=${encodeURIComponent(email)}` });
    }
  }
  return { ok: true, message: byEmail ? "Agar yeh email Ronaq par hai to reset link bhej diya gaya hai. Apna inbox dekhein." : "Aap ki request mil gayi. Agar yeh email Ronaq par hai to team aap ko reset link bhej degi." };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  if (!(await rateLimit("reset", 10, 15 * 60 * 1000))) return { error: TOO_MANY };
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "Kam az kam 8 characters ka password rakhein." };
  const t = await findResetToken(String(form.get("token") ?? ""));
  if (!t) return { error: "Yeh link purana ho gaya hai. Naya link maangein." };
  await db.update(s.users).set({ passwordHash: await hashPassword(password) }).where(eq(s.users.id, t.userId));
  await clearResetTokens(t.userId);
  await track("password_reset_completed", { userId: t.userId });
  redirect(`/login?reason=${encodeURIComponent("Password badal gaya. Ab naye password se sign in karein.")}`);
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
