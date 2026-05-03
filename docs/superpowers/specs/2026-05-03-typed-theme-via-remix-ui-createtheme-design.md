# Typed theme via `remix/ui` `createTheme`

**Date:** 2026-05-03
**Scope:** templates `default`, `bun`, `cloudflare`, `service-worker`, `unbundled`. (`minimal` has no theming today and is unaffected.)

## Goal

Replace the current Tailwind v4-style theme (`app/assets/theme.css` defining flat
`--color-gray-900`, `--text-4xl`, `--spacing`, etc., consumed via raw
`var(--…)` strings inside `css({...})`) with the typed theme contract from
`remix/ui` (`createTheme` + `theme`). Token access becomes type-checked
(`theme.colors.text.primary`), and dark mode collapses from inline
`@media (prefers-color-scheme: dark)` overrides in every component into a
single set of `light-dark(...)` token values.

## Non-goals

- Adopting `RMX_01` / `RMX_01_GLYPHS` — no glyph sheet; the example uses
  `<picture>`/`<img>` for the logo.
- Touching the `minimal` template.

## Decisions

These were settled during brainstorming; record here for reference:

1. **Approach:** Use `remix/ui`'s `createTheme` directly. The contract is
   fixed and small; we live within it rather than building a parallel
   wrapper.
2. **Dark mode:** `light-dark()` baked into token values. Single `<Theme/>`
   covers both modes; components stop knowing about color schemes.
3. **Values outside the contract:** Use raw literals in the one place they
   appear (page padding, hero font size, content max-widths, the warning
   text color). No escape-hatch helper, no extension layer.
4. **Roll-out:** All five templates in one pass; the diffs are mechanical
   and identical text in each.

## File structure

### `default`, `bun`, `cloudflare`, `service-worker`

```
app/
  assets/                   ← DELETED (empty after migration)
    preflight.css           ← MOVED to app/styles/preflight.css
    theme.css               ← DELETED
  styles/
    preflight.css           ← NEW location (also: add `color-scheme: light dark;` on :root)
  components/
    Theme.tsx               ← NEW: `export let Theme = createTheme({...})`
    Document.tsx            ← MODIFIED: render <Theme/> in <head>; html bg uses theme
    Welcome.tsx             ← MODIFIED: theme.* tokens; drop dark-mode media queries
    CharacterCounter.tsx    ← MODIFIED: theme.* tokens; drop dark-mode media queries
  index.css                 ← MODIFIED: drop theme.css import; rewrite preflight import to ./styles/preflight.css
```

### `unbundled`

`unbundled` keeps `app/assets/` because its `index.css` also lives there
(structurally different from the other templates by design). Only the
theme work applies:

```
app/
  assets/
    index.css               ← MODIFIED: drop the `@import "./theme.css"` line
    preflight.css           ← MODIFIED: add `color-scheme: light dark;` on :root
    theme.css               ← DELETED
  components/
    Theme.tsx               ← NEW: `export let Theme = createTheme({...})`
    Document.tsx            ← MODIFIED: render <Theme/> in <head>; html bg uses theme
    Welcome.tsx             ← MODIFIED: theme.* tokens; drop dark-mode media queries
    CharacterCounter.tsx    ← MODIFIED: theme.* tokens; drop dark-mode media queries
```

`Theme.tsx` lives in `app/components/` next to `Document.tsx` (which renders
it). Application code imports `theme` directly from `"remix/ui"` — it is a
global singleton bound to the contract's CSS-var names, not to any
particular `createTheme` call.

## Token values

Every color uses `light-dark(<light>, <dark>)`. The light values reproduce
the existing example's appearance (gray-900 text on white, gray-50 card on
gray-200 border, blue-600 primary button); the dark values reproduce the
existing `@media (prefers-color-scheme: dark)` overrides (gray-100 text,
gray-900 cards, blue-500 buttons).

