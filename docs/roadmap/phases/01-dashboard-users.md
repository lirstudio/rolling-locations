# Phase 2 – Dashboard: Users

Back to [Roadmap Index](../../roadmap.md)

## Objective

Deliver a complete frontend auth/user experience so a user can register, log in, access dashboard shell, and manage profile/settings using mock data.

## Pages in this phase

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/settings/user`
- `/settings/account`

## Work items

### 1) Auth UI refinement

- [ ] Replace template copy/branding with Rollin content
- [ ] Keep one clear primary CTA per screen
- [ ] Add friendly validation/error/empty states

### 2) Frontend auth state (mock mode)

- [ ] Implement temporary auth store (Zustand) for session mock
- [ ] Add role-aware redirect after sign-in
- [ ] Add guard wrappers for dashboard routes (mock guard)

### 3) Registration flow

- [ ] Sign-up form includes role selection (Host/Creator)
- [ ] Frontend validation with zod
- [ ] Success path routes user into dashboard shell

### 4) User settings

- [ ] User settings screen (language, UI preferences)
- [ ] Account settings screen (profile data, password form mock)
- [ ] Consistent save/discard UX

### 5) Reusable auth components

- [ ] Shared auth card/layout component
- [ ] Shared form primitives/wrappers for auth forms

## Out of scope

- Real Supabase auth integration
- Email delivery and password reset backend
- OAuth provider integration

## Demo acceptance

By end of phase, you can:
- [ ] Open sign-in/sign-up and complete the flow with mock data
- [ ] Enter dashboard shell after login
- [ ] Navigate to settings pages
- [ ] Edit/save profile settings in frontend state
