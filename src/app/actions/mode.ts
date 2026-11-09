"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser, safeNext } from "@/lib/auth";
import { MODE_COOKIE, type AccountMode } from "@/lib/mode";

async function remember(mode: AccountMode) {
  (await cookies()).set(MODE_COOKIE, mode, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
}

/** Switches between the vendor and customer views, then opens the requested page. */
export async function switchMode(mode: AccountMode, href: string) {
  const user = await requireUser("/dashboard");
  if (mode === "vendor" && !(await db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, user.id) }))) redirect("/seller/onboarding");
  await remember(mode === "vendor" ? "vendor" : "customer");
  redirect(safeNext(href, mode === "vendor" ? "/seller" : "/dashboard"));
}

/** Opening any vendor page (for example from a notification) counts as being in vendor view. */
export async function syncVendorMode() {
  await remember("vendor");
}
