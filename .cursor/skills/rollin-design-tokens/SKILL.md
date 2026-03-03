---
name: rollin-design-tokens
description: Applies the Rollin Locations design system when adding or changing themes, global styles, shared layout, or UI components. References brand tokens, CSS variables, Tailwind color mapping, and UI guidance from docs/project-specification.md.
---

# Rollin Design Tokens

Full spec: [docs/project-specification.md](../../docs/project-specification.md)

## CSS variables (globals.css `:root`)

```css
:root {
  --background: 0 0% 100%;          /* #ffffff */
  --foreground: 180 3% 25%;         /* #3e4243 */
  --muted: 220 33% 97%;             /* #f7f9fc */
  --muted-foreground: 215 16% 46%;
  --card: 0 0% 100%;
  --card-foreground: 180 3% 25%;
  --popover: 0 0% 100%;
  --popover-foreground: 180 3% 25%;
  --border: 220 16% 90%;
  --input: 220 16% 90%;
  --ring: 359 68% 47%;              /* primary red */
  --primary: 359 68% 47%;           /* #ca2527 */
  --primary-foreground: 0 0% 100%;
  --secondary: 220 33% 97%;
  --secondary-foreground: 180 3% 25%;
  --accent: 220 24% 95%;
  --accent-foreground: 180 3% 25%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --radius: 0.75rem;
}
```

## Tailwind color mapping

All colors map to the CSS variables above via `hsl(var(--token))`.
See `tailwind.config.ts` for the full mapping. Never hardcode hex/rgb colors in class names.

## UI guidance

| Concern | Rule |
|---------|------|
| Primary CTA | `<Button>` (default variant) – one per screen |
| Page background | `bg-background` |
| Panels / cards | `bg-muted` or `bg-card` |
| Borders | `border border-border` (1px, no heavy shadows) |
| Focus | Rely on `ring` (primary); never remove `focus-visible` |
| Border radius | `rounded-xl` for cards/modals (= `--radius` 0.75rem) |
| Default theme | Light only in v1; no dark mode toggle needed |

## Design reference images

Visual inspiration and mockups live in **docs/design-reference/**. Before implementing or refining a screen (landing, dashboard, booking flow, listings):

1. Read **docs/design-reference/INDEX.md** to pick the best-matching reference image.
2. Load that image with the Read tool to extract layout, hierarchy, and patterns.
3. Apply those patterns using this skill’s tokens and shadcn components; never copy colors or assets literally—adapt to Rollin brand.

## When applying this skill

1. Verify `app/globals.css` uses the `:root` block above.
2. Verify `tailwind.config.ts` uses the standard shadcn `hsl(var(--token))` mapping.
3. Do not add arbitrary colors or override tokens outside the `:root` block.
4. Spacing and layout follow Tailwind defaults; use `--header-height` and `--sidebar-width` CSS vars for layout dimensions.
5. For UI inspiration, use docs/design-reference/ per the “Design reference images” section above.
