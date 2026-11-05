# Ronaq: web MVP build list

Source of truth: the Ronaq PRD v1.0 (06 Nov 2026) and the brand round 2 decisions (Truck Art Mela: blue and red lead, sage beige instead of chrome, "Apki ronaq", "Start selling", founding badge with a string of lights).

Stack, all free tiers: Next.js 15 (App Router, server actions), TypeScript, Tailwind 4, Drizzle ORM on libSQL. Locally the database is a SQLite file; production uses Turso's free tier. Auth is our own (bcrypt plus a signed cookie). Uploads go to local disk now behind a storage interface, with Cloudinary or Supabase free tier later. 3D uses three.js through react-three-fiber.

Legend: [x] done · [~] partly done · [ ] not started

## 0. Foundation
- [ ] Brand tokens, fonts (Bungee, Bungee Shade, Rubik) and global styles (reflector-stripe bands, sticker buttons)
- [ ] Database schema covering every PRD §16 entity, plus migrations
- [ ] Seed data: cities and areas (all major PK cities, RWP/ISB active), the 10 categories with their attributes, event templates, an admin user, and demo vendors with portfolios
- [ ] Session auth: sign up, sign in, sign out, password hashing, role checks, contact gate, and returning the user to what they were doing (FR-CUS-002/003/004)
- [ ] App shell: top nav (desktop), bottom tab bar (mobile) with Dashboard, Marketplace, Events, Shortlist, Account (§15)
- [ ] Loading, empty, error and not-found states
- [ ] Analytics event logger (§18), with no message bodies or private event data
- [ ] Audit log helper (FR-ADM-010)
- [ ] Storage interface for image uploads, with type and size validation

## 1. Public marketplace
- [ ] Home page: 3D occasion stage (henna → dhol → cake), search, categories, featured vendors, Launchpad pitch, Start selling
- [ ] Category navigation and landing pages (FR-MKT-001)
- [ ] Search by keyword, name, category and city/area (FR-MKT-002)
- [ ] Category-aware filters driven by attributes (FR-MKT-003)
- [ ] Budget filter with honest units, where custom quotes are never sorted as numbers (FR-MKT-004)
- [ ] Location and service-area filter (FR-MKT-005)
- [ ] Service-mode filter (FR-MKT-006)
- [ ] Availability date filter, labelled as vendor-provided (FR-MKT-007)
- [ ] Sorting: relevance, price (comparable units only), rating, newest (FR-MKT-008)
- [ ] Pagination; never load every vendor at once
- [ ] Vendor profile: cover or craft illustration, services, pricing, areas, modes, portfolio gallery, reviews, verification badges, contact button (FR-MKT-010/011/012)
- [ ] Founding badge with a string of lights
- [ ] Report content from anywhere, including guests (FR-MKT-013)
- [ ] Responsive layout with no hover-only actions (FR-MKT-014)

## 2. Consumer account
- [ ] Skippable onboarding questionnaire (§6.2), with the excluded questions left out
- [ ] Profile and settings, including reminder preferences (FR-CUS-006, FR-EVT-007)
- [ ] Shortlist: save and unsave from cards and profiles (FR-MKT-009)

## 3. Launchpad and events
- [ ] Launchpad step 1: choose a template or a custom checklist; add or remove items, including custom ones (FR-EVT-013/014)
- [ ] Launchpad step 2: primary event name, type, date, optional details and secondary dates
- [ ] Launchpad step 3: marketplace opens with checklist categories first (FR-CUS-007)
- [ ] Resume an unfinished Launchpad from the dashboard (FR-EVT-015)
- [ ] Dashboard: "X ki Ronaq" heading, PKT countdown that never goes negative and switches to a post-event state, progress, secondary events (FR-EVT-002/003/004/005)
- [ ] Events list and create/edit/delete, with one primary at a time (FR-EVT-001/002)
- [ ] Month calendar plus upcoming list (FR-EVT-006)
- [ ] Event checklist: add, remove, reorder, change status (FR-EVT-008/009)
- [ ] Link checklist items to shortlisted and selected vendors (FR-EVT-010)
- [ ] Quote records, labelled as recorded by the consumer (FR-EVT-011)
- [ ] Budget tracking: overall, per service, recorded and remaining (FR-EVT-012)
- [ ] In-app reminders for event dates and deadlines (FR-EVT-007)

