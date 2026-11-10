import type { WorkReference } from "../lib/references";
import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);
const json = <T>(name: string) => text(name, { mode: "json" }).$type<T>();

// ---------- people ----------
export const users = sqliteTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    cityId: text("city_id"),
    interests: json<string[]>("interests").default([]),
    heardFrom: text("heard_from"),
    planningEvent: integer("planning_event", { mode: "boolean" }),
    onboardedAt: integer("onboarded_at", { mode: "timestamp_ms" }),
    launchpadStep: integer("launchpad_step").notNull().default(0), // 0 not started, 1..3 in progress, 4 done
    isSeller: integer("is_seller", { mode: "boolean" }).notNull().default(false),
    role: text("role", { enum: ["user", "moderator", "admin"] }).notNull().default("user"),
    status: text("status", { enum: ["active", "suspended"] }).notNull().default("active"),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    remindersEnabled: integer("reminders_enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email").on(t.email)],
);

export const tokens = sqliteTable("tokens", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind", { enum: ["verify_email", "reset_password"] }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

// ---------- geography ----------
export const cities = sqliteTable("cities", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  province: text("province").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const areas = sqliteTable(
  "areas",
  {
    id: id(),
    cityId: text("city_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    lat: real("lat"),
    lng: real("lng"),
  },
  (t) => [index("areas_city").on(t.cityId)],
);

// ---------- catalogue ----------
export const categories = sqliteTable("categories", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: text("parent_id"),
  icon: text("icon").notNull().default("sparkles"),
  art: text("art").notNull().default("henna"), // which craft illustration to use as default cover
  description: text("description"),
  noun: text("noun").notNull().default("vendors"), // "artists", "kitchens"…
  priceModels: json<string[]>("price_models").default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export type AttributeType = "select" | "multiselect" | "boolean" | "number" | "text";
export const attributes = sqliteTable(
  "attributes",
  {
    id: id(),
    categoryId: text("category_id").notNull(),
    key: text("key").notNull(),
    label: text("label").notNull(),
    type: text("type", { enum: ["select", "multiselect", "boolean", "number", "text"] }).notNull(),
    options: json<string[]>("options").default([]),
    unit: text("unit"),
    required: integer("required", { mode: "boolean" }).notNull().default(false),
    filterable: integer("filterable", { mode: "boolean" }).notNull().default(false),
    showOnProfile: integer("show_on_profile", { mode: "boolean" }).notNull().default(true),
    vendorDeclared: integer("vendor_declared", { mode: "boolean" }).notNull().default(false),
    help: text("help"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [uniqueIndex("attr_cat_key").on(t.categoryId, t.key)],
);

export const templates = sqliteTable("templates", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  eventType: text("event_type").notNull(),
  label: text("label").notNull(), // "Shaadi" → "Shaadi ki Ronaq"
  items: json<{ label: string; categorySlug?: string }[]>("items").default([]),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------- vendors ----------
export type VendorStatus = "draft" | "pending" | "approved" | "rejected" | "suspended";
export const vendors = sqliteTable(
  "vendors",
  {
    id: id(),
    ownerId: text("owner_id"),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    ownerName: text("owner_name"),
    description: text("description"),
    businessType: text("business_type"),
    cityId: text("city_id"),
    areaId: text("area_id"),
    serviceAreaIds: json<string[]>("service_area_ids").default([]),
    servesWholeCity: integer("serves_whole_city", { mode: "boolean" }).notNull().default(false),
    serviceRadiusKm: integer("service_radius_km"),
    modes: json<string[]>("modes").default([]),
    experienceYears: integer("experience_years"),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    email: text("email"),
    revealContact: integer("reveal_contact", { mode: "boolean" }).notNull().default(false),
    socials: json<Partial<Record<"instagram" | "facebook" | "tiktok" | "youtube" | "website", string>>>("socials").default({}),
    coverImage: text("cover_image"),
    logoImage: text("logo_image"),
    workingHours: text("working_hours"),
    advanceNoticeDays: integer("advance_notice_days"),
    capacity: integer("capacity"),
    referralSource: text("referral_source"),
    workReferences: json<WorkReference[]>("work_references").default([]),
    status: text("status", { enum: ["draft", "pending", "approved", "rejected", "suspended"] })
      .notNull()
      .default("draft"),
    statusReason: text("status_reason"),
    founding: integer("founding", { mode: "boolean" }).notNull().default(false),
    foundingNumber: integer("founding_number"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    phoneVerified: integer("phone_verified", { mode: "boolean" }).notNull().default(false),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    profileReviewed: integer("profile_reviewed", { mode: "boolean" }).notNull().default(false),
    pendingChanges: integer("pending_changes", { mode: "boolean" }).notNull().default(false),
    claimCode: text("claim_code"),
    createdById: text("created_by_id"),
    ratingAvg: real("rating_avg").notNull().default(0),
    ratingCount: integer("rating_count").notNull().default(0),
    views: integer("views").notNull().default(0),
    contactClicks: integer("contact_clicks").notNull().default(0),
    approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("vendors_owner").on(t.ownerId), index("vendors_status_city").on(t.status, t.cityId)],
);

export type PricingModel = "fixed" | "starting" | "per_person" | "per_item" | "package" | "quote";
export const vendorServices = sqliteTable(
  "vendor_services",
  {
    id: id(),
    vendorId: text("vendor_id").notNull(),
    categoryId: text("category_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    pricingModel: text("pricing_model", {
      enum: ["fixed", "starting", "per_person", "per_item", "package", "quote"],
    })
      .notNull()
      .default("quote"),
    priceAmount: integer("price_amount"), // PKR
    minOrder: text("min_order"),
    attributes: json<Record<string, string | string[] | boolean | number>>("attributes").default({}),
    occasions: json<string[]>("occasions").default([]),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("services_vendor").on(t.vendorId), index("services_category").on(t.categoryId)],
);

export const portfolioItems = sqliteTable(
  "portfolio_items",
  {
    id: id(),
    vendorId: text("vendor_id").notNull(),
    serviceId: text("service_id"),
    imageUrl: text("image_url").notNull(),
    caption: text("caption"),
    tags: json<string[]>("tags").default([]),
    priceExample: text("price_example"),
    status: text("status", { enum: ["visible", "hidden", "removed"] }).notNull().default("visible"),
    moderationReason: text("moderation_reason"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("portfolio_vendor").on(t.vendorId)],
);

export const availability = sqliteTable(
  "availability",
  {
    vendorId: text("vendor_id").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD in PKT
    status: text("status", { enum: ["unavailable", "limited"] }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.vendorId, t.date] })],
);

// ---------- planning ----------
export const events = sqliteTable(
  "events",
  {
    id: id(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull().default("custom"),
    label: text("label"), // e.g. "Shaadi" → "Shaadi ki Ronaq"
    date: text("date"), // YYYY-MM-DD (PKT)
    time: text("time"),
    location: text("location"),
    guestCount: integer("guest_count"),
    budget: integer("budget"),
    description: text("description"),
    image: text("image"),
    isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("events_user").on(t.userId)],
);

export const checklistStatuses = ["not_started", "searching", "shortlisted", "booked", "completed"] as const;
export type ChecklistStatus = (typeof checklistStatuses)[number];
export const checklistItems = sqliteTable(
  "checklist_items",
  {
    id: id(),
    eventId: text("event_id").notNull(),
    categoryId: text("category_id"),
    label: text("label").notNull(),
    status: text("status", { enum: checklistStatuses }).notNull().default("not_started"),
    sortOrder: integer("sort_order").notNull().default(0),
    notes: text("notes"),
    budget: integer("budget"),
    selectedVendorId: text("selected_vendor_id"),
    deadline: text("deadline"),
    bookedAt: integer("booked_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("checklist_event").on(t.eventId)],
);

export const checklistVendors = sqliteTable(
  "checklist_vendors",
  {
    checklistItemId: text("checklist_item_id").notNull(),
    vendorId: text("vendor_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.checklistItemId, t.vendorId] })],
);

export const shortlist = sqliteTable(
  "shortlist",
  {
    userId: text("user_id").notNull(),
    vendorId: text("vendor_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.vendorId] })],
);

export const quotes = sqliteTable("quotes", {
  id: id(),
  userId: text("user_id").notNull(),
  checklistItemId: text("checklist_item_id").notNull(),
  vendorId: text("vendor_id"),
  vendorName: text("vendor_name"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("PKR"),
  unit: text("unit").notNull().default("total"),
  notes: text("notes"),
  quoteDate: text("quote_date"),
  validUntil: text("valid_until"),
  committed: integer("committed", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const reminders = sqliteTable("reminders", {
  id: id(),
  userId: text("user_id").notNull(),
  eventId: text("event_id"),
  checklistItemId: text("checklist_item_id"),
  title: text("title").notNull(),
  dueDate: text("due_date").notNull(),
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  notifiedAt: integer("notified_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
});

// ---------- communication ----------
export type InquiryStatus = "sent" | "delivered" | "responded" | "closed";
export const inquiries = sqliteTable(
  "inquiries",
  {
    id: id(),
    consumerId: text("consumer_id").notNull(),
    vendorId: text("vendor_id").notNull(),
    eventId: text("event_id"),
    checklistItemId: text("checklist_item_id"),
    categoryId: text("category_id"),
    shared: json<{
      eventDate?: string;
      location?: string;
      guestCount?: number;
      budget?: number;
      service?: string;
      eventName?: string;
    }>("shared").default({}),
    status: text("status", { enum: ["sent", "delivered", "responded", "closed"] }).notNull().default("sent"),
    source: text("source").notNull().default("profile"),
    isTest: integer("is_test", { mode: "boolean" }).notNull().default(false),
    consumerUnread: integer("consumer_unread").notNull().default(0),
    vendorUnread: integer("vendor_unread").notNull().default(1),
    lastMessageAt: integer("last_message_at", { mode: "timestamp_ms" }).notNull(),
    firstResponseAt: integer("first_response_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("inq_consumer").on(t.consumerId), index("inq_vendor").on(t.vendorId)],
);

export const messages = sqliteTable(
  "messages",
  {
    id: id(),
    inquiryId: text("inquiry_id").notNull(),
    senderId: text("sender_id").notNull(),
    senderRole: text("sender_role", { enum: ["consumer", "vendor"] }).notNull(),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("msg_inquiry").on(t.inquiryId)],
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body"),
    href: text("href"),
    readAt: integer("read_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [index("notif_user").on(t.userId)],
);

// ---------- trust ----------
export const reviews = sqliteTable(
  "reviews",
  {
    id: id(),
    authorId: text("author_id").notNull(),
    vendorId: text("vendor_id").notNull(),
    inquiryId: text("inquiry_id"),
    rating: integer("rating").notNull(),
    text: text("text"),
    categoryId: text("category_id"),
    occasion: text("occasion"),
    basis: text("basis", { enum: ["inquiry", "account", "admin_evidence"] }).notNull().default("inquiry"),
    status: text("status", { enum: ["pending", "published", "hidden"] }).notNull().default("published"),
    moderationReason: text("moderation_reason"),
    createdAt: createdAt(),
  },
  (t) => [index("reviews_vendor").on(t.vendorId)],
);

export const reports = sqliteTable("reports", {
  id: id(),
  reporterId: text("reporter_id"),
  targetType: text("target_type", { enum: ["vendor", "review", "message", "portfolio", "user"] }).notNull(),
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status", { enum: ["open", "assigned", "resolved", "dismissed"] }).notNull().default("open"),
  assigneeId: text("assignee_id"),
  resolution: text("resolution"),
  createdAt: createdAt(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
});

export const auditLog = sqliteTable("audit_log", {
  id: id(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  objectType: text("object_type").notNull(),
  objectId: text("object_id"),
  reason: text("reason"),
  before: json<unknown>("before"),
  after: json<unknown>("after"),
  createdAt: createdAt(),
});

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: id(),
    name: text("name").notNull(),
    actor: text("actor"), // pseudonymous hash
    cityId: text("city_id"),
    categoryId: text("category_id"),
    props: json<Record<string, string | number | boolean | null>>("props").default({}),
    createdAt: createdAt(),
  },
  (t) => [index("analytics_name_time").on(t.name, t.createdAt)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: json<unknown>("value").notNull(),
});

export type User = typeof users.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type VendorService = typeof vendorServices.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Attribute = typeof attributes.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Area = typeof areas.$inferSelect;
export type Event = typeof events.$inferSelect;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type Template = typeof templates.$inferSelect;
