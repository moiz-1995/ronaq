// Launch catalogue: cities, areas, categories, attributes and templates (PRD §11, Appendix A).
// Everything here is editable afterwards from the admin console.
import type { AttributeType, PricingModel } from "./schema";

export const CITIES: { slug: string; name: string; province: string; active: boolean; areas: [string, number, number][] }[] = [
  {
    slug: "islamabad", name: "Islamabad", province: "ICT", active: true,
    areas: [
      ["F-6", 33.727, 73.075], ["F-7", 33.72, 73.056], ["F-8", 33.711, 73.038], ["F-10", 33.695, 73.014],
      ["F-11", 33.684, 72.99], ["E-11", 33.7, 72.977], ["G-9", 33.69, 73.035], ["G-10", 33.677, 73.015],
      ["G-11", 33.668, 72.995], ["G-13", 33.646, 72.963], ["I-8", 33.668, 73.075], ["Blue Area", 33.711, 73.06],
      ["PWD", 33.57, 73.14], ["B-17", 33.66, 72.83], ["DHA Phase 2", 33.533, 73.155], ["Bahria Town Phase 7", 33.528, 73.103],
    ],
  },
  {
    slug: "rawalpindi", name: "Rawalpindi", province: "Punjab", active: true,
    areas: [
      ["Saddar", 33.597, 73.048], ["Satellite Town", 33.637, 73.068], ["Commercial Market", 33.635, 73.07],
      ["Raja Bazaar", 33.616, 73.064], ["Westridge", 33.61, 73.02], ["Peshawar Road", 33.6, 73.01],
      ["Chaklala Scheme 3", 33.59, 73.09], ["Gulraiz", 33.58, 73.13], ["Adiala Road", 33.55, 73.02],
      ["Bahria Town Phase 4", 33.52, 73.095],
    ],
  },
  { slug: "lahore", name: "Lahore", province: "Punjab", active: false, areas: [["Gulberg", 31.51, 74.35], ["DHA", 31.47, 74.41], ["Johar Town", 31.47, 74.27], ["Model Town", 31.48, 74.32]] },
  { slug: "karachi", name: "Karachi", province: "Sindh", active: false, areas: [["Clifton", 24.81, 67.03], ["DHA", 24.8, 67.06], ["Gulshan-e-Iqbal", 24.92, 67.09], ["North Nazimabad", 24.94, 67.04]] },
  { slug: "faisalabad", name: "Faisalabad", province: "Punjab", active: false, areas: [["D Ground", 31.42, 73.09], ["Madina Town", 31.43, 73.11]] },
  { slug: "multan", name: "Multan", province: "Punjab", active: false, areas: [["Cantt", 30.19, 71.45], ["Gulgasht", 30.22, 71.48]] },
  { slug: "peshawar", name: "Peshawar", province: "KP", active: false, areas: [["Hayatabad", 34.0, 71.45], ["University Town", 34.01, 71.49]] },
  { slug: "quetta", name: "Quetta", province: "Balochistan", active: false, areas: [["Jinnah Town", 30.2, 67.01], ["Satellite Town", 30.19, 67.0]] },
  { slug: "sialkot", name: "Sialkot", province: "Punjab", active: false, areas: [["Cantt", 32.5, 74.53]] },
  { slug: "gujranwala", name: "Gujranwala", province: "Punjab", active: false, areas: [["Satellite Town", 32.18, 74.18]] },
  { slug: "hyderabad", name: "Hyderabad", province: "Sindh", active: false, areas: [["Latifabad", 25.37, 68.38]] },
];

type AttrDef = {
  key: string; label: string; type: AttributeType; options?: string[]; unit?: string;
  required?: boolean; filterable?: boolean; vendorDeclared?: boolean; help?: string;
};

export type CraftArt = "henna" | "makeup" | "daig" | "decor" | "camera" | "cake" | "gift" | "stitch" | "dhol" | "rental";

