# Ronaq: web MVP build list

Source of truth: the Ronaq PRD v1.0 (06 Nov 2026) and the brand round 2 decisions (Truck Art Mela: blue and red lead, sage beige instead of chrome, "Apki ronaq", "Start selling", founding badge with a string of lights).

Stack, all free tiers: Next.js 15 (App Router, server actions), TypeScript, Tailwind 4, Drizzle ORM on libSQL. Locally the database is a SQLite file; production uses Turso's free tier. Auth is our own (bcrypt plus a signed cookie). Uploads go to local disk now behind a storage interface, with Cloudinary or Supabase free tier later. 3D uses three.js through react-three-fiber.

Legend: [x] done · [~] partly done · [ ] not started

## 0. Foundation
- [x] Brand tokens, fonts (Bungee, Bungee Shade, Rubik) and global styles (reflector-stripe bands, sticker buttons)
- [x] Database schema covering every PRD §16 entity, plus migrations
- [x] Seed data: cities and areas (all major PK cities, RWP/ISB active), the 10 categories with their attributes, event templates, an admin user, and demo vendors with portfolios
- [x] Session auth: sign up, sign in, sign out, password hashing, role checks, contact gate, and returning the user to what they were doing (FR-CUS-002/003/004)
- [x] App shell: top nav (desktop), bottom tab bar (mobile) with Dashboard, Marketplace, Events, Shortlist, Account (§15)
- [x] Loading, empty, error and not-found states
- [x] Analytics event logger (§18), with no message bodies or private event data
- [x] Audit log helper (FR-ADM-010)
- [~] Storage interface for image uploads, with type and size validation. Saves to local disk; swap in Cloudinary or Supabase before deploying

## 1. Public marketplace
- [x] Home page: 3D occasion stage (henna → dhol → cake), search, categories, featured vendors, Launchpad pitch, Start selling
- [x] Category navigation and landing pages (FR-MKT-001)
- [x] Search by keyword, name, category and city/area (FR-MKT-002)
- [x] Category-aware filters driven by attributes (FR-MKT-003)
- [x] Budget filter with honest units, where custom quotes are never sorted as numbers (FR-MKT-004)
- [x] Location and service-area filter (FR-MKT-005)
- [x] Service-mode filter (FR-MKT-006)
- [x] Availability date filter, labelled as vendor-provided (FR-MKT-007)
- [x] Sorting: relevance, price (comparable units only), rating, newest (FR-MKT-008)
- [x] Pagination; never load every vendor at once
- [x] Vendor profile: cover or craft illustration, services, pricing, areas, modes, portfolio gallery, reviews, verification badges, contact button (FR-MKT-010/011/012)
- [x] Founding badge with a string of lights
- [x] Report content from anywhere, including guests (FR-MKT-013)
- [x] Responsive layout with no hover-only actions (FR-MKT-014)

## 2. Consumer account
- [x] Skippable onboarding questionnaire (§6.2), with the excluded questions left out
- [x] Profile and settings, including reminder preferences (FR-CUS-006, FR-EVT-007)
- [x] Shortlist: save and unsave from cards and profiles (FR-MKT-009)

## 3. Launchpad and events
- [x] Launchpad step 1: choose a template or a custom checklist; add or remove items, including custom ones (FR-EVT-013/014)
- [x] Launchpad step 2: primary event name, type, date, optional details and secondary dates
- [x] Launchpad step 3: marketplace opens with checklist categories first (FR-CUS-007)
- [x] Resume an unfinished Launchpad from the dashboard (FR-EVT-015)
- [x] Dashboard: "X ki Ronaq" heading, PKT countdown that never goes negative and switches to a post-event state, progress, secondary events (FR-EVT-002/003/004/005)
- [x] Events list and create/edit/delete, with one primary at a time (FR-EVT-001/002)
- [x] Month calendar plus upcoming list (FR-EVT-006)
- [x] Event checklist: add, remove, reorder, change status (FR-EVT-008/009)
- [x] Link checklist items to shortlisted and selected vendors (FR-EVT-010)
- [x] Quote records, labelled as recorded by the consumer (FR-EVT-011)
- [x] Budget tracking: overall, per service, recorded and remaining (FR-EVT-012)
- [x] In-app reminders for event dates and deadlines (FR-EVT-007). Optional push is still to come

