/* Seed the database: catalogue + demo accounts + demo vendors. Run: npm run db:seed */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, schema as s } from "./index";
import { CATEGORIES, CITIES, TEMPLATES } from "./catalog";
import type { PricingModel } from "./schema";

const slugify = (x: string) => x.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  // wipe (order doesn't matter in SQLite without FKs)
  for (const t of [s.messages, s.inquiries, s.reviews, s.reports, s.notifications, s.quotes, s.reminders, s.checklistVendors, s.checklistItems, s.events, s.shortlist, s.availability, s.portfolioItems, s.vendorServices, s.vendors, s.templates, s.attributes, s.categories, s.areas, s.cities, s.tokens, s.users, s.auditLog, s.analyticsEvents, s.settings]) {
    await db.delete(t);
  }

  const cityIds: Record<string, string> = {};
  const areaIds: Record<string, string> = {};
  for (const [i, c] of CITIES.entries()) {
    const [row] = await db.insert(s.cities).values({ slug: c.slug, name: c.name, province: c.province, active: c.active, sortOrder: i }).returning();
    cityIds[c.slug] = row.id;
    for (const [name, lat, lng] of c.areas) {
      const [a] = await db.insert(s.areas).values({ cityId: row.id, name, slug: slugify(name), lat, lng }).returning();
      areaIds[`${c.slug}:${name}`] = a.id;
    }
  }

  const catIds: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const [row] = await db.insert(s.categories).values({ slug: c.slug, name: c.name, noun: c.noun, icon: c.icon, art: c.art, description: c.description, priceModels: c.priceModels, sortOrder: i }).returning();
    catIds[c.slug] = row.id;
    for (const [j, a] of c.attrs.entries()) {
      await db.insert(s.attributes).values({ categoryId: row.id, key: a.key, label: a.label, type: a.type, options: a.options ?? [], unit: a.unit, required: a.required ?? false, filterable: a.filterable ?? false, vendorDeclared: a.vendorDeclared ?? false, help: a.help, sortOrder: j });
    }
  }

  for (const [i, t] of TEMPLATES.entries()) {
    await db.insert(s.templates).values({ slug: t.slug, name: t.name, eventType: t.eventType, label: t.label, items: t.items.map(([label, categorySlug]) => ({ label, categorySlug })), sortOrder: i });
  }

  await db.insert(s.settings).values([
    { key: "reviewPolicy", value: { basis: "inquiry", premoderate: false, minMessages: 1 } },
    { key: "foundingCap", value: 200 },
    { key: "featuredEnabled", value: false },
  ]);

  const hash = (p: string) => bcrypt.hashSync(p, 10);
  const [admin] = await db.insert(s.users).values({ email: "admin@ronaq.pk", passwordHash: hash("ronaq-admin"), name: "Ronaq Ops", role: "admin", emailVerified: true, cityId: cityIds.islamabad, onboardedAt: new Date(), launchpadStep: 4 }).returning();
  await db.insert(s.users).values({ email: "moderator@ronaq.pk", passwordHash: hash("ronaq-mod"), name: "Sana (Moderator)", role: "moderator", emailVerified: true, cityId: cityIds.islamabad, onboardedAt: new Date(), launchpadStep: 4 });
  const [ayesha] = await db.insert(s.users).values({ email: "ayesha@example.com", passwordHash: hash("password123"), name: "Ayesha Khan", cityId: cityIds.rawalpindi, interests: ["mehndi-henna", "catering", "photography"], planningEvent: true, heardFrom: "Instagram", emailVerified: true, onboardedAt: new Date(), launchpadStep: 4 }).returning();

  type V = { name: string; cat: string; city: string; area: string; model: PricingModel; price?: number; title: string; desc: string; modes: string[]; rating: number; count: number; founding?: boolean; attrs?: Record<string, string | string[] | boolean | number>; years: number; owner?: string };
  const V: V[] = [
    { name: "Hina's Henna Studio", cat: "mehndi-henna", city: "rawalpindi", area: "Satellite Town", model: "per_person", price: 4500, title: "Bridal & party mehndi", desc: "Fine-line bridal mehndi with dark, long-lasting stain. I bring fresh, home-made cones to your home.", modes: ["home_visit", "on_site"], rating: 4.9, count: 38, founding: true, years: 8, attrs: { style: ["Arabic", "Pakistani traditional"], occasion_type: ["Bridal", "Party"], organic: true, clients_per_session: 12, advance_booking: "2 weeks" }, owner: "hina@example.com" },
    { name: "Mehndi by Maham", cat: "mehndi-henna", city: "islamabad", area: "G-11", model: "per_person", price: 2500, title: "Party mehndi for the whole family", desc: "Quick, pretty designs for mehndi nights and Eid. Groups of 10+ welcome.", modes: ["home_visit"], rating: 4.7, count: 22, founding: true, years: 4, attrs: { style: ["Arabic", "Minimal"], occasion_type: ["Party", "Kids"], organic: true, clients_per_session: 20 } },
    { name: "Rang-e-Hina", cat: "mehndi-henna", city: "islamabad", area: "F-10", model: "package", price: 18000, title: "Bridal package with two family members", desc: "Full hands and feet for the bride plus two family members. Moroccan and Indo-Arabic specialist.", modes: ["home_visit", "premises"], rating: 4.8, count: 15, years: 6, attrs: { style: ["Moroccan", "Indo-Arabic"], occasion_type: ["Bridal"], advance_booking: "1 month+" } },
    { name: "Glow by Zara", cat: "makeup-hair", city: "islamabad", area: "F-7", model: "package", price: 45000, title: "Bridal makeup and hair", desc: "Soft glam and traditional bridal looks. Trial session included in the package.", modes: ["premises", "home_visit"], rating: 4.8, count: 61, founding: true, years: 9, attrs: { occasion_type: ["Bridal", "Engagement"], location: ["Studio", "Home visit"], trial: true, team_size: 4 } },
    { name: "Studio Noor Beauty", cat: "makeup-hair", city: "rawalpindi", area: "Commercial Market", model: "per_person", price: 6000, title: "Party makeup", desc: "Party makeup and hair styling for guests and family. Group rates for 5 or more.", modes: ["premises"], rating: 4.5, count: 40, years: 5, attrs: { occasion_type: ["Party"], location: ["Studio"], trial: false } },
    { name: "Ustad Rafiq Daig House", cat: "catering", city: "rawalpindi", area: "Saddar", model: "per_person", price: 1450, title: "Daig biryani, qorma and zarda", desc: "Three generations of daig cooking. Wood-fire biryani and qorma delivered hot to your door.", modes: ["delivery", "on_site"], rating: 4.7, count: 112, founding: true, years: 30, attrs: { cuisine: ["Desi", "Daig"], service_style: ["Delivery", "On-site"], max_guests: 1500, serving_staff: true } },
    { name: "Ammi's Kitchen", cat: "catering", city: "islamabad", area: "G-9", model: "per_person", price: 1200, title: "Home-cooked dinners for 20–150", desc: "Home-style desi food for dholkis and small functions. Menu customised for your family.", modes: ["delivery"], rating: 4.9, count: 47, founding: true, years: 3, attrs: { cuisine: ["Desi", "Sweets"], service_style: ["Delivery"], max_guests: 150, serving_staff: false, dietary: ["Low spice"] } },
    { name: "Royal Feast Caterers", cat: "catering", city: "islamabad", area: "I-8", model: "quote", title: "Full-service wedding catering", desc: "Live BBQ stations, continental and desi menus, full serving staff and crockery.", modes: ["on_site"], rating: 4.4, count: 89, years: 14, attrs: { cuisine: ["Desi", "BBQ", "Continental"], service_style: ["On-site", "Live stations"], max_guests: 2000, serving_staff: true } },
    { name: "Bloom & Banni Decor", cat: "decor", city: "islamabad", area: "DHA Phase 2", model: "quote", title: "Stage, floral and lighting decor", desc: "Fresh-flower stages, fairy-light canopies and themed mehndi setups.", modes: ["on_site"], rating: 4.6, count: 21, years: 7, attrs: { event_type: ["Mehndi", "Barat", "Walima"], setting: ["Indoor", "Outdoor", "Lawn"], setup_teardown: true } },
    { name: "Genda Phool Events", cat: "decor", city: "rawalpindi", area: "Westridge", model: "starting", price: 35000, title: "Mehndi and dholki decor at home", desc: "Marigold, paranday and truck-art themed decor for homes and rooftops.", modes: ["on_site"], rating: 4.8, count: 33, founding: true, years: 5, attrs: { event_type: ["Mehndi", "Birthday"], setting: ["Home", "Outdoor"], setup_teardown: true, theme: "Truck art, marigold, desi" } },
    { name: "Balloon Mela", cat: "decor", city: "islamabad", area: "G-13", model: "package", price: 15000, title: "Birthday balloon and theme decor", desc: "Balloon arches, character themes and backdrops for kids' birthdays.", modes: ["on_site"], rating: 4.5, count: 58, years: 4, attrs: { event_type: ["Birthday"], setting: ["Indoor", "Home"], setup_teardown: true } },
    { name: "Noor Lens Studio", cat: "photography", city: "islamabad", area: "F-10", model: "package", price: 65000, title: "Wedding day photo and video", desc: "Candid storytelling with a female photographer available for ladies' functions.", modes: ["on_site"], rating: 4.8, count: 54, founding: true, years: 10, attrs: { deliverables: ["Photos", "Video", "Highlight reel"], hours: 8, female_photographer: true, turnaround: "2–4 weeks" } },
    { name: "Pindi Clicks", cat: "photography", city: "rawalpindi", area: "Chaklala Scheme 3", model: "starting", price: 25000, title: "Event photography", desc: "Affordable coverage for mehndis, birthdays and small functions.", modes: ["on_site"], rating: 4.4, count: 29, years: 4, attrs: { deliverables: ["Photos", "Album"], hours: 4, female_photographer: false, turnaround: "1 week" } },
    { name: "Sugar & Saffron", cat: "cakes-desserts", city: "islamabad", area: "E-11", model: "starting", price: 4500, title: "Custom celebration cakes", desc: "Fondant and buttercream cakes, cupcake towers and dessert tables.", modes: ["delivery", "premises"], rating: 4.9, count: 76, founding: true, years: 6, attrs: { type: ["Cakes", "Cupcakes", "Dessert table"], eggless: true, delivery: ["Delivery", "Pickup"], lead_time: "1 week" } },
    { name: "Mithai Ghar", cat: "cakes-desserts", city: "rawalpindi", area: "Raja Bazaar", model: "per_item", price: 1800, title: "Mithai boxes for bid and favours", desc: "Fresh mithai in custom wedding boxes. Price per 1 kg box.", modes: ["delivery", "premises"], rating: 4.6, count: 140, years: 40, attrs: { type: ["Mithai"], delivery: ["Delivery", "Pickup"], lead_time: "2 days" } },
    { name: "Tohfa Boxes", cat: "gifts-favours", city: "islamabad", area: "F-11", model: "per_item", price: 650, title: "Personalised wedding favours", desc: "Bid boxes, mini mithai boxes and name-printed favours.", modes: ["delivery"], rating: 4.7, count: 31, founding: true, years: 3, attrs: { personalised: true, min_qty: 50, sample: true, lead_time: "2 weeks" } },
    { name: "Darzi by Danish", cat: "designer-stitching", city: "rawalpindi", area: "Satellite Town", model: "starting", price: 9000, title: "Sherwani and kurta stitching", desc: "Custom sherwanis, waistcoats and kurtas with home measurement in Pindi.", modes: ["home_visit", "premises"], rating: 4.6, count: 44, founding: true, years: 12, attrs: { garments: ["Sherwani", "Kurta"], made: ["Custom"], turnaround: "2–3 weeks", home_measurement: true } },
    { name: "Atelier Mahrukh", cat: "designer-stitching", city: "islamabad", area: "F-6", model: "quote", title: "Bridal and formal couture", desc: "Hand-embellished bridal and formal wear, made to measure.", modes: ["premises"], rating: 4.8, count: 19, years: 8, attrs: { garments: ["Bridal", "Formal"], made: ["Custom"], turnaround: "1 month+", home_measurement: false } },
    { name: "Dhol Sajan", cat: "entertainment", city: "rawalpindi", area: "Peshawar Road", model: "starting", price: 12000, title: "Dhol for mehndi and barat", desc: "Two-dhol team for barat arrival and mehndi dances. Matching outfits included.", modes: ["on_site"], rating: 4.9, count: 67, founding: true, years: 15, attrs: { performer: ["Dhol"], duration: "2–3 hours", equipment: false } },
    { name: "Sur Sangam", cat: "entertainment", city: "islamabad", area: "Blue Area", model: "package", price: 60000, title: "Live singers for mehndi night", desc: "Tappay, boliyan and classic mehndi songs with live dholak and sound system.", modes: ["on_site"], rating: 4.7, count: 26, years: 9, attrs: { performer: ["Singer", "Qawwali"], duration: "Full night", equipment: true } },
    { name: "Shamiana Rentals", cat: "rentals", city: "rawalpindi", area: "Adiala Road", model: "per_item", price: 150, title: "Chairs, tables, shamiana and lights", desc: "Everything for a home function: chairs (per chair), tables, shamiana, lights and crockery.", modes: ["delivery", "on_site"], rating: 4.3, count: 52, years: 20, attrs: { inventory: ["Chairs", "Tables", "Tents", "Lighting", "Crockery"], delivery_setup: true, deposit: "20% on booking, informational" } },
    { name: "Stage Craft Rentals", cat: "rentals", city: "islamabad", area: "PWD", model: "package", price: 40000, title: "Stage, sound and lighting packages", desc: "Stage platform, sofa set, PA system and lighting rig for up to 500 guests.", modes: ["delivery", "on_site"], rating: 4.5, count: 18, years: 6, attrs: { inventory: ["Stage", "Sound", "Lighting"], delivery_setup: true } },
  ];

  const sellerHash = hash("password123");
  let foundingNo = 0;
  const vendorIds: Record<string, string> = {};
  for (const [i, v] of V.entries()) {
    let ownerId: string | null = null;
    if (v.owner) {
      const [u] = await db.insert(s.users).values({ email: v.owner, passwordHash: sellerHash, name: "Hina Baig", isSeller: true, cityId: cityIds[v.city], emailVerified: true, onboardedAt: new Date(), launchpadStep: 4 }).returning();
      ownerId = u.id;
    }
    const founding = !!v.founding;
    const [row] = await db.insert(s.vendors).values({
      ownerId, slug: slugify(v.name), name: v.name, ownerName: v.owner ? "Hina Baig" : null, description: v.desc,
      businessType: i % 3 === 0 ? "Home-based" : i % 3 === 1 ? "Studio / shop" : "Individual",
      cityId: cityIds[v.city], areaId: areaIds[`${v.city}:${v.area}`],
      servesWholeCity: i % 2 === 0, serviceAreaIds: [areaIds[`${v.city}:${v.area}`]], serviceRadiusKm: i % 2 === 0 ? null : 15,
      modes: v.modes, experienceYears: v.years, phone: "0300 1234567", whatsapp: "0300 1234567", revealContact: i % 4 === 0,
      status: "approved", founding, foundingNumber: founding ? ++foundingNo : null,
      phoneVerified: true, emailVerified: i % 3 !== 2, profileReviewed: true,
      ratingAvg: v.rating, ratingCount: v.count, views: 200 + ((i * 137) % 900), contactClicks: 20 + ((i * 31) % 90),
      approvedAt: new Date(Date.now() - (30 - i) * 86400000), createdById: ownerId ? null : admin.id,
      createdAt: new Date(Date.now() - (40 - i) * 86400000),
      workingHours: "10am – 9pm", advanceNoticeDays: 7, capacity: 2,
    }).returning();
    vendorIds[v.name] = row.id;
    const [svc] = await db.insert(s.vendorServices).values({ vendorId: row.id, categoryId: catIds[v.cat], title: v.title, description: v.desc, pricingModel: v.model, priceAmount: v.price ?? null, attributes: v.attrs ?? {}, occasions: ["Wedding", "Mehndi"] }).returning();
    const art = CATEGORIES.find((c) => c.slug === v.cat)!.art;
    const captions = ["Recent work", "Mehndi night", "Barat day", "Walima", "Family function", "Close-up detail"];
    for (let k = 0; k < 6; k++) {
      await db.insert(s.portfolioItems).values({ vendorId: row.id, serviceId: svc.id, imageUrl: `art:${art}:${i * 7 + k}`, caption: captions[k], tags: [v.cat], sortOrder: k });
    }
  }

  // a demo planner for Ayesha
  const [ev] = await db.insert(s.events).values({ userId: ayesha.id, name: "Ayesha & Bilal's wedding", type: "wedding", label: "Shaadi", date: "2026-12-26", location: "Rawalpindi", guestCount: 350, budget: 1800000, isPrimary: true }).returning();
  await db.insert(s.events).values([
    { userId: ayesha.id, name: "Mehndi night", type: "mehndi", label: "Mehndi", date: "2026-12-24", location: "Home, Satellite Town", guestCount: 120 },
    { userId: ayesha.id, name: "Dholki", type: "dholki", label: "Dholki", date: "2026-12-12", guestCount: 40 },
    { userId: ayesha.id, name: "Walima", type: "walima", label: "Walima", date: "2026-12-28", guestCount: 400 },
  ]);
  const wedding = TEMPLATES[0].items;
  const statuses = ["shortlisted", "not_started", "searching", "booked", "booked", "shortlisted", "not_started", "searching", "booked", "not_started"] as const;
  for (const [k, [label, cat]] of wedding.entries()) {
    const [item] = await db.insert(s.checklistItems).values({ eventId: ev.id, label, categoryId: cat ? catIds[cat] : null, status: statuses[k], sortOrder: k, budget: [600000, 250000, 120000, 60000, 150000, 40000, null, 50000, 30000, null][k] ?? null }).returning();
    if (label === "Catering") {
      for (const n of ["Ustad Rafiq Daig House", "Ammi's Kitchen", "Royal Feast Caterers"]) await db.insert(s.checklistVendors).values({ checklistItemId: item.id, vendorId: vendorIds[n] });
      await db.insert(s.quotes).values({ userId: ayesha.id, checklistItemId: item.id, vendorId: vendorIds["Ustad Rafiq Daig House"], vendorName: "Ustad Rafiq Daig House", amount: 507500, unit: "total", notes: "350 guests × 1,450. Includes zarda.", quoteDate: "2026-11-01", validUntil: "2026-11-30" });
    }
    if (label === "Bridal makeup") {
      await db.update(s.checklistItems).set({ selectedVendorId: vendorIds["Glow by Zara"] }).where(eq(s.checklistItems.id, item.id));
      await db.insert(s.checklistVendors).values({ checklistItemId: item.id, vendorId: vendorIds["Glow by Zara"] });
    }
  }
  await db.insert(s.shortlist).values([{ userId: ayesha.id, vendorId: vendorIds["Noor Lens Studio"] }, { userId: ayesha.id, vendorId: vendorIds["Hina's Henna Studio"] }, { userId: ayesha.id, vendorId: vendorIds["Dhol Sajan"] }]);

  // an inquiry thread with Hina's studio
  const now = Date.now();
  const [inq] = await db.insert(s.inquiries).values({ consumerId: ayesha.id, vendorId: vendorIds["Hina's Henna Studio"], eventId: ev.id, categoryId: catIds["mehndi-henna"], shared: { eventDate: "2026-12-24", location: "Satellite Town, Rawalpindi", guestCount: 8, service: "Bridal mehndi + 7 family members", eventName: "Mehndi night" }, status: "responded", consumerUnread: 1, vendorUnread: 0, lastMessageAt: new Date(now - 3600000), firstResponseAt: new Date(now - 7000000), createdAt: new Date(now - 9000000) }).returning();
  const hinaOwner = (await db.query.vendors.findFirst({ where: (v, { eq }) => eq(v.id, vendorIds["Hina's Henna Studio"]) }))!.ownerId!;
  await db.insert(s.messages).values([
    { inquiryId: inq.id, senderId: ayesha.id, senderRole: "consumer", body: "Assalam o alaikum! Are you free on 24 December for bridal mehndi plus 7 family members at home?", createdAt: new Date(now - 9000000) },
    { inquiryId: inq.id, senderId: hinaOwner, senderRole: "vendor", body: "Walaikum assalam! Yes, 24th is open. Bridal full hands and feet is 15,000 and family is 4,500 each. I'd come at 4pm.", createdAt: new Date(now - 7000000) },
    { inquiryId: inq.id, senderId: hinaOwner, senderRole: "vendor", body: "I can also send a few bridal designs on WhatsApp if you like.", createdAt: new Date(now - 3600000) },
  ]);
  await db.insert(s.reviews).values([
    { authorId: ayesha.id, vendorId: vendorIds["Hina's Henna Studio"], inquiryId: inq.id, rating: 5, text: "Came on time, the stain was so dark by the next morning. Everyone at the mehndi asked for her number!", categoryId: catIds["mehndi-henna"], occasion: "Mehndi", basis: "inquiry" },
  ]);
  await db.insert(s.notifications).values({ userId: ayesha.id, type: "inquiry_reply", title: "Hina's Henna Studio replied", body: "I can also send a few bridal designs…", href: `/inbox/${inq.id}` });

  console.log(`Seeded ${CITIES.length} cities, ${CATEGORIES.length} categories, ${V.length} vendors.`);
  console.log("Logins: admin@ronaq.pk / ronaq-admin · ayesha@example.com / password123 · hina@example.com / password123 (seller)");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