export const CATEGORIES: {
  slug: string; name: string; noun: string; icon: string; art: CraftArt; description: string;
  priceModels: PricingModel[]; attrs: AttrDef[];
}[] = [
  {
    slug: "mehndi-henna", name: "Mehndi & henna", noun: "artists", icon: "hand", art: "henna",
    description: "Bridal and party henna artists who come to your home or venue.",
    priceModels: ["per_person", "starting", "package"],
    attrs: [
      { key: "style", label: "Style", type: "multiselect", options: ["Arabic", "Pakistani traditional", "Indo-Arabic", "Minimal", "Moroccan"], filterable: true },
      { key: "occasion_type", label: "Bridal or party", type: "multiselect", options: ["Bridal", "Party", "Kids"], filterable: true },
      { key: "organic", label: "Organic / natural henna", type: "boolean", filterable: true, vendorDeclared: true, help: "Declared by the vendor, not certified by Ronaq." },
      { key: "clients_per_session", label: "Clients per session", type: "number", unit: "clients" },
      { key: "advance_booking", label: "Book this far ahead", type: "select", options: ["Same week", "2 weeks", "1 month+"] },
    ],
  },
  {
    slug: "makeup-hair", name: "Makeup & hair", noun: "artists", icon: "brush", art: "makeup",
    description: "Bridal, party and family makeup and hair styling.",
    priceModels: ["per_person", "package", "starting"],
    attrs: [
      { key: "occasion_type", label: "Bridal or party", type: "multiselect", options: ["Bridal", "Party", "Engagement", "Photoshoot"], filterable: true },
      { key: "location", label: "Where", type: "multiselect", options: ["Home visit", "Studio"], filterable: true },
      { key: "trial", label: "Trial available", type: "boolean", filterable: true },
      { key: "brands", label: "Products used", type: "text", vendorDeclared: true, help: "Declared by the vendor." },
      { key: "team_size", label: "Artists in team", type: "number" },
    ],
  },
  {
    slug: "catering", name: "Catering", noun: "kitchens", icon: "chef-hat", art: "daig",
    description: "Daig, home kitchens and full-service caterers.",
    priceModels: ["per_person", "package", "quote"],
    attrs: [
      { key: "cuisine", label: "Cuisine", type: "multiselect", options: ["Desi", "BBQ", "Chinese", "Continental", "Sweets", "Daig"], filterable: true },
      { key: "service_style", label: "Service", type: "multiselect", options: ["Delivery", "On-site", "Live stations"], filterable: true },
      { key: "dietary", label: "Dietary options", type: "multiselect", options: ["Vegetarian", "Low spice", "Gluten-aware"], vendorDeclared: true },
      { key: "max_guests", label: "Largest event served", type: "number", unit: "guests", filterable: true },
      { key: "serving_staff", label: "Serving staff provided", type: "boolean", filterable: true },
    ],
  },
  {
    slug: "decor", name: "Decor", noun: "studios", icon: "flower", art: "decor",
    description: "Stage, floral, lighting and theme decor.",
    priceModels: ["starting", "package", "quote"],
    attrs: [
      { key: "event_type", label: "Events", type: "multiselect", options: ["Mehndi", "Barat", "Walima", "Birthday", "Corporate"], filterable: true },
      { key: "setting", label: "Indoor or outdoor", type: "multiselect", options: ["Indoor", "Outdoor", "Lawn", "Home"], filterable: true },
      { key: "theme", label: "Themes", type: "text" },
      { key: "setup_teardown", label: "Setup and teardown included", type: "boolean", filterable: true },
    ],
  },
  {
    slug: "photography", name: "Photography", noun: "studios", icon: "camera", art: "camera",
    description: "Photo and video for every function.",
    priceModels: ["package", "starting", "quote"],
    attrs: [
      { key: "deliverables", label: "Deliverables", type: "multiselect", options: ["Photos", "Video", "Highlight reel", "Album", "Drone"], filterable: true },
      { key: "hours", label: "Hours covered", type: "number", unit: "hours" },
      { key: "turnaround", label: "Delivery time", type: "select", options: ["1 week", "2–4 weeks", "1–2 months"] },
      { key: "female_photographer", label: "Female photographer available", type: "boolean", filterable: true },
    ],
  },
  {
    slug: "cakes-desserts", name: "Cakes & desserts", noun: "bakers", icon: "cake", art: "cake",
    description: "Custom cakes, cupcakes, mithai tables and dessert bars.",
    priceModels: ["per_item", "starting", "package"],
    attrs: [
      { key: "type", label: "Type", type: "multiselect", options: ["Cakes", "Cupcakes", "Mithai", "Dessert table", "Cookies"], filterable: true },
      { key: "eggless", label: "Eggless option", type: "boolean", filterable: true, vendorDeclared: true },
      { key: "delivery", label: "Delivery or pickup", type: "multiselect", options: ["Delivery", "Pickup"], filterable: true },
      { key: "lead_time", label: "Order this far ahead", type: "select", options: ["2 days", "1 week", "2 weeks+"] },
    ],
  },
  {
    slug: "gifts-favours", name: "Gifts & favours", noun: "makers", icon: "gift", art: "gift",
    description: "Wedding favours, gift boxes, bid boxes and personalised gifts.",
    priceModels: ["per_item", "starting", "quote"],
    attrs: [
      { key: "personalised", label: "Personalisation", type: "boolean", filterable: true },
      { key: "min_qty", label: "Minimum quantity", type: "number", unit: "pieces" },
      { key: "sample", label: "Sample available", type: "boolean", filterable: true },
      { key: "lead_time", label: "Lead time", type: "select", options: ["1 week", "2 weeks", "1 month+"] },
    ],
  },
  {
    slug: "designer-stitching", name: "Designer & stitching", noun: "tailors", icon: "scissors", art: "stitch",
    description: "Designers and tailors for bridal, formal and family outfits.",
    priceModels: ["starting", "per_item", "quote"],
    attrs: [
      { key: "garments", label: "Garments", type: "multiselect", options: ["Bridal", "Formal", "Kurta", "Sherwani", "Kids"], filterable: true },
      { key: "made", label: "Custom or ready-to-wear", type: "multiselect", options: ["Custom", "Ready-to-wear"], filterable: true },
      { key: "turnaround", label: "Turnaround", type: "select", options: ["1 week", "2–3 weeks", "1 month+"] },
      { key: "home_measurement", label: "Home measurement visit", type: "boolean", filterable: true },
    ],
  },
  {
    slug: "entertainment", name: "Entertainment", noun: "performers", icon: "music", art: "dhol",
    description: "Dhol players, singers, DJs, qawwals and kids' entertainers.",
    priceModels: ["starting", "package", "quote"],
    attrs: [
      { key: "performer", label: "Performer", type: "multiselect", options: ["Dhol", "Singer", "DJ", "Qawwali", "Magician", "Kids entertainer"], filterable: true },
      { key: "duration", label: "Typical set", type: "select", options: ["1 hour", "2–3 hours", "Full night"] },
      { key: "equipment", label: "Sound equipment included", type: "boolean", filterable: true },
    ],
  },
  {
    slug: "rentals", name: "Rentals", noun: "suppliers", icon: "armchair", art: "rental",
    description: "Furniture, crockery, lighting, tents and stage rentals.",
    priceModels: ["per_item", "package", "quote"],
    attrs: [
      { key: "inventory", label: "Items", type: "multiselect", options: ["Chairs", "Tables", "Crockery", "Lighting", "Tents", "Stage", "Sound"], filterable: true },
      { key: "delivery_setup", label: "Delivery and setup", type: "boolean", filterable: true },
      { key: "deposit", label: "Deposit terms", type: "text", help: "For information only. Ronaq does not hold deposits." },
    ],
  },
];