## 4. Inquiries and messaging
- [x] Start an inquiry from a profile or checklist item, choosing which context to share (FR-COM-001/002)
- [x] Thread with timestamps, unread state and history (FR-COM-003)
- [x] Statuses sent → delivered → responded → closed, never implying a booking (FR-COM-005)
- [x] In-app notifications and a notification centre (FR-COM-006)
- [x] Contact privacy: phone and WhatsApp shown only if the vendor opts in (FR-COM-007)
- [x] Disclaimers: Ronaq doesn't guarantee price, availability or service (FR-COM-004)

## 5. Seller side
- [x] Start selling landing page plus seller registration and role, on the same account (FR-SEL-001)
- [x] Questionnaire that changes with the categories chosen (§9.1, FR-SEL-002)
- [x] Multi-category services, each with its own attributes and portfolio (FR-SEL-003)
- [x] Completeness checklist (FR-SEL-004)
- [x] Draft → submit → approved/rejected, with status visible (FR-SEL-005)
- [x] Cover image or logo upload, falling back to the craft illustration
- [x] Portfolio upload with captions, tags and price examples (FR-MKT-011)
- [x] Availability calendar (vendor-provided)
- [x] Seller dashboard (FR-SEL-008)
- [x] Inquiry inbox: reply, set status, unread (FR-SEL-009)
- [x] Edits after approval send material changes back for review (FR-SEL-010)
- [x] Performance: profile views, contact clicks, inquiries, response rate (FR-SEL-011)
- [x] Claim a profile created by Ronaq ops, using a claim code (FR-SEL-006)

## 6. Reviews and trust
- [x] Configurable review policy: inquiry-linked, any signed-in user, or admin-approved evidence; optional pre-moderation (§13)
- [x] Write a review: rating, text, category, occasion
- [x] Verification badges: phone, email, profile reviewed

## 7. Admin console
- [x] Admin and moderator roles with least privilege (§4)
- [x] Overview analytics: supply, activity, inquiry funnel, moderation; filter by date, category and city (FR-ADM-009)
- [x] Vendors: list, approve, reject, suspend, founding flag (auto-assigns the first N approvals), completeness, assisted create and edit (FR-ADM-002, FR-SEL-006/007)
- [x] Categories and attributes manager (FR-ADM-003/004)
- [x] Event templates manager
- [x] Reports queue: assign, resolve, record outcome (FR-ADM-007)
- [x] Portfolio moderation (FR-ADM-005)
- [x] Review moderation (FR-ADM-006)
- [x] Users: search, suspend, reactivate (FR-ADM-001)
- [x] Audit log viewer (FR-ADM-010)
- [x] Settings: review policy, founding cap, cities on/off
- [x] Featured placement data model only; switched off, with a "Sponsored" label when on (FR-ADM-008)

## 8. 3D and motion
- [x] Hero 3D occasion stage (henna → dhol → cake), draggable
- [x] Waving 3D bunting (jhandiyan) on the marketplace header
- [x] Spinnable 3D gift box or diya on empty states
- [x] Launchpad completion confetti
- [x] Tilt cards, reflector-stripe dividers, scrolling bazaar ticker
- [x] Respect prefers-reduced-motion and fall back when WebGL isn't available

## 9. Quality
- [x] Unit tests: countdown in PKT, price units, review eligibility, founding assignment, completeness
- [x] Typecheck, lint and production build pass
- [x] Smoke run of the main flows in a browser
- [x] README: setup, seed, environment variables, deploy (Vercel + Turso free)

## Next up: not yet built, or needs a decision from you
- [ ] Production image storage. Swap `saveImage()` in `src/lib/storage.ts` for Cloudinary or Supabase Storage (both have free tiers) before deploying to Vercel
- [ ] Sending real emails for verification and notifications (Resend free tier). Today the links are printed to the server log
- [ ] Push notifications (web push or the Android app). In-app notifications work now
- [ ] Phone OTP sign-in, to come once revenue starts
- [ ] Shared rate limiter for running on multiple servers (Upstash free tier). The current limiter only works on a single server
- [ ] Urdu and right-to-left support. The app is English-only for now, as decided
- [ ] Android app, after web is signed off
- [ ] Real vendor onboarding data: you'll provide categories, quotas and vendor details
- [ ] Legal review of the terms, privacy and vendor terms by Pakistan counsel. The pages are drafts and are marked as such
- [ ] Area list and map for every city. Rawalpindi and Islamabad sectors are seeded; other cities have a few areas each
