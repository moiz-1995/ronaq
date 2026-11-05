// Pure business rules (unit-tested in tests/domain.test.ts).
import { EVENT_TYPES } from "@/db/catalog";
import type { ReviewPolicy } from "./settings";

/** FR-EVT-004: "Shaadi ki Ronaq", with user labels and a safe fallback. */
export function eventHeading(ev: { label?: string | null; type?: string | null; name?: string | null } | null | undefined): string {
  if (!ev) return "Apki Ronaq";
  const raw = (ev.label ?? "").trim() || EVENT_TYPES.find((t) => t.value === ev.type)?.heading || "";
  const clean = raw.replace(/\s+ki\s+ronaq$/i, "").slice(0, 28);
  return clean ? `${clean} ki Ronaq` : "Apki Ronaq";
}

export type CompletenessInput = {
  name?: string | null;
  description?: string | null;
  cityId?: string | null;
  servesWholeCity?: boolean;
  serviceAreaIds?: string[] | null;
  serviceRadiusKm?: number | null;
  modes?: string[] | null;
  phone?: string | null;
  email?: string | null;
  services: { title: string; pricingModel: string; priceAmount: number | null }[];
  portfolioCount: number;
};

export const MIN_PORTFOLIO = 3;

/** FR-SEL-004: what's still missing before a profile can be submitted. */
export function completeness(v: CompletenessInput) {
  const items = [
    { key: "name", label: "Business name", done: !!v.name?.trim() },
    { key: "description", label: "Description of at least 40 characters", done: (v.description?.trim().length ?? 0) >= 40 },
    { key: "location", label: "City", done: !!v.cityId },
    { key: "areas", label: "Areas you serve", done: !!v.servesWholeCity || (v.serviceAreaIds?.length ?? 0) > 0 || !!v.serviceRadiusKm },
    { key: "modes", label: "How you deliver (home visit, venue, delivery…)", done: (v.modes?.length ?? 0) > 0 },
    { key: "contact", label: "Phone or email", done: !!(v.phone?.trim() || v.email?.trim()) },
    { key: "service", label: "At least one service with pricing", done: v.services.some((s) => s.title.trim() && (s.pricingModel === "quote" || (s.priceAmount ?? 0) > 0)) },
    { key: "portfolio", label: `${MIN_PORTFOLIO}+ portfolio images`, done: v.portfolioCount >= MIN_PORTFOLIO },
  ];
  const done = items.filter((i) => i.done).length;
  return { items, done, total: items.length, percent: Math.round((done / items.length) * 100), ready: done === items.length };
}

/** §13: review eligibility is configurable by admins. */
export function reviewEligibility(
  policy: ReviewPolicy,
  ctx: { signedIn: boolean; isOwner: boolean; alreadyReviewed: boolean; hasInquiry: boolean; vendorReplies: number },
): { allowed: boolean; reason?: string; basis?: "inquiry" | "account" | "admin_evidence"; startsAs: "published" | "pending" } {
  const startsAs = policy.premoderate || policy.basis === "admin_evidence" ? "pending" : "published";
  if (!ctx.signedIn) return { allowed: false, reason: "Sign in to leave a review.", startsAs };
  if (ctx.isOwner) return { allowed: false, reason: "You can't review your own business.", startsAs };
  if (ctx.alreadyReviewed) return { allowed: false, reason: "You've already reviewed this vendor.", startsAs };
  if (policy.basis === "inquiry") {
    if (!ctx.hasInquiry) return { allowed: false, reason: "You can review a vendor after you've contacted them through Ronaq.", startsAs };
    if (ctx.vendorReplies < policy.minMessages) return { allowed: false, reason: "You can review once the vendor has replied to your inquiry.", startsAs };
    return { allowed: true, basis: "inquiry", startsAs };
  }
  if (policy.basis === "admin_evidence") return { allowed: true, basis: "admin_evidence", startsAs: "pending" };
  return { allowed: true, basis: ctx.hasInquiry ? "inquiry" : "account", startsAs };
}

/** FR-SEL-007: the first N approved vendors become founding vendors. */
export function foundingOnApproval(alreadyFounding: number, cap: number, isAlreadyFounding: boolean): { founding: boolean; number: number | null } {
  if (isAlreadyFounding) return { founding: true, number: null };
  if (alreadyFounding >= cap) return { founding: false, number: null };
  return { founding: true, number: alreadyFounding + 1 };
}

/** Changes to these fields after approval go back to review (FR-SEL-010). */
export const MATERIAL_FIELDS = ["name", "description", "businessType", "coverImage", "logoImage"] as const;

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371, toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** FR-MKT-005: does the vendor serve this area? */
export function servesArea(
  v: { cityId: string | null; servesWholeCity: boolean; serviceAreaIds: string[] | null; serviceRadiusKm: number | null; areaLat?: number | null; areaLng?: number | null },
  target: { id: string; cityId: string; lat: number | null; lng: number | null },
): boolean {
  if (v.cityId !== target.cityId) return false;
  if (v.servesWholeCity) return true;
  if (v.serviceAreaIds?.includes(target.id)) return true;
  if (v.serviceRadiusKm && v.areaLat != null && v.areaLng != null && target.lat != null && target.lng != null) {
    return haversineKm({ lat: v.areaLat, lng: v.areaLng }, { lat: target.lat, lng: target.lng }) <= v.serviceRadiusKm;
  }
  return false;
}

export const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  searching: "Searching",
  shortlisted: "Shortlisted",
  booked: "Booked",
  completed: "Completed",
};

export const INQUIRY_STATUS_LABELS: Record<string, string> = {
  sent: "Sent",
  delivered: "Delivered",
  responded: "Replied",
  closed: "Closed",
};