export const TEMPLATES: { slug: string; name: string; eventType: string; label: string; items: [string, string?][] }[] = [
  {
    slug: "wedding", name: "Wedding / Shaadi", eventType: "wedding", label: "Shaadi",
    items: [["Catering", "catering"], ["Decor", "decor"], ["Photo & video", "photography"], ["Bridal makeup", "makeup-hair"], ["Clothing & stitching", "designer-stitching"], ["Favours", "gifts-favours"], ["Venue"], ["Furniture", "rentals"], ["Entertainment", "entertainment"], ["Transport (optional)"]],
  },
  {
    slug: "mehndi", name: "Mehndi", eventType: "mehndi", label: "Mehndi",
    items: [["Henna artist", "mehndi-henna"], ["Decor", "decor"], ["Catering", "catering"], ["Photography", "photography"], ["Dhol & entertainment", "entertainment"], ["Favours", "gifts-favours"], ["Seating & furniture", "rentals"]],
  },
  {
    slug: "birthday", name: "Birthday", eventType: "birthday", label: "Birthday",
    items: [["Cake", "cakes-desserts"], ["Decor", "decor"], ["Catering", "catering"], ["Photography", "photography"], ["Favours", "gifts-favours"], ["Entertainment", "entertainment"], ["Furniture", "rentals"]],
  },
  {
    slug: "engagement", name: "Engagement", eventType: "engagement", label: "Mangni",
    items: [["Decor", "decor"], ["Catering", "catering"], ["Photography", "photography"], ["Clothing", "designer-stitching"], ["Makeup", "makeup-hair"], ["Venue"], ["Gifts & favours", "gifts-favours"]],
  },
  {
    slug: "bridal-shower", name: "Bridal shower", eventType: "bridal_shower", label: "Bridal Shower",
    items: [["Decor", "decor"], ["Catering", "catering"], ["Gifts", "gifts-favours"], ["Photography", "photography"], ["Cake", "cakes-desserts"], ["Favours", "gifts-favours"]],
  },
  {
    slug: "corporate", name: "Corporate event", eventType: "corporate", label: "Corporate",
    items: [["Venue"], ["Catering", "catering"], ["Photography", "photography"], ["Branding & printing"], ["AV & sound", "rentals"], ["Furniture", "rentals"], ["Event management"], ["Entertainment", "entertainment"], ["Registration materials"]],
  },
  { slug: "custom", name: "Custom event", eventType: "custom", label: "", items: [] },
];

