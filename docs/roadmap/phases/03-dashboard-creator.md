# Phase 4 – Dashboard: Creator User

Back to [Roadmap Index](../../roadmap.md)

## Objective

Build creator-facing dashboard so a logged-in creator can browse booking history, inspect booking details, and manage creator settings in frontend mock mode.

## Pages in this phase

- `/creator`
- `/creator/bookings`
- `/creator/bookings/[id]`
- `/creator/invoices` (placeholder)
- `/creator/settings`

## Work items

### 1) Creator navigation

- [ ] Add role-specific creator nav in sidebar
- [ ] Route-level active states and breadcrumbs

### 2) Booking visibility

- [ ] Creator overview with key stats cards
- [ ] My bookings table/list with filtering by status
- [ ] Booking details page with status timeline
- [ ] Cancel request interaction (mock)

### 3) Invoices placeholder

- [ ] Frontend placeholder page for invoices (v1)
- [ ] Clear copy that invoices become active in v2

### 4) Creator settings

- [ ] Creator settings/profile page
- [ ] Reuse shared settings form components from Users phase

## Out of scope

- Real invoice generation
- Real booking synchronization with host backend
- Payment integration

## Demo acceptance

By end of phase, you can:
- [ ] Log in as creator and navigate creator-only screens
- [ ] View booking list and booking detail flow in mock state
- [ ] Use creator settings pages with local frontend persistence