## 4. Inquiries and messaging
- [ ] Start an inquiry from a profile or checklist item, choosing which context to share (FR-COM-001/002)
- [ ] Thread with timestamps, unread state and history (FR-COM-003)
- [ ] Statuses sent → delivered → responded → closed, never implying a booking (FR-COM-005)
- [ ] In-app notifications and a notification centre (FR-COM-006)
- [ ] Contact privacy: phone and WhatsApp shown only if the vendor opts in (FR-COM-007)
- [ ] Disclaimers: Ronaq doesn't guarantee price, availability or service (FR-COM-004)

## 5. Seller side
- [ ] Start selling landing page plus seller registration and role, on the same account (FR-SEL-001)
- [ ] Questionnaire that changes with the categories chosen (§9.1, FR-SEL-002)
- [ ] Multi-category services, each with its own attributes and portfolio (FR-SEL-003)
- [ ] Completeness checklist (FR-SEL-004)
- [ ] Draft → submit → approved/rejected, with status visible (FR-SEL-005)
- [ ] Cover image or logo upload, falling back to the craft illustration
- [ ] Portfolio upload with captions, tags and price examples (FR-MKT-011)
- [ ] Availability calendar (vendor-provided)
- [ ] Seller dashboard (FR-SEL-008)
- [ ] Inquiry inbox: reply, set status, unread (FR-SEL-009)
- [ ] Edits after approval send material changes back for review (FR-SEL-010)
- [ ] Performance: profile views, contact clicks, inquiries, response rate (FR-SEL-011)
- [ ] Claim a profile created by Ronaq ops, using a claim code (FR-SEL-006)

## 6. Reviews and trust
- [ ] Configurable review policy: inquiry-linked, any signed-in user, or admin-approved evidence; optional pre-moderation (§13)
- [ ] Write a review: rating, text, category, occasion
- [ ] Verification badges: phone, email, profile reviewed

## 7. Admin console
- [ ] Admin and moderator roles with least privilege (§4)
- [ ] Overview analytics: supply, activity, inquiry funnel, moderation; filter by date, category and city (FR-ADM-009)
- [ ] Vendors: list, approve, reject, suspend, founding flag (auto-assigns the first N approvals), completeness, assisted create and edit (FR-ADM-002, FR-SEL-006/007)
- [ ] Categories and attributes manager (FR-ADM-003/004)
- [ ] Event templates manager
- [ ] Reports queue: assign, resolve, record outcome (FR-ADM-007)
- [ ] Portfolio moderation (FR-ADM-005)
- [ ] Review moderation (FR-ADM-006)
- [ ] Users: search, suspend, reactivate (FR-ADM-001)
- [ ] Audit log viewer (FR-ADM-010)
- [ ] Settings: review policy, founding cap, cities on/off
- [ ] Featured placement data model only; switched off, with a "Sponsored" label when on (FR-ADM-008)

## 8. 3D and motion
- [ ] Hero 3D occasion stage (henna → dhol → cake), draggable
- [ ] Waving 3D bunting (jhandiyan) on the marketplace header
- [ ] Spinnable 3D gift box or diya on empty states
- [ ] Launchpad completion confetti
- [ ] Tilt cards, reflector-stripe dividers, scrolling bazaar ticker
- [ ] Respect prefers-reduced-motion and fall back when WebGL isn't available

## 9. Quality
- [ ] Unit tests: countdown in PKT, price units, review eligibility, founding assignment, completeness
- [ ] Typecheck, lint and production build pass
- [ ] Smoke run of the main flows in a browser
- [ ] README: setup, seed, environment variables, deploy (Vercel + Turso free)