export const EVENT_TYPES = [
  { value: "wedding", label: "Wedding / Shaadi", heading: "Shaadi" },
  { value: "mehndi", label: "Mehndi", heading: "Mehndi" },
  { value: "barat", label: "Barat", heading: "Barat" },
  { value: "walima", label: "Walima", heading: "Walima" },
  { value: "dholki", label: "Dholki", heading: "Dholki" },
  { value: "engagement", label: "Engagement", heading: "Mangni" },
  { value: "birthday", label: "Birthday", heading: "Birthday" },
  { value: "bridal_shower", label: "Bridal shower", heading: "Bridal Shower" },
  { value: "aqeeqa", label: "Aqeeqa", heading: "Aqeeqa" },
  { value: "corporate", label: "Corporate", heading: "Corporate" },
  { value: "custom", label: "Something else", heading: "" },
];

export const SERVICE_MODES = [
  { value: "home_visit", label: "Home visit" },
  { value: "on_site", label: "At venue / on-site" },
  { value: "premises", label: "You visit their studio or shop" },
  { value: "delivery", label: "Delivery" },
  { value: "remote", label: "Online / remote" },
];

export const BUSINESS_TYPES = ["Individual", "Home-based", "Studio / shop", "Registered business", "Other"];
export const HEARD_FROM = ["Instagram", "Facebook", "TikTok", "Google", "YouTube", "WhatsApp", "Friend or family", "A vendor", "An event planner", "Other"];
