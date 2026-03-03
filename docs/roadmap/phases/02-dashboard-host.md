# Phase 3 – Dashboard: Host User

Back to [Roadmap Index](../../roadmap.md)

## Objective

Build host-facing screens and flows so a logged-in host can navigate host dashboard, create/manage listings, manage availability, and process booking requests in frontend mock mode.

## Pages in this phase

- `/host`
- `/host/locations`
- `/host/locations/new`
- `/host/locations/[id]/edit`
- `/host/locations/[id]/availability`
- `/host/requests`
- `/host/requests/[id]`
- `/host/settings`

## Work items

### 1) Host navigation

- [ ] Add role-specific host nav in sidebar
- [ ] Add active-state and breadcrumbs for host routes

### 2) Locations management UI

- [ ] Locations list page (table/cards, filters, quick actions)
- [ ] Create/edit location forms using zod schemas
- [ ] Media placeholders and upload UI shell (frontend only)
- [ ] Status management UI: draft/published/paused

### 3) Availability UX

- [ ] Availability calendar UI
- [ ] Block/unblock time slot interactions
- [ ] Conflict visualization (mock logic)

### 4) Booking requests inbox

- [ ] Requests list with status filtering
- [ ] Request details page with approve/reject actions
- [ ] Timeline/status badges for request state

### 5) Host settings

- [ ] Host profile/settings screen
- [ ] Notification preferences UI

## Out of scope

- Real storage uploads
- Real scheduling conflict engine
- Real notification sending

## Demo acceptance

By end of phase, you can:
- [ ] Log in as host and see host-only navigation
- [ ] Create, edit, and manage host listings in mock state
- [ ] Manage availability blocks in UI
- [ ] Approve/reject booking requests in mock state
