## Project details

- **Working name:** Rollin Locations (sub-brand of Rollin)
- **One-liner:** Find and book unique shoot locations by the day.
- **Default language:** Hebrew (RTL)
- **Localization:** support multiple locales (i18n)
- **Audience:** content creators and production teams
- **Marketplace type:** (TBD) creator ↔ host, with admin moderation
- **Roadmap:** see “Roadmap (v1 → vNext)” below

## Business + brand

### מודל עסקי (מפורט)

- **Hosts (מארחים):** נרשמים למערכת ומפרסמים משרד אחד או יותר.
- **Creators (שוכרים):** מבקשים הזמנה למשרד לפי תאריכים (יום אחד או יותר).
- **המערכת (Admin):** מגדירה לכל Host את מודל העמלות/תמחור המנוי.

#### עמלה (Commission)

- העמלה מחושבת לכל הזמנה/עסקה.
- סוגי עמלה נתמכים:
    - **אחוז (%):** לדוגמה 10% מהסכום הכולל.
    - **סכום קבוע:** לדוגמה ₪50 להזמנה.
- הגדרה ברמת:
    - **ברירת מחדל גלובלית** (לכל המערכת)
    - **Override לפי Host** (לכל מארח)
    - (אופציונלי v2+): Override לפי קטגוריה

#### מנוי/תכנית למארח (Host plan) (אופציונלי, v2+)

- אפשרות להגדיר למארח תכנית שמכתיבה:
    - סוג עמלה (אחוז/קבוע)
    - ערך עמלה
    - מגבלות שימוש (מספר לוקיישנים, מספר העלאות וידאו, וכו’)

#### v1 (MVP) ללא סליקה, עדיין “הזמנות”

- ב-v1 אין חיוב/תשלום במערכת.
- עדיין נוצרת **Booking Request** עם סטטוס:
    - requested → approved/rejected → cancelled
- העמלה נשמרת כנתון מחושב/משוער לצרכי דיווח עתידי (לא גבייה בפועל).

- **Core value:** fast discovery + availability confidence + smooth request/approval
- **Tone:** clean marketplace, creative/photography vibe, minimal UI
- **Categories:** curated browsing entry point + filter dimension

## Design system (single source of truth)

### Brand tokens (given)

- background-primary: `#ffffff`
- background-secondary: `#f7f9fc`
- text-primary: `#3e4243`
- primary-base: `#ca2527`
- Default theme: light

### shadcn/ui theme tokens (Tailwind CSS variables)

Use this as `app/globals.css` (or `styles/globals.css`). Values are derived to fit the **shadcn “neutral + primary”** system.

```css
@layer base {
	:root {
		/* Base */
		--background: 0 0% 100%; /* #ffffff */
		--foreground: 180 3% 25%; /* ~#3e4243 */

		--muted: 220 33% 97%; /* ~#f7f9fc */
		--muted-foreground: 215 16% 46%;

		--card: 0 0% 100%;
		--card-foreground: 180 3% 25%;

		--popover: 0 0% 100%;
		--popover-foreground: 180 3% 25%;

		/* Borders + inputs */
		--border: 220 16% 90%;
		--input: 220 16% 90%;
		--ring: 359 68% 47%; /* primary */

		/* Primary (Rollin red) */
		--primary: 359 68% 47%; /* #ca2527 */
		--primary-foreground: 0 0% 100%;

		/* Secondary */
		--secondary: 220 33% 97%; /* ~#f7f9fc */
		--secondary-foreground: 180 3% 25%;

		/* Accent */
		--accent: 220 24% 95%;
		--accent-foreground: 180 3% 25%;

		/* Destructive */
		--destructive: 0 84% 60%;
		--destructive-foreground: 0 0% 100%;

		/* Radius */
		--radius: 0.75rem; /* 12px */
	}
}
```

### Tailwind color mapping (shadcn default)

In `tailwind.config.ts`, keep the standard shadcn mapping:

```tsx
colors: {
	border: "hsl(var(--border))",
	input: "hsl(var(--input))",
	ring: "hsl(var(--ring))",
	background: "hsl(var(--background))",
	foreground: "hsl(var(--foreground))",
	primary: {
		DEFAULT: "hsl(var(--primary))",
		foreground: "hsl(var(--primary-foreground))",
	},
	secondary: {
		DEFAULT: "hsl(var(--secondary))",
		foreground: "hsl(var(--secondary-foreground))",
	},
	muted: {
		DEFAULT: "hsl(var(--muted))",
		foreground: "hsl(var(--muted-foreground))",
	},
	accent: {
		DEFAULT: "hsl(var(--accent))",
		foreground: "hsl(var(--accent-foreground))",
	},
	destructive: {
		DEFAULT: "hsl(var(--destructive))",
		foreground: "hsl(var(--destructive-foreground))",
	},
	card: {
		DEFAULT: "hsl(var(--card))",
		foreground: "hsl(var(--card-foreground))",
	},
	popover: {
		DEFAULT: "hsl(var(--popover))",
		foreground: "hsl(var(--popover-foreground))",
	},
}
```

### UI guidance (practical)

- **Primary CTA:** use `primary` (Rollin red). Keep it for 1 action per screen.
- **Background usage:** pages on `background`, sections/panels on `muted`.
- **Borders:** always `border` with 1px, avoid heavy shadows.
- **Focus:** rely on `ring` (primary) for accessibility.
- **RTL:** define `dir="rtl"` by default for Hebrew; per-locale switch for LTR.

## Roles (RBAC)

- **Guest:** browse + search + view location pages
- **Creator:** request bookings, manage bookings, view invoices
- **Host:** manage locations, availability, approve/reject requests
- **Admin:** manage users, categories, moderation, commission settings

## Roadmap (v1 → vNext)

### v1 (MVP, no payments)

- Public discovery: search + filters + category pages
- Location details + availability check (basic)
- Booking request + host approve/reject + creator status tracking
- Email notifications (Resend): request received, approved, rejected, cancelled
- Host location management + photo upload (Supabase Storage)
- Admin: categories CRUD + ordering + show/hide, basic moderation
- Hebrew default + locale switch (at least HE + EN)

### v1.1 (stabilization)

- Better availability UX (calendar view), conflict prevention
- Basic audit log for booking status changes
- Improved empty/error states + rate limiting considerations

### v2 (monetization)

- Payments (Stripe) + receipts/invoices flow
- Commission logic (fixed or per category)
- Refund/cancellation policy handling
- Payouts to hosts (if marketplace model is true)

### v3 (growth)

- Reviews/ratings
- Favorites / saved locations
- Messaging (creator ↔ host) or structured Q&A
- SEO improvements for public pages (sitemaps, canonical)

## Features (MVP = v1)

### Discovery

- Search results (cards)
- Filters (type, city/area, price range, categories)
- Category pages (browse by category)
- Location details page (gallery, rules, amenities)

### Availability + booking requests

- Availability check (date + start/end time)
- Price estimate (hours × base hourly price)
- Request booking form
- Statuses: requested → approved/rejected → cancelled (paid added in v2)

### Creator area

- My bookings (list + details)
- Profile/settings
- Invoices (placeholder in v1, real in v2)

### Host area

- Locations CRUD (draft/published/paused)
- Media upload: photos + videos (Supabase Storage)
- Availability management (blocks)
- Booking requests inbox + approve/reject

### Admin

- Category management (CRUD + ordering + show/hide)
- Location moderation (pause/unpause)
- Commission settings (v2)

## User flows (stories)

### Guest → discovery

1. Browse categories or search
2. Filter results
3. Open a location page
4. Check availability
5. Start booking request (prompts sign in if needed)

### Creator → request booking (v1)

1. Select date + time range
2. Fill booking details (project type, crew size, notes)
3. Submit request
4. Track status in “My bookings”
5. Cancel if needed

### Host → approve request (v1)

1. Receive request in inbox
2. Review details + availability
3. Approve or reject (optional note)
4. Booking status updates for creator

## Data structure (lean + UX-oriented)

### Users

**Stores:** name, email, phone, role

**Enables:** login, profile, permissions, booking ownership

### Categories

