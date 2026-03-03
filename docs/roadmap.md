# Rollin Locations – Frontend-First Roadmap

Primary reference: [project-specification.md](./project-specification.md)

This roadmap is optimized for your workflow:
- frontend first
- phase-based chats
- page-by-page execution

Backend integration (Supabase/Resend/Stripe) is deferred until core frontend screens and flows exist.

---

## Execution model

1. Open one chat per phase file in `docs/roadmap/phases/`.
2. Build phase deliverables in order.
3. For Marketing, open one chat per page file in `docs/roadmap/marketing/`.
4. Do not start backend wiring until the phase explicitly allows it.

---

## Phases

| Order | Phase | Status | File |
|---|---|---|---|
| 1 | App Foundation | ⬜ To do | [roadmap/phases/00-app-foundation.md](./roadmap/phases/00-app-foundation.md) |
| 2 | Dashboard – Users | ⬜ To do | [roadmap/phases/01-dashboard-users.md](./roadmap/phases/01-dashboard-users.md) |
| 3 | Dashboard – Host | ⬜ To do | [roadmap/phases/02-dashboard-host.md](./roadmap/phases/02-dashboard-host.md) |
| 4 | Dashboard – Creator | ⬜ To do | [roadmap/phases/03-dashboard-creator.md](./roadmap/phases/03-dashboard-creator.md) |
| 5 | Dashboard – Admin | ⬜ To do | [roadmap/phases/04-dashboard-admin.md](./roadmap/phases/04-dashboard-admin.md) |
| 6 | Marketing Website | ⬜ To do | [roadmap/phases/05-marketing-website.md](./roadmap/phases/05-marketing-website.md) |

---

## Current state (already completed)

- Cursor setup baseline done (rules + skills + template cleanup).
- Core dashboard shell exists and can be iterated.
- Roadmap structure now split by phase and page for focused development chats.

---

## Marketing page files

- [roadmap/marketing/home.md](./roadmap/marketing/home.md)
- [roadmap/marketing/locations-index.md](./roadmap/marketing/locations-index.md)
- [roadmap/marketing/location-details.md](./roadmap/marketing/location-details.md)
- [roadmap/marketing/404.md](./roadmap/marketing/404.md)
- [roadmap/marketing/other-required-pages.md](./roadmap/marketing/other-required-pages.md)

---

## Product constraints

- Hebrew (`he`) and RTL by default.
- Use shadcn components in `src/components/ui`.
- Keep one primary CTA per screen.
- Build mock-first UI/flows before backend integration.
