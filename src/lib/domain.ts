// Pure business rules (unit-tested in tests/domain.test.ts).
import { EVENT_TYPES } from "@/db/catalog";
import type { ReviewPolicy } from "./settings";

/** FR-EVT-004: "Shaadi ki Ronaq", with user labels and a safe fallback. */
export function eventHeading(ev: { label?: string | null; type?: string | null; name?: string | null } | null | undefined): string {
  if (!ev) return "Ap ki Ronaq";
  const raw = (ev.label ?? "").trim() || EVENT_TYPES.find((t) => t.value === ev.type)?.heading || "";
  const clean = raw.replace(/\s+ki\s+ronaq$/i, "").slice(0, 28);
  return clean ? `${clean} ki Ronaq` : "Ap ki Ronaq";
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

/** FR-SEL-004: the basics a profile needs to go live. Optional items are encouraged through profileTips, never required. */
export function completeness(v: CompletenessInput) {
  const items = [
    { key: "name", label: "Dukaan ka naam", done: !!v.name?.trim() },
    { key: "description", label: "Description of at least 40 characters", optional: true, done: (v.description?.trim().length ?? 0) >= 40 },
    { key: "location", label: "Sheher", done: !!v.cityId },
    { key: "areas", label: "Areas you serve", optional: true, done: !!v.servesWholeCity || (v.serviceAreaIds?.length ?? 0) > 0 || !!v.serviceRadiusKm },
    { key: "modes", label: "Service kaise dete hain", done: (v.modes?.length ?? 0) > 0 },
    { key: "contact", label: "Phone ya email", done: !!(v.phone?.trim() || v.email?.trim()) },
    { key: "service", label: "Kam az kam ek service", done: v.services.some((s) => s.title.trim()) },
    { key: "portfolio", label: `${MIN_PORTFOLIO}+ portfolio images`, optional: true, done: v.portfolioCount >= MIN_PORTFOLIO },
  ] as { key: string; label: string; done: boolean; optional?: boolean }[];
  const done = items.filter((i) => i.done).length;
  return { items, done, total: items.length, percent: Math.round((done / items.length) * 100), ready: items.every((i) => i.done || i.optional) };
}

export type TipsInput = CompletenessInput & {
  coverImage?: string | null;
  logoImage?: string | null;
  workingHours?: string | null;
  experienceYears?: number | null;
  socials?: Record<string, string | undefined> | null;
  workReferences?: unknown[] | null;
};

/** After publishing: the empty fields worth filling, most valuable first, and how strong the profile is overall. */
export function profileTips(v: TipsInput) {
  const checks = [
    { key: "photos", done: v.portfolioCount >= MIN_PORTFOLIO, title: `Apne kaam ki ${MIN_PORTFOLIO} ya zyada photos lagayein`, why: "Khareedar sab se pehle photos dekhte hain.", href: "/seller/portfolio" },
    { key: "price", done: v.services.some((s) => s.pricingModel !== "quote" && (s.priceAmount ?? 0) > 0), title: "Rate likhein, chahe “Starting from” ho", why: "Khareedar budget se filter karte hain.", href: "/seller/services" },
    { key: "description", done: (v.description?.trim().length ?? 0) >= 40, title: "Apne kaam ke baare mein likhein", why: "Do teen lines se bharosa banta hai.", href: "/seller/profile" },
    { key: "areas", done: !!v.servesWholeCity || (v.serviceAreaIds?.length ?? 0) > 0 || !!v.serviceRadiusKm, title: "Apne ilaqe chunein", why: "Taake khareedar apne sector mein aap ko dhoond sakein.", href: "/seller/profile" },
    { key: "references", done: (v.workReferences?.length ?? 0) > 0, title: "Pichla kaam aur references likhein", why: "Pichle events se tajurba nazar aata hai.", href: "/seller/profile#references" },
    { key: "cover", done: !!v.coverImage, title: "Cover photo lagayein", why: "Aap ke card par sab se pehle yehi nazar aati hai.", href: "/seller/profile" },
    { key: "logo", done: !!v.logoImage, title: "Apna logo lagayein", why: "Log aap ka naam yaad rakhte hain.", href: "/seller/profile" },
    { key: "socials", done: Object.values(v.socials ?? {}).some(Boolean), title: "Instagram ya website jorein", why: "Khareedar aap ka aur kaam dekhna chahte hain.", href: "/seller/profile" },
    { key: "hours", done: !!v.workingHours?.trim(), title: "Kaam ke auqaat likhein", why: "Khareedar ko pata chalta hai kab rabta karein.", href: "/seller/profile" },
    { key: "experience", done: v.experienceYears != null, title: "Apna tajurba likhein", why: "Aap ko chunne ki ek aur wajah.", href: "/seller/profile" },
  ];
  const done = checks.filter((c) => c.done).length;
  return { tips: checks.filter((c) => !c.done), done, total: checks.length, percent: Math.round((done / checks.length) * 100) };
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
  closed: "Done",
};

/** Guest ranges for event forms. The stored number is the range's upper bound; custom counts are stored as-is. */
export const GUEST_RANGES = [
  { max: 25, label: "Up to 25" },
  { max: 50, label: "25–50" },
  { max: 100, label: "50–100" },
  { max: 200, label: "100–200" },
  { max: 350, label: "200–350" },
  { max: 500, label: "350–500" },
  { max: 800, label: "500–800" },
  { max: 1200, label: "800–1,200" },
  { max: 2000, label: "1,200+" },
] as const;

export function guestLabel(n: number | null | undefined): string | null {
  if (!n) return null;
  const r = GUEST_RANGES.find((g) => g.max === n);
  return r ? `${r.label} guests` : `${n.toLocaleString("en-PK")} guests`;
}
