import { describe, it, expect } from "vitest";
import { countdown, todayPKT, monthGrid } from "@/lib/time";
import { displayPrice, comparePrice } from "@/lib/price";
import { eventHeading, completeness, profileTips, reviewEligibility, foundingOnApproval, servesArea } from "@/lib/domain";

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
  it("has a safe fallback", () => expect(eventHeading({ type: "custom" })).toBe("Ap ki Ronaq"));
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

import { parseQuery, stems } from "@/lib/searchTerms";
describe("search terms", () => {
  it("maps plurals and trades to categories", () => {
    expect(parseQuery("photographers").categorySlugs).toContain("photography");
    expect(parseQuery("caterer").categorySlugs).toContain("catering");
    expect(parseQuery("biryani daig").categorySlugs).toContain("catering");
    expect(parseQuery("bridal parlour").categorySlugs).toContain("makeup-hair");
    expect(parseQuery("dj for mehndi").categorySlugs).toEqual(expect.arrayContaining(["entertainment", "mehndi-henna"]));
  });
  it("drops filler words", () => {
    expect(parseQuery("best cake in G-11").words.map((w) => w.raw)).toEqual(["cake", "g-11"]);
  });
  it("stems plurals", () => {
    expect(stems("photographers")).toContain("photographer");
    expect(stems("decorations")).toContain("decoration");
  });
});

import { normalizeSocial, socialLabel } from "@/lib/socials";
describe("vendor social links", () => {
  it("turns handles into links", () => {
    expect(normalizeSocial("instagram", "@hina.henna")).toBe("https://instagram.com/hina.henna");
    expect(normalizeSocial("tiktok", "dholsajan")).toBe("https://www.tiktok.com/@dholsajan");
  });
  it("accepts full links and bare domains", () => {
    expect(normalizeSocial("facebook", "facebook.com/RonaqEvents")).toBe("https://facebook.com/RonaqEvents");
    expect(normalizeSocial("website", "sugarandsaffron.pk")).toBe("https://sugarandsaffron.pk");
  });
  it("rejects the wrong site and junk", () => {
    expect(() => normalizeSocial("instagram", "https://evil.example/x")).toThrow();
    expect(() => normalizeSocial("website", "javascript:alert(1)")).toThrow();
    expect(normalizeSocial("youtube", "")).toBeNull();
  });
  it("labels links", () => {
    expect(socialLabel("instagram", "https://instagram.com/hina.henna")).toBe("@hina.henna");
    expect(socialLabel("website", "https://www.noorlens.pk")).toBe("noorlens.pk");
  });
});

import { guestLabel } from "@/lib/domain";
describe("guest labels", () => {
  it("shows ranges for range values", () => expect(guestLabel(200)).toBe("100–200 guests"));
  it("shows exact custom counts", () => expect(guestLabel(137)).toBe("137 guests"));
  it("handles empty", () => expect(guestLabel(null)).toBeNull());
});

describe("publishing without photos", () => {
  const basics = { name: "X", cityId: "c", modes: ["on_site"], email: "a@b.pk", services: [{ title: "Bridal", pricingModel: "quote", priceAmount: null }], portfolioCount: 0 };
  it("is ready with no photos, description or areas", () => expect(completeness(basics).ready).toBe(true));
  it("still needs a service", () => expect(completeness({ ...basics, services: [] }).ready).toBe(false));
  it("suggests what's missing, photos first", () => {
    const t = profileTips(basics);
    expect(t.tips[0].key).toBe("photos");
    expect(t.tips.map((x) => x.key)).toContain("references");
    expect(t.done).toBe(0);
  });
  it("stops suggesting what's filled", () => {
    const t = profileTips({ ...basics, portfolioCount: 3, workReferences: [{}], socials: { instagram: "https://instagram.com/x" } });
    const keys = t.tips.map((x) => x.key);
    expect(keys).not.toContain("photos");
    expect(keys).not.toContain("references");
    expect(keys).not.toContain("socials");
  });
});

import { parseReferences, normalizeReferenceLink } from "@/lib/references";
describe("work references", () => {
  it("adds https to bare links", () => expect(normalizeReferenceLink("instagram.com/p/abc")).toBe("https://instagram.com/p/abc"));
  it("upgrades http", () => expect(normalizeReferenceLink("http://noor.pk/x")).toBe("https://noor.pk/x"));
  it("rejects scripts", () => {
    expect(() => normalizeReferenceLink("javascript:alert(1)")).toThrow();
    expect(() => normalizeReferenceLink("data:text/html,hi")).toThrow();
    expect(() => normalizeReferenceLink("ftp://noor.pk")).toThrow();
  });
  it("drops rows with no title and keeps columns aligned", () => {
    expect(parseReferences({ titles: ["", "Barat"], clients: ["A", "Khan family"], notes: ["", ""], links: ["", ""] })).toEqual([{ title: "Barat", client: "Khan family" }]);
  });
});

import { budgetLabel, nearestStop, BUDGET_STOPS } from "@/lib/price";
describe("budget slider", () => {
  it("labels ranges", () => {
    expect(budgetLabel(null, null)).toBe("Any budget");
    expect(budgetLabel(null, 50000)).toBe("Up to PKR 50k");
    expect(budgetLabel(5000, null)).toBe("PKR 5,000 and up");
    expect(budgetLabel(5000, 1500000)).toBe("PKR 5,000 – PKR 1.5M");
  });
  it("snaps typed values to the nearest stop", () => expect(BUDGET_STOPS[nearestStop(10400)]).toBe(10000));
});

import { customerPageName } from "@/lib/mode";
describe("vendor and customer views", () => {
  it("knows customer pages", () => {
    expect(customerPageName("/marketplace")).toBe("Marketplace");
    expect(customerPageName("/c/henna")).toBe("Marketplace");
    expect(customerPageName("/events/abc")).toBe("Events");
  });
  it("leaves shared and vendor pages alone", () => {
    expect(customerPageName("/seller/services")).toBeNull();
    expect(customerPageName("/v/hina")).toBeNull();
    expect(customerPageName("/account")).toBeNull();
    expect(customerPageName("/contact")).toBeNull();
  });
});

import { TIME_SLOTS, formatHours, parseHours } from "@/lib/hours";
describe("working hours", () => {
  it("covers early morning to late night in half hours", () => {
    expect(TIME_SLOTS[0]).toBe("6:00 AM");
    expect(TIME_SLOTS).toContain("12:00 AM");
    expect(TIME_SLOTS.at(-1)).toBe("3:00 AM");
  });
  it("reads back what it wrote", () => expect(parseHours(formatHours("10:00 AM", "9:30 PM"))).toEqual({ from: "10:00 AM", to: "9:30 PM" }));
  it("understands older short times", () => expect(parseHours("10am – 9pm")).toEqual({ from: "10:00 AM", to: "9:00 PM" }));
  it("recognises flexible", () => expect(parseHours("Flexible")).toEqual({ flexible: true }));
  it("keeps free text it can't read", () => expect(parseHours("10am – 9pm, closed Friday")).toEqual({ legacy: "10am – 9pm, closed Friday" }));
  it("handles empty", () => expect(parseHours("")).toBeNull());
});

describe("publishing a new vendor's default service", () => {
  it("counts a service whose price isn't filled in yet", () => {
    const c = completeness({ name: "X", cityId: "c", modes: ["on_site"], email: "a@b.pk", services: [{ title: "Gifts", pricingModel: "per_item", priceAmount: null }], portfolioCount: 0 });
    expect(c.ready).toBe(true);
  });
});
