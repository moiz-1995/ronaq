# Ronaq

Ronaq is a marketplace for event vendors and an event planner, launching in Rawalpindi and Islamabad. Families browse local vendors (henna, catering, decor, photography and more), plan events with a checklist and countdown, and message vendors. Vendors get a storefront and an inquiry inbox, and Ronaq ops run the marketplace from an admin console.

The product baseline is **Ronaq PRD v1.0**. Build progress is tracked in [TODO.md](TODO.md).

## Stack (free tiers only)

| Layer | Choice | Production (free) |
|---|---|---|
| App | Next.js 15 (App Router, server actions), React 19, TypeScript | Vercel Hobby |
| Styling | Tailwind CSS 4 with the "Truck Art Mela" brand tokens in `src/app/globals.css` | — |
| 3D | three.js via `@react-three/fiber` and `drei`, lazy-loaded, with SVG fallbacks | — |
| Database | SQLite through libSQL and Drizzle ORM | Turso free tier |
| Auth | Email and password (bcrypt) with a signed JWT cookie (`jose`); phone OTP comes later | — |
| Uploads | Local disk behind `src/lib/storage.ts` | Swap in Cloudinary or Supabase Storage (free tiers) |

## Run it locally

```bash
npm install
cp .env.example .env.local   # optional locally; defaults work
npm run db:migrate           # create data/ronaq.db
npm run db:seed              # demo catalogue, vendors, accounts, analytics
npm run dev                  # http://localhost:3000
```

Demo accounts (development only):

| Who | Email | Password |
|---|---|---|
| Family planning a wedding | ayesha@example.com | password123 |
| Vendor (Hina's Henna Studio) | hina@example.com | password123 |
| Admin | admin@ronaq.pk | ronaq-admin |
| Moderator | moderator@ronaq.pk | ronaq-mod |

Other scripts:

- `npm test`: unit tests for business rules (PKT countdown, price units, review eligibility, founding numbers, service areas)
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run db:generate`: create a migration after editing `src/db/schema.ts`

## Deploy (free)

1. **Database.** Create a Turso database. Set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN=…`, then run `npm run db:migrate` (and `db:seed` for demo data).
2. **App.** Import the repo into Vercel and set `AUTH_SECRET` (a long random string) plus the two database variables.
3. **Uploads.** Vercel's disk is read-only. Before real vendors upload photos, swap `saveImage()` in `src/lib/storage.ts` for Cloudinary or Supabase Storage.
4. **Email verification.** Links are printed to the server log for now. Plug a free provider (for example Resend) into `signUpAction` and `resendVerification` in `src/app/actions/auth.ts`.

## Map of the code

```
src/
  app/
    (site)/          public site, family planner and seller dashboard (shared header and footer)
      page.tsx           home: 3D occasion stage, search, categories, top vendors
      marketplace, c/[slug]   search and category pages (filters driven by attributes)
      v/[slug]           vendor profile, /contact (inquiry), /review
      launchpad, dashboard, events, calendar, shortlist, inbox, notifications, account
      sell, seller/*     start-selling landing, onboarding wizard, vendor dashboard
    (admin)/admin/*  ops console: overview, vendors, reports, reviews, portfolio,
                     categories and attributes, templates, users, audit log, settings
    actions/         server actions (auth, market, inquiries, planner, seller, reviews, admin)
  components/        UI: art/ (craft SVG illustrations), three/ (3D scenes), vendor/, planner/, …
  db/                schema.ts, catalog.ts (launch categories, cities, templates), seed.ts
  lib/               auth, search, domain rules, time (PKT), price, settings, storage, analytics
tests/               vitest unit tests
```

## Product rules worth knowing

- **Inquiry-led.** No payments or bookings in the MVP. Disclaimers appear wherever a booking could be implied.
- **Contact privacy.** Vendor phone numbers are hidden unless the vendor opts in. Families choose exactly which event details go with an inquiry.
- **Price honesty.** Units are always shown. Custom quotes are never sorted as numbers and appear last in price sort.
- **Configurable catalogue.** Admins edit categories and attributes (filters, seller questions, profile fields) without a release.
- **Founding vendors.** The first N approvals (default 200, set in Settings) are numbered automatically. Admins can override.
- **Reviews.** The policy is configurable: inquiry-linked (default), any member, or admin-checked evidence, with optional pre-moderation.
- **Least privilege.** Moderators see reports, reviews and portfolio only. Admins see everything. Sensitive actions go to the audit log.
- **Analytics** use pseudonymous IDs and never include message text or private event data.
- **Time** is calculated in Pakistan Standard Time (Asia/Karachi) everywhere.
