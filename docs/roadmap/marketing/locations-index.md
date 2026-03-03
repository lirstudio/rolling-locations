# Marketing Page – Locations Index

Back to [Marketing Phase](../phases/05-marketing-website.md)

## Route

`/locations` (or `/search` if keeping existing naming)

## Objective

Enable users to browse and filter locations quickly with clear card-level information.

## Sections

1. Page Header + Intro
2. Filters Panel
3. Results Grid
4. Pagination / Load More
5. Empty State

## Section requirements

### 1) Header + Intro
- Page title
- Short guidance copy
- Active filters summary chips

### 2) Filters Panel
- Category multi-select
- City/area selector (UI-only placeholder)
- Price range slider
- Location type selector
- Clear filters action

### 3) Results Grid
- Reusable location card component
- Card fields: image, title, location, category, price from, availability badge
- Card CTA to details page

### 4) Pagination / Load More
- Choose one pattern and keep consistent
- Preserve filter state while paging

### 5) Empty State
- Helpful messaging
- “Clear filters” action
- Link back to home

## Data mode

Frontend mock dataset and client-side filtering.

## Done when

- [ ] Filters update visible results
- [ ] Card component is reusable by other pages
- [ ] Empty state is polished and actionable
- [ ] UX works in mobile and desktop RTL layouts
