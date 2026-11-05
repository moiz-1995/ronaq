import "server-only";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";

export type ReviewPolicy = {
  /** inquiry: only consumers who messaged the vendor; account: any signed-in user; admin_evidence: review held until staff confirm evidence */
  basis: "inquiry" | "account" | "admin_evidence";
  premoderate: boolean;
  /** with basis=inquiry, the vendor must have replied at least this many times */
  minMessages: number;
};

const DEFAULTS = {
  reviewPolicy: { basis: "inquiry", premoderate: false, minMessages: 1 } as ReviewPolicy,
  foundingCap: 200,
  featuredEnabled: false,
};
type Settings = typeof DEFAULTS;

export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
  const row = await db.query.settings.findFirst({ where: eq(s.settings.key, key) });
  return (row?.value as Settings[K]) ?? DEFAULTS[key];
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  await db.insert(s.settings).values({ key, value }).onConflictDoUpdate({ target: s.settings.key, set: { value } });
}
