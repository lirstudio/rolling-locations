Phase 1 – App Foundation
```
Implement Phase 1 (App Foundation) from docs/roadmap/phases/00-app-foundation.md.

Follow our project rules in .cursor/rules/ (design-system, tech-stack, project-structure, i18n-rtl) and apply the rollin-design-tokens and rollin-locations-features skills. Use docs/project-specification.md as the source of truth for brand tokens and data entities.

Work through the phase work items in order. Do not add Supabase, API routes, or real persistence—frontend only. When adding types/schemas/mocks, align with the spec’s data model (Users, Categories, Locations, Availability, Booking requests).
```

Phase 2 – Dashboard: Users
```
Implement Phase 2 (Dashboard – Users) from docs/roadmap/phases/01-dashboard-users.md.

Follow .cursor/rules/ (design-system, tech-stack, project-structure, i18n-rtl) and use the rollin-locations-features and rollin-design-tokens skills. Reference docs/project-specification.md for roles and auth flows.

Deliver: sign-in, sign-up, forgot-password, user settings, account settings—all with mock auth (Zustand). One primary CTA per screen, RTL-ready, and use shadcn components from src/components/ui. No real Supabase auth yet.
```

Phase 3 – Dashboard: Host
```
Implement Phase 3 (Dashboard – Host) from docs/roadmap/phases/02-dashboard-host.md.Follow project rules in .cursor/rules/ and apply rollin-locations-features (data model: Locations, Availability, Booking requests) and rollin-design-tokens. Use docs/project-specification.md for Host area and UI checklist.Build all Host pages and flows with mock data only. Use existing project structure (src/components/<feature>, src/hooks). No real storage or backend—frontend state and UI only.
```

## Phase 4 – Dashboard: Creator
```
Implement Phase 4 (Dashboard – Creator) from docs/roadmap/phases/03-dashboard-creator.md.Follow .cursor/rules/ and the rollin-locations-features and rollin-design-tokens skills. Reference docs/project-specification.md for Creator area and booking statuses.Deliver Creator overview, my bookings list, booking details, invoices placeholder, and creator settings. Mock data only; one primary CTA per screen; reuse shared components and design tokens.
```
## Phase 5 – Dashboard: Admin
```
Implement Phase 5 (Dashboard – Admin) from docs/roadmap/phases/04-dashboard-admin.md.Follow .cursor/rules/ and apply rollin-locations-features (Admin scope: users, categories, locations moderation, bookings overview) and rollin-design-tokens. Use docs/project-specification.md for Admin UI checklist.Build all Admin management screens with mock data. Reuse shared data-table patterns and shadcn components. Commission settings as v2 placeholder (disabled). No real API or RLS yet.
```

## Phase 6 – Marketing (phase-level chat)
```
Implement Phase 6 (Marketing Website) from docs/roadmap/phases/05-marketing-website.md.Follow .cursor/rules/ (design-system, i18n-rtl, project-structure) and use rollin-design-tokens and rollin-locations-features. Reference docs/project-specification.md for public pages and design system.Work through the marketing page files in docs/roadmap/marketing/ (home, locations-index, location-details, 404, other-required-pages). Hebrew/RTL first, one primary CTA per page, mock data only. No backend search or booking yet.
```

##Marketing – single-page chats
For one chat per marketing page, use the phase prompt above but point at the specific page file, for example:

## Home:
```
Implement the Marketing Home page from docs/roadmap/marketing/home.md. Follow .cursor/rules/ and use rollin-design-tokens and rollin-locations-features. Build all sections (Navbar, Hero, Category Highlights, How It Works, Featured Locations, Testimonials, CTA Banner, Footer) with mock data. RTL-first, one primary CTA, shadcn components.
```

## Locations Index:
```
Implement the Locations Index page from docs/roadmap/marketing/locations-index.md. Follow project rules and rollin-design-tokens / rollin-locations-features. Build filters, results grid, pagination, empty state. Mock data and client-side filtering only.
Location Details:
Implement the Location Details page from docs/roadmap/marketing/location-details.md. Follow .cursor/rules/ and rollin skills. Build gallery, summary, pricing/availability widget, amenities, rules, host snapshot, similar locations, sticky CTA. Mock payload only.
```

## 404:
```
Implement the custom 404 page from docs/roadmap/marketing/404.md. Follow design-system and rollin-design-tokens. Branded message, primary + secondary recovery actions, RTL-safe.
Making rules and skills stick
Rules apply automatically when their globs match (e.g. **/*.tsx for design-system, i18n-rtl). Opening the phase doc and relevant .tsx files helps.
```