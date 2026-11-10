"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser, safeNext } from "@/lib/auth";
import { MODE_COOKIE, SWITCHED_COOKIE, modeCookieOptions, type AccountMode } from "@/lib/mode";

async function remember(mode: AccountMode) {
  (await cookies()).set(MODE_COOKIE, mode, modeCookieOptions());
}

/** Switches between the vendor and customer views, then opens the requested page. */
export async function switchMode(mode: AccountMode, href: string, announce = false) {
  const user = await requireUser("/dashboard");
  if (mode === "vendor" && !(await db.query.vendors.findFirst({ where: eq(s.vendors.ownerId, user.id) }))) redirect("/seller/onboarding");
  await remember(mode === "vendor" ? "vendor" : "customer");
  // readable by the page for a few seconds, only to show the "you switched" popup
  if (announce) (await cookies()).set(SWITCHED_COOKIE, mode === "vendor" ? "vendor" : "customer", { path: "/", maxAge: 30, sameSite: "lax" });
  redirect(safeNext(href, mode === "vendor" ? "/seller" : "/dashboard"));
}

/** Opening any vendor page (for example from a notification) counts as being in vendor view. */
export async function syncVendorMode() {
  await remember("vendor");
}
