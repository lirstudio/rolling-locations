---
name: rollin-locations-features
description: Implements or plans v1 features for Rollin Locations (location booking marketplace). Use when building discovery, booking requests, host area, admin, or any feature listed in the project spec. References data model, roles, UI screens checklist, and roadmap from docs/project-specification.md.
---

# Rollin Locations – Feature Development

Full spec: [docs/project-specification.md](../../docs/project-specification.md)

## Roles (RBAC)

| Role | Capabilities |
|------|-------------|
| **Guest** | Browse, search, view location pages, start booking (redirect to auth) |
| **Creator** | Request bookings, manage own bookings, profile/settings |
| **Host** | Manage locations, availability, approve/reject requests |
| **Admin** | Users, categories CRUD, location moderation, commission settings (v2) |

## Data entities (v1)

- **Users** – id, name, email, phone, role
- **Categories** – id, name, slug, cover/icon, order, visible
- **Locations** – id, title, description, type, address+geo, media_gallery, host_id, categories, pricing (hourly + optional daily), rules, amenities, status (draft/published/paused)
- **Availability** – location_id, start, end, is_blocked, note
- **Booking Requests** – id, location_id, creator_id, start, end, duration, price_estimate, status (requested→approved/rejected→cancelled), notes

## v1 UI screens checklist

**Public:** Landing · Search+filters · Category page · Location details · Booking request form · Auth

**Creator:** Overview · My bookings (list) · Booking details · Invoices (placeholder) · Settings

**Host:** Overview · Locations list · Location editor (new/edit) · Availability manager · Requests inbox · Request details (approve/reject) · Settings

**Admin:** Dashboard · Users · Categories · Locations moderation · Bookings overview · Settings

## Feature workflow

When implementing a feature:

1. Identify which role(s) it serves and which data entities it touches.
2. Check `src/components/` and `src/hooks/` for reusable parts before creating new ones.
3. Use Supabase with RLS (see `supabase-rls` rule). Never bypass policies.
4. All user-facing strings through i18n keys (see `i18n-rtl` rule).
5. Forms: react-hook-form + zod schema.
6. Keep server components by default; add `"use client"` only where hooks/events require it.

## Booking request statuses (v1)

```
requested → approved → (paid - v2)
          ↘ rejected
          ↘ cancelled (creator or host can cancel)
```

No payment in v1. Commission is computed and stored for reporting only.

## Open decisions – do NOT guess

See spec section "Open decisions": marketplace model, v1 flow, availability rules, pricing model, commission, invoicing, auth method, languages.