**Stores:** name, slug, cover/icon (optional), order, visible

**Enables:** category pages, homepage curated browsing, search filter

### Locations

**Stores:** title, description, type, address + geo, **media gallery (images + videos)**, host owner, categories, **pricing model** (hourly + optional daily), rules, amenities, status

**Enables:** listing pages, filters, details page, pricing

#### Pricing (for offices)

**Supported:**

- Hourly rate
- Daily rate

**Host management UX (recommended):**

- In the location editor, add a **Pricing** section with a simple toggle:
    - `Hourly` (required)
    - `Daily` (optional)
- Inputs:
    - Hourly price
    - Daily price
    - Minimum hours (optional)
- Display logic:
    - In search cards: show “From ₪X / hour” (if hourly exists), else “₪Y / day”
    - In booking form: user selects date + time range
        - If duration ≥ configurable threshold (e.g., 6–8 hours) and daily exists, show a **switch**: “Best price: Daily” vs “Hourly”
        - Always show price breakdown before submit
- Admin can optionally set a global “suggest daily” threshold later (v1.1+)

### Availability (time blocks)

**Stores:** location, start/end, available/blocked, note (optional)

**Enables:** availability check, prevents double booking

### Booking requests

**Stores:** location, creator, start/end, duration, price estimate, commission (v2), status, notes

**Enables:** request/approve/reject/cancel, booking history

### Payments (v2)

**Stores:** booking, provider, provider id, amount, currency, status

**Enables:** card payment, refunds, reconciliation

## Tech stack (for coding agents)

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind
- **UI:** shadcn/ui + lucide-react
- **Forms:** react-hook-form + zod
- **Backend:** Supabase
    - **DB:** Postgres
    - **Auth:** Supabase Auth (email/password + magic link/OTP optional)
    - **Storage:** Supabase Storage (location images + videos)
    - **Security:** Row Level Security (RLS) for all exposed tables[[1]](https://supabase.com/docs/guides/database/postgres/row-level-security)
- **Email:** Resend (transactional emails)
- **Maps:** Mapbox או Google Maps (place autocomplete + map)
- **Localization (i18n):** next-intl או next-i18next + RTL support
- **Payments (v2):** Stripe (recommended) + webhooks

### Supabase notes (must-have)

- Enable RLS on all relevant tables and define policies per role/ownership.[[2]](https://makerkit.dev/blog/tutorials/supabase-rls-best-practices)
- For media (images/videos): consider public bucket for published assets, or signed URLs for private assets.[[3]](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl)
- Keep video upload constraints (v1): max duration + max file size, and allow 1 featured video per location (optional).

### Resend notes (must-have)

- Configure SPF/DKIM/DMARC and treat booking emails as transactional.[[4]](https://resend.com/docs/knowledge-base/what-sending-feature-to-use)
- Handle retries + idempotency + delivery webhooks in production (later).[[5]](https://resend.com/docs/knowledge-base/email-best-practices-skill)

## UI screens checklist (for mockup build)

### Public

- Landing
- Search (filters + results)
- Category page
- Location details
- Booking request (multi-step form)
- Auth (mock)

### Creator

- Overview
- My bookings (list)
- Booking details
- Invoices
- Settings

### Host

- Overview
- Locations (list)
- Location editor (new/edit)
- Availability manager
- Requests (list)
- Request details (approve/reject)
- Settings

### Admin

- Dashboard
- Users
- Categories
- Locations moderation
- Bookings overview
- Settings

## Open decisions (do not guess)

1. Marketplace model: true creator↔host or internal inventory?
2. v1 flow: request to host approval vs lead form handled manually?
3. Availability rules: minimum hours? fixed opening hours? manual blocks only?
4. Pricing: hourly only vs half-day/day packages? add-ons?
5. Commission: fixed % vs per-category? who pays (host/creator)?
6. Invoicing: who issues invoices (platform vs host)?
7. Auth: email/password vs OTP vs Google
8. Languages: HE only vs HE+EN in v1

[Rollin Locations — Roadmap](https://www.notion.so/5e1e05437c0f41aa8ff137eaedd572de?pvs=21)