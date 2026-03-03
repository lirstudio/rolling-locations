# Phase 1 – App Foundation (Frontend Only)

Back to [Roadmap Index](../../roadmap.md)

## Objective

Establish the frontend foundation so all feature chats can build screens quickly and consistently, without backend integration yet.

## Scope

- Theme system and visual tokens
- Language and RTL baseline
- Frontend contracts (types + zod schemas) for mock data
- Cursor rules/skills governance
- Navigation scaffolding and app shell stability

## Already in place

- Theme tokens applied in `src/app/globals.css`
- Basic dashboard shell exists in `src/app/(dashboard)/layout.tsx`
- Sidebar exists in `src/components/app-sidebar.tsx`
- Core Cursor rules/skills exist in `.cursor/rules/` and `.cursor/skills/`

## Work items

### 1) App identity baseline

- [ ] Update app metadata/title/description in `src/app/layout.tsx`
- [ ] Align product naming in auth and header screens (replace template naming)
- [ ] Add favicon/app icon placeholders for Rollin Locations

### 2) Frontend-only i18n scaffold

- [ ] Set default root direction to Hebrew RTL at layout level
- [ ] Add frontend locale dictionaries (he/en) for UI labels only
- [ ] Define key namespaces: `common`, `auth`, `dashboard`, `marketing`, `host`, `creator`, `admin`

### 3) Frontend contracts (no API yet)

- [ ] Add shared `src/types/` for role, status, core view models
- [ ] Add `src/schemas/` zod schemas for form validation and mock payload shape
- [ ] Add `src/mocks/` seed data aligned with spec entities

### 4) App shell hardening

- [ ] Keep a stable route map for dashboard-only flow
- [ ] Ensure sidebar/header/footer can support role-based variants
- [ ] Add reusable empty/loading/error UI states

### 5) Cursor operating model

- [ ] Keep rules and skills aligned to frontend-first workflow
- [ ] Add one short “How to start a phase chat” section in docs (optional)

## Out of scope

- Supabase/Auth/Resend setup
- API routes and DB migrations
- Real data persistence

## Done when

- [ ] App naming and metadata are product-correct
- [ ] RTL and language scaffolding is visible in UI shell
- [ ] Types/schemas/mocks exist and are used by dashboard pages
- [ ] Dashboard shell is stable for role-specific phases
