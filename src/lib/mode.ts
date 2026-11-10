// Vendor view vs customer view. The choice is remembered in a cookie so a vendor stays in their dashboard.
export const MODE_COOKIE = "ronaq_mode";
export type AccountMode = "vendor" | "customer";

const CUSTOMER_PAGES: [string, string][] = [
  ["/marketplace", "Marketplace"],
  ["/c", "Marketplace"],
  ["/dashboard", "planning dashboard"],
  ["/events", "Events"],
  ["/calendar", "Calendar"],
  ["/inbox", "khareedar messages"],
  ["/shortlist", "Shortlist"],
  ["/launchpad", "event planner"],
  ["/plan", "event planner"],
];

/** The friendly name of a customer-only page, or null if the path isn't one. */
export function customerPageName(path: string): string | null {
  return CUSTOMER_PAGES.find(([p]) => path === p || path.startsWith(`${p}/`))?.[1] ?? null;
}

/** Set for a moment after a switch from the profile menu, so the next page can say which mode you're in. */
export const SWITCHED_COOKIE = "ronaq_switched";

export const modeCookieOptions = () => ({ httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });

/** Who a notification is for: the person as a dukaandaar, as a khareedar, or as Ronaq staff. */
export function notificationAudience(n: { type: string; href?: string | null }): "vendor" | "customer" | "admin" {
  if (n.type.startsWith("admin_")) return "admin";
  if (n.type.startsWith("vendor_") || n.type === "review_new" || n.type === "portfolio_hidden" || n.href?.startsWith("/seller")) return "vendor";
  return "customer";
}