```ts
import { createTheme } from 'remix/ui/theme'

export let Theme = createTheme({
  fontFamily: {
    sans: '"Inter var", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  space:         { none: '0px', px: '1px', xs: '2px', sm: '4px', md: '8px', lg: '12px', xl: '16px', xxl: '24px' },
  radius:        { none: '0px', sm: '4px', md: '6px', lg: '8px', xl: '12px', full: '9999px' },
  fontSize:      { xxxs: '10px', xxs: '11px', xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px', xxl: '28px' },
  lineHeight:    { tight: '1.2', normal: '1.5', relaxed: '1.7' },
  letterSpacing: { tight: '-0.025em', normal: '0', meta: '0.025em', wide: '0.05em' },
  fontWeight:    { normal: '400', medium: '500', semibold: '600', bold: '700' },
  control:       { height: { sm: '28px', md: '36px', lg: '44px' } },
  shadow: {
    xs: '0 1px 2px rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px rgb(0 0 0 / 0.10)',
    md: '0 4px 10px rgb(0 0 0 / 0.12)',
    lg: '0 10px 30px rgb(0 0 0 / 0.16)',
    xl: '0 20px 50px rgb(0 0 0 / 0.20)',
  },
  surface: {
    lvl0: 'light-dark(#ffffff, #0a0a0a)',
    lvl1: 'light-dark(#f9fafb, #111827)', // gray-50  / gray-900
    lvl2: 'light-dark(#f3f4f6, #1f2937)', // gray-100 / gray-800
    lvl3: 'light-dark(#e5e7eb, #374151)',
    lvl4: 'light-dark(#d1d5db, #4b5563)',
  },
  colors: {
    text: {
      primary:   'light-dark(#111827, #f3f4f6)', // gray-900 / gray-100
      secondary: 'light-dark(#374151, #d1d5db)',
      muted:     'light-dark(#6b7280, #9ca3af)', // gray-500 / gray-400
      link:      'light-dark(#2563eb, #60a5fa)', // blue-600 / blue-400
    },
    border: {
      subtle:  'light-dark(#e5e7eb, #1f2937)', // gray-200 / gray-800
      default: 'light-dark(#d1d5db, #374151)', // gray-300 / gray-700
      strong:  'light-dark(#9ca3af, #4b5563)',
    },
    focus:   { ring: 'light-dark(#3b82f6, #60a5fa)' },
    overlay: { scrim: 'rgb(0 0 0 / 0.45)' },
    action: {
      primary: {
        background:       'light-dark(#2563eb, #3b82f6)', // blue-600 / blue-500
        backgroundHover:  'light-dark(#1d4ed8, #2563eb)', // blue-700 / blue-600
        backgroundActive: 'light-dark(#1e40af, #1d4ed8)',
        foreground:       '#ffffff',
        border:           'light-dark(#2563eb, #3b82f6)',
      },
      secondary: {
        background:       'light-dark(#ffffff, #18181b)',
        backgroundHover:  'light-dark(#f9fafb, #27272a)',
        backgroundActive: 'light-dark(#f3f4f6, #3f3f46)',
        foreground:       'light-dark(#111827, #f3f4f6)',
        border:           'light-dark(#d1d5db, #374151)',
      },
      danger: {
        background:       'light-dark(#dc2626, #ef4444)', // red-600 / red-500
        backgroundHover:  'light-dark(#b91c1c, #dc2626)',
        backgroundActive: 'light-dark(#991b1b, #b91c1c)',
        foreground:       '#ffffff',
        border:           'light-dark(#dc2626, #ef4444)',
      },
    },
  },
})
```

## `preflight.css` change

Add a single declaration at the top of the existing `@layer base` block so
`light-dark()` resolves correctly:

```css
:root {
    color-scheme: light dark;
}
```

Without this, every `light-dark()` value evaluates to its first argument.

## Element → component swaps

The example uses these raw HTML elements; only `<button>` has a `remix/ui`
equivalent today. The rest stay as raw HTML.

| Raw element                         | Used for          | `remix/ui` swap                              |
| ----------------------------------- | ----------------- | -------------------------------------------- |
| `<button type="submit">`            | "Sign" submit     | `<Button tone="primary" type="submit">` from `remix/ui/button` |
| `<input>`                           | Name field        | stays raw, but apply `inputStyle` mixin from `remix/ui/combobox` |
| `<textarea>`                        | Message field     | stays raw, but apply `inputStyle` mixin from `remix/ui/combobox` (with a small extension) |
| `<a href>`                          | External links    | none — no `Anchor`/`Link` component (`remix/ui/anchor` is a floating-UI positioning helper) |
| `<picture>`/`<source>`/`<img>`      | Logo              | none                                         |
| `<h1>`/`<h2>`/`<p>`                 | Text              | none                                         |
| `<header>`/`<nav>`/`<section>`/`<form>`/`<ul>`/`<li>`/`<div>` | Structure | none |

### `<input>` / `<textarea>` → `inputStyle` consequences

`remix/ui/combobox` exports `inputStyle: CSSMixinDescriptor` — the same
mixin the combobox itself applies to its internal `<input>`. We reuse it
verbatim to give our text fields a "form control" look that matches the
rest of the design system (combobox, select trigger, etc.):

