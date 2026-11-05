import { describe, it, expect } from "vitest";
import { countdown, todayPKT, monthGrid } from "@/lib/time";
import { displayPrice, comparePrice } from "@/lib/price";
import { eventHeading, completeness, reviewEligibility, foundingOnApproval, servesArea } from "@/lib/domain";

describe("PKT countdown", () => {
  // 2026-11-05T20:30Z is already 6 Nov 01:30 in Pakistan
  const late = new Date("2026-11-05T20:30:00Z");
  it("uses Pakistan time for today", () => {
    expect(todayPKT(late)).toBe("2026-11-06");
  });
  it("counts future days", () => {
    expect(countdown("2026-12-26", late)).toEqual({ state: "future", days: 50 });
  });
  it("handles today", () => {
    expect(countdown("2026-11-06", late)).toEqual({ state: "today", days: 0 });
  });
  it("never goes negative", () => {
    expect(countdown("2026-11-01", late)).toEqual({ state: "past", daysAgo: 5 });
  });
  it("handles a missing date", () => {
    expect(countdown(null)).toEqual({ state: "none" });
  });
});

describe("month grid", () => {
  it("starts on Monday and covers the month", () => {
    const g = monthGrid(2026, 12);
    expect(g[0][0]).toBe("2026-11-30");
    expect(g.flat()).toContain("2026-12-31");
  });
});

describe("prices", () => {
  it("never shows a custom quote as a number", () => {
    expect(displayPrice("quote", 5000)).toMatchObject({ amount: "Custom quote", numeric: false });
  });
  it("labels units", () => {
    expect(displayPrice("per_person", 1450).unit).toBe("per person");
  });
  it("sorts quotes last", () => {
    const list = [
      { pricingModel: "quote" as const, priceAmount: null },
      { pricingModel: "per_person" as const, priceAmount: 2000 },
      { pricingModel: "per_person" as const, priceAmount: 1000 },
    ].sort(comparePrice);
    expect(list.map((x) => x.priceAmount)).toEqual([1000, 2000, null]);
  });
});

describe("event heading", () => {
  it("uses the label", () => expect(eventHeading({ label: "Shaadi" })).toBe("Shaadi ki Ronaq"));
  it("falls back to the type", () => expect(eventHeading({ type: "mehndi" })).toBe("Mehndi ki Ronaq"));
  it("doesn't double up", () => expect(eventHeading({ label: "Birthday ki Ronaq" })).toBe("Birthday ki Ronaq"));
  it("has a safe fallback", () => expect(eventHeading({ type: "custom" })).toBe("Apki Ronaq"));
});

describe("completeness", () => {
  it("lists what's missing", () => {
    const c = completeness({ name: "X", services: [], portfolioCount: 0 });
    expect(c.ready).toBe(false);
    expect(c.items.find((i) => i.key === "portfolio")?.done).toBe(false);
  });
  it("is ready when everything is there", () => {
    const c = completeness({
      name: "Hina", description: "x".repeat(50), cityId: "c", servesWholeCity: true, modes: ["home_visit"], phone: "0300",
      services: [{ title: "Bridal", pricingModel: "quote", priceAmount: null }], portfolioCount: 3,
    });
    expect(c.ready).toBe(true);
  });
});

describe("review eligibility", () => {
  const base = { signedIn: true, isOwner: false, alreadyReviewed: false, hasInquiry: true, vendorReplies: 1 };
  it("requires an inquiry by default", () => {
    expect(reviewEligibility({ basis: "inquiry", premoderate: false, minMessages: 1 }, { ...base, hasInquiry: false }).allowed).toBe(false);
    expect(reviewEligibility({ basis: "inquiry", premoderate: false, minMessages: 1 }, base).allowed).toBe(true);
  });
  it("holds admin-evidence reviews for approval", () => {
    expect(reviewEligibility({ basis: "admin_evidence", premoderate: false, minMessages: 0 }, { ...base, hasInquiry: false }).startsAs).toBe("pending");
  });
  it("blocks owners", () => {
    expect(reviewEligibility({ basis: "account", premoderate: false, minMessages: 0 }, { ...base, isOwner: true }).allowed).toBe(false);
  });
});

describe("founding vendors", () => {
  it("numbers the first N", () => expect(foundingOnApproval(199, 200, false)).toEqual({ founding: true, number: 200 }));
  it("stops at the cap", () => expect(foundingOnApproval(200, 200, false).founding).toBe(false));
});

describe("service areas", () => {
  const target = { id: "a1", cityId: "isb", lat: 33.69, lng: 73.035 };
  it("excludes other cities", () => {
    expect(servesArea({ cityId: "rwp", servesWholeCity: true, serviceAreaIds: [], serviceRadiusKm: null }, target)).toBe(false);
  });
  it("includes radius matches", () => {
    expect(servesArea({ cityId: "isb", servesWholeCity: false, serviceAreaIds: [], serviceRadiusKm: 5, areaLat: 33.695, areaLng: 73.014 }, target)).toBe(true);
  });
});
