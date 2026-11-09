// Vendor view vs customer view. The choice is remembered in a cookie so a vendor stays in their dashboard.
export const MODE_COOKIE = "ronaq_mode";
export type AccountMode = "vendor" | "customer";

const CUSTOMER_PAGES: [string, string][] = [
  ["/marketplace", "Marketplace"],
  ["/c", "Marketplace"],
  ["/dashboard", "your planning dashboard"],
  ["/events", "Events"],
  ["/calendar", "Calendar"],
  ["/inbox", "your customer messages"],
  ["/shortlist", "Shortlist"],
  ["/launchpad", "the event planner"],
  ["/plan", "the event planner"],
];

/** The friendly name of a customer-only page, or null if the path isn't one. */
export function customerPageName(path: string): string | null {
  return CUSTOMER_PAGES.find(([p]) => path === p || path.startsWith(`${p}/`))?.[1] ?? null;
}