```ts
import { inputStyle } from 'remix/ui/combobox'

<input mix={inputStyle} name="name" placeholder="Your name" required />

<textarea
  mix={[inputStyle, css({ paddingBlock: theme.space.sm, resize: 'vertical' })]}
  name="message"
  placeholder="Leave a message..."
  rows={3}
  required
/>
```

The baseline `inputStyle` covers `minHeight: control.height.sm`,
`width: 100%`, `paddingInline: space.sm`, `border: 0.5px border.default`,
`borderRadius: radius.md`, `backgroundColor: surface.lvl0`,
`color: text.primary`, `fontFamily.sans`, `fontSize.sm`,
`lineHeight.normal`, an inner highlight `boxShadow`, and the focus-visible
ring. Therefore:

- The `<input>`'s `mix` block collapses to literally `mix={inputStyle}`.
  All manual border/bg/radius/font/focus/dark-mode rules are deleted.
- The `<textarea>` extends `inputStyle` only with `paddingBlock` (the
  combobox input is single-line and only sets `paddingInline`; a
  multi-line textarea needs vertical breathing room) and `resize: 'vertical'`.
  Same deletions apply.
- `inputStyle` uses `paddingInline: theme.space.sm` (4px) — tighter than
  the example's prior 12px. Adopting the design system's chosen density
  is the consistent move; we don't override it per-element.

### `<button>` → `<Button>` consequences

`<Button>` reads `theme.colors.action.primary.{background,backgroundHover,backgroundActive,foreground,border}`,
`theme.control.height.sm`, `theme.radius.full`, `theme.space.md`,
`theme.fontFamily.sans`, `theme.fontSize.xs`, `theme.fontWeight.medium`,
and `theme.colors.focus.ring` internally. Therefore:

- The entire `mix={[css({...})]}` block on the current `<button>` is
  **deleted**. App code stops referencing `theme.colors.action.primary.*`,
  `theme.colors.action.primary.foreground`, and the focus-ring/hover/dark
  branches on the button — `<Button>` owns all of that.
- Visual change: `<Button>` is a small pill (`radius.full`,
  `control.height.sm` = 28px, `fontSize.xs` = 12px), not the rectangular
  `radius-md` blue button the example shipped before. This is the
  design-system look; we accept it.
- `tone="primary"` selects the primary color set; `type="submit"` and
  `rmx-target="welcome"` pass through (`Button` extends `Props<'button'>`).

## Component migration

### Substitution table

| Old                                                    | New                                                |
| ------------------------------------------------------ | -------------------------------------------------- |
| `var(--color-gray-900)` (text)                         | `theme.colors.text.primary`                        |
| `var(--color-gray-600)` (text)                         | `theme.colors.text.muted`                          |
| `var(--color-gray-400)` (counter text)                 | `theme.colors.text.muted`                          |
| `var(--color-gray-50)` (card bg)                       | `theme.surface.lvl1`                               |
| `var(--color-gray-200)` (card border)                  | `theme.colors.border.subtle`                       |
| `var(--color-blue-600)` (link)                         | `theme.colors.text.link`                           |
| (input border / bg / focus / dark-mode rules)          | n/a — `inputStyle` owns these internally           |
| (button bg / hover / fg, was blue-600/700/white)       | n/a — `<Button tone="primary">` owns these internally |
| `var(--font-sans)`                                     | `theme.fontFamily.sans`                            |
| `var(--text-base)`                                     | `theme.fontSize.md`                                |
| `var(--text-sm)`                                       | `theme.fontSize.sm`                                |
| `var(--text-xs)`                                       | `theme.fontSize.xs`                                |
| `var(--text-xl)`                                       | `theme.fontSize.xl`                                |
| `var(--font-weight-bold/semibold/medium)`              | `theme.fontWeight.bold/semibold/medium`            |
| `var(--radius-md)` / `var(--radius-lg)`                | `theme.radius.md` / `theme.radius.lg`              |
| `var(--tracking-tight)`                                | `theme.letterSpacing.tight`                        |
| `calc(var(--spacing) * 1/2/3/4/6)` (4/8/12/16/24px)    | `theme.space.sm/md/lg/xl/xxl`                      |
| `<html>` bg `var(--color-white)` / dark `gray-950`     | `theme.surface.lvl0`                               |

### Raw literals (contract doesn't reach)

