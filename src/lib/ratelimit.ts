import "server-only";
import { headers } from "next/headers";

/**
 * Simple fixed-window rate limiter (PRD §17 security). In-memory, so per server instance —
 * good enough for one Vercel region at MVP scale. For multiple instances swap in Upstash Redis (free tier).
 */
const buckets = new Map<string, { n: number; reset: number }>();

export async function rateLimit(scope: string, limit: number, windowMs: number, key?: string): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  const k = `${scope}:${key ?? ip}`;
  const now = Date.now();
  const b = buckets.get(k);
  if (!b || b.reset < now) {
    buckets.set(k, { n: 1, reset: now + windowMs });
    if (buckets.size > 10000) for (const [kk, v] of buckets) if (v.reset < now) buckets.delete(kk);
    return true;
  }
  b.n++;
  return b.n <= limit;
}

export const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";
