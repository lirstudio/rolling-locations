# Phase 5 – Dashboard: Admin User

Back to [Roadmap Index](../../roadmap.md)

## Objective

Build admin-facing management screens so an admin can navigate dedicated views and operate moderation/configuration workflows in frontend mock mode.

## Pages in this phase

- `/admin`
- `/admin/users`
- `/admin/categories`
- `/admin/locations`
- `/admin/bookings`
- `/admin/settings`

## Work items

### 1) Admin navigation and shell

- [ ] Add admin-only sidebar routes and route guards (mock role)
- [ ] Ensure dashboard layout supports high-density data pages

### 2) Management tables

- [ ] Users management table UI
- [ ] Categories CRUD UI (including ordering interaction)
- [ ] Locations moderation table UI
- [ ] Bookings overview table UI

### 3) Admin settings

- [ ] Settings page sections for platform config (frontend only)
- [ ] Commission section as v2 placeholder with disabled controls

### 4) Shared table patterns

- [ ] Standardize column/filter/action behavior across admin pages
- [ ] Reuse shared data-table component contracts

## Out of scope

- Real moderation mutations against backend
- Role/permission enforcement at API level
- Commission engine implementation

## Demo acceptance

By end of phase, you can:
- [ ] Log in as admin and access admin-only navigation
- [ ] Navigate all admin pages with realistic mock data
- [ ] Perform CRUD-like interactions in frontend state