| Old                                          | New (raw literal)                                     |
| -------------------------------------------- | ----------------------------------------------------- |
| `calc(var(--spacing) * 16) calc(* 4)` page padding | `'4rem 1rem'`                                   |
| `var(--text-4xl)` hero size                  | `'2.25rem'`                                           |
| `var(--container-md)` (28rem) section width  | `'28rem'`                                             |
| `var(--container-lg)` (32rem) header width   | `'32rem'`                                             |
| `var(--color-red-500)` / dark `red-400` warning text | `'light-dark(#ef4444, #f87171)'`              |
| `var(--color-blue-800)` / dark `blue-300` link hover | `'light-dark(#1e40af, #93c5fd)'`              |
| logo `calc(var(--spacing) * 10)` height (40px) | `'2.5rem'`                                          |

### Dark-mode collapse

Every `"@media (prefers-color-scheme: dark)": {...}` block in the migrated
files is **deleted**. Tokens that switch are encoded in `light-dark()`;
component code becomes mode-agnostic.

This applies to:
- `Document.tsx` (`<html>` background)
- `Welcome.tsx` (outer container, card bg/border, card text, input, button, link)
- `CharacterCounter.tsx` (textarea, counter text)

### `Document.tsx` `<head>` insertion

Render `<Theme/>` alongside the existing `<title>` / `<link>` / `<script>`
tags, before `<link href={styles} rel="stylesheet" />`. Importing it from
`#/components/Theme.tsx`. Theme tokens take precedence over any default
styling, so order with respect to `index.css` doesn't matter for
correctness — but placing `<Theme/>` first reads naturally as "establish
the design system, then overlay app stylesheets".

## Roll-out

The five affected templates (`default`, `bun`, `cloudflare`,
`service-worker`, `unbundled`) have identical `theme.css` and identical
component source today, so the theme migration is the same text in each.
The folder reorganization differs between groups.

### Common to all 5 templates

1. Delete `app/assets/theme.css`.
2. Add `color-scheme: light dark;` to `preflight.css` (wherever it lives
   for that template).
3. Create `app/components/Theme.tsx` with the `createTheme` call above.
4. Edit `app/components/Document.tsx` — render `<Theme/>` in `<head>`,
   replace the `<html>` background style.
5. Edit `app/components/Welcome.tsx` — apply the substitution table; delete
   dark-mode media queries; use raw literals where listed; replace the
   `<button>` with `<Button tone="primary" type="submit">` from
   `remix/ui/button` (drop its entire `mix` block); apply
   `inputStyle` from `remix/ui/combobox` to the `<input name="name">`
   (replaces its entire `mix` block).
6. Edit `app/components/CharacterCounter.tsx` — apply the substitution
   table to the counter `<p>`; replace the `<textarea>`'s `mix` block
   with `[inputStyle, css({ paddingBlock: theme.space.sm, resize: 'vertical' })]`.

### Additional, only `default` / `bun` / `cloudflare` / `service-worker`

7. Move `app/assets/preflight.css` → `app/styles/preflight.css`.
8. In `app/index.css`, change `@import "./assets/preflight.css"` to
   `@import "./styles/preflight.css"` and drop the now-stale
   `@import "./assets/theme.css"` line.
9. Delete the now-empty `app/assets/` directory.

### `unbundled` — no folder reorganization

7. In `app/assets/index.css`, drop the `@import "./theme.css"` line. The
   `app/assets/` directory stays — `index.css` lives there too,
   intentionally.

`service-worker` differs from the bundler-using templates in that it has
`entry.browser.tsx` (not `.ts`) and `entry.worker.ts`; neither is touched.

## Verification

After applying to each template:

- `pnpm --filter <template> typecheck` (or equivalent) passes — confirms
  the typed token tree resolves correctly.
- Run the dev server, visit the guest book page in light and dark mode
  (toggle OS appearance), confirm:
  - Text, card, border, link, focus-ring colors match prior appearance.
  - Hero size, page padding, section max-widths visually unchanged.
  - Character counter warning text turns red at ≤ 20 remaining and
    adjusts shade between modes.
  - The Sign button renders as the design-system `<Button>` (small pill,
    primary tone). It will look different from the prior rectangular
    blue button — that change is expected. Verify it submits and that
    `rmx-target="welcome"` still routes correctly.
  - The name `<input>` and message `<textarea>` render with the same
    border/radius/focus-ring as a `remix/ui` combobox input. Tighter
    horizontal padding than before — expected.
- Confirm the `<Theme/>` `<style>` tag is present in the rendered HTML.
