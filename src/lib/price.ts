import type { PricingModel } from "@/db/schema";

export const PRICING_LABELS: Record<PricingModel, string> = {
  fixed: "Fixed price",
  starting: "Starting from",
  per_person: "Per person",
  per_item: "Per item",
  package: "Package",
  quote: "Custom quote",
};

export function pkr(n: number): string {
  return "PKR " + new Intl.NumberFormat("en-PK").format(Math.round(n));
}

/** Compact: 1,800,000 → 1.8M, 742,000 → 742k */
export function pkrShort(n: number): string {
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 10_000) return `PKR ${Math.round(n / 1000)}k`;
  return pkr(n);
}

/** Slider stops for the budget filter. The first means no minimum, the last means no maximum. */
export const BUDGET_STOPS = [0, 500, 1000, 1500, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 30000, 40000, 50000, 75000, 100000, 150000, 200000, 300000, 500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000] as const;

export function nearestStop(n: number): number {
  let best = 0;
  BUDGET_STOPS.forEach((s, i) => { if (Math.abs(s - n) < Math.abs(BUDGET_STOPS[best] - n)) best = i; });
  return best;
}

export function budgetLabel(min: number | null | undefined, max: number | null | undefined): string {
  if (min && max) return `${pkrShort(min)} – ${pkrShort(max)}`;
  if (min) return `${pkrShort(min)} and up`;
  if (max) return `Up to ${pkrShort(max)}`;
  return "Any budget";
}

export type PriceDisplay = { lead: string; amount: string; unit: string; numeric: boolean };

/** FR-MKT-004: units are explicit, and a custom quote is never shown as a number. */
export function displayPrice(model: PricingModel, amount: number | null | undefined): PriceDisplay {
  if (model === "quote" || amount == null) return { lead: "Pricing", amount: "Custom quote", unit: "", numeric: false };
  switch (model) {
    case "per_person": return { lead: "from", amount: pkr(amount), unit: "per person", numeric: true };
    case "per_item": return { lead: "from", amount: pkr(amount), unit: "per item", numeric: true };
    case "package": return { lead: "from", amount: pkr(amount), unit: "package", numeric: true };
    case "starting": return { lead: "Starting from", amount: pkr(amount), unit: "", numeric: true };
    case "fixed": return { lead: "", amount: pkr(amount), unit: "fixed", numeric: true };
  }
}

/** Price sorting only compares like-for-like units; custom quotes always go last. */
export function comparePrice(
  a: { pricingModel: PricingModel; priceAmount: number | null },
  b: { pricingModel: PricingModel; priceAmount: number | null },
): number {
  const aq = a.pricingModel === "quote" || a.priceAmount == null;
  const bq = b.pricingModel === "quote" || b.priceAmount == null;
  if (aq && bq) return 0;
  if (aq) return 1;
  if (bq) return -1;
  return a.priceAmount! - b.priceAmount!;
}
