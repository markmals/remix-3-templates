# Typed theme via `remix/ui` `createTheme` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use ultrapowers:subagent-driven-development (recommended) or ultrapowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace each template's hand-rolled Tailwind-style CSS-variable
theme with `remix/ui`'s typed `createTheme`/`theme`, collapse dark-mode
media queries via `light-dark()`, swap raw `<button>`/`<input>`/`<textarea>`
for the `remix/ui` design-system equivalents, and reorganize CSS files into
`app/styles/` (except in `unbundled`).

**Architecture:** Each template gets a single `Theme` component (rendered
once in `<head>` via `Document`) that defines all design-system token
values using `light-dark()`. Components consume tokens through the typed
`theme` import from `remix/ui`. The submit button becomes
`<Button tone="primary">`; text inputs adopt `inputStyle` from
`remix/ui/combobox`. All `@media (prefers-color-scheme: dark)` blocks in
component code are deleted — color switching happens inside token values.

**Tech Stack:** TypeScript + JSX, `remix@3.0.0-beta.0` (`remix/ui`,
`remix/ui/button`, `remix/ui/combobox`), per-template bundlers (Vite,
Bun, Wrangler, plain Node).

**Spec:** [docs/superpowers/specs/2026-05-03-typed-theme-via-remix-ui-createtheme-design.md](../specs/2026-05-03-typed-theme-via-remix-ui-createtheme-design.md)

**Commits:** The user handles all git commits manually. Each task below is
sized to be one logical commit; do **not** run `git add` or `git commit`.
Stop after each task and let the user commit before moving on.

**Templates affected:** `default`, `bun`, `cloudflare`, `service-worker`,
`unbundled`. (`minimal` is intentionally not touched — it has no theme
files today.)

---

## Per-template file inventory

Filename casing differs between templates. Refer to this table whenever a
task says "edit Welcome.tsx" — apply it to the path that matches the
template's convention.

| Template          | Document file              | Welcome file              | CharacterCounter file                    | New Theme file              |
| ----------------- | -------------------------- | ------------------------- | ---------------------------------------- | --------------------------- |
| `default`         | `app/components/Document.tsx` | `app/components/Welcome.tsx` | `app/components/CharacterCounter.tsx` | `app/components/Theme.tsx` |
| `bun`             | `app/components/Document.tsx` | `app/components/Welcome.tsx` | `app/components/CharacterCounter.tsx` | `app/components/Theme.tsx` |
| `cloudflare`      | `app/components/Document.tsx` | `app/components/Welcome.tsx` | `app/components/CharacterCounter.tsx` | `app/components/Theme.tsx` |
| `service-worker`  | `app/components/Document.tsx` | `app/components/Welcome.tsx` | `app/components/CharacterCounter.tsx` | `app/components/Theme.tsx` |
| `unbundled`       | `app/components/document.tsx` | `app/components/welcome.tsx` | `app/components/character-counter.client.tsx` | `app/components/theme.tsx` |

CSS file layout — *current* state vs *target* state:

| Template          | Current CSS layout                                        | Target CSS layout                                       |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| `default`         | `app/index.css` + `app/assets/{preflight,theme}.css`       | `app/index.css` + `app/styles/preflight.css` (no `assets/`) |
| `bun`             | same as default                                           | same as default                                         |
| `cloudflare`      | same as default                                           | same as default                                         |
| `service-worker`  | same as default                                           | same as default                                         |
| `unbundled`       | `app/assets/{index,preflight,theme}.css`                  | `app/assets/{index,preflight}.css` (no `theme.css`)     |

---

## Task 1: Add `Theme.tsx` in all 5 templates

The Theme module is identical in content across all templates — only the
filename casing differs (capital in 4 templates, lowercase in `unbundled`).

**Files:**
- Create: `default/app/components/Theme.tsx`
- Create: `bun/app/components/Theme.tsx`
- Create: `cloudflare/app/components/Theme.tsx`
- Create: `service-worker/app/components/Theme.tsx`
- Create: `unbundled/app/components/theme.tsx`

- [ ] **Step 1: Write the canonical Theme module to `default/app/components/Theme.tsx`**

```tsx
import { createTheme } from "remix/ui/theme";

export let Theme = createTheme({
    fontFamily: {
        sans: '"Inter var", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    space: {
        none: "0px",
        px: "1px",
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        xxl: "24px",
    },
    radius: {
        none: "0px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
    },
    fontSize: {
        xxxs: "10px",
        xxs: "11px",
        xs: "12px",
        sm: "14px",
        md: "16px",
        lg: "18px",
        xl: "20px",
        xxl: "28px",
    },
    lineHeight: { tight: "1.2", normal: "1.5", relaxed: "1.7" },
    letterSpacing: {
        tight: "-0.025em",
        normal: "0",
        meta: "0.025em",
        wide: "0.05em",
    },
    fontWeight: { normal: "400", medium: "500", semibold: "600", bold: "700" },
    control: { height: { sm: "28px", md: "36px", lg: "44px" } },
    shadow: {
        xs: "0 1px 2px rgb(0 0 0 / 0.05)",
        sm: "0 1px 3px rgb(0 0 0 / 0.10)",
        md: "0 4px 10px rgb(0 0 0 / 0.12)",
        lg: "0 10px 30px rgb(0 0 0 / 0.16)",
        xl: "0 20px 50px rgb(0 0 0 / 0.20)",
    },
    surface: {
        lvl0: "light-dark(#ffffff, #0a0a0a)",
        lvl1: "light-dark(#f9fafb, #111827)",
        lvl2: "light-dark(#f3f4f6, #1f2937)",
        lvl3: "light-dark(#e5e7eb, #374151)",
        lvl4: "light-dark(#d1d5db, #4b5563)",
    },
    colors: {
        text: {
            primary: "light-dark(#111827, #f3f4f6)",
            secondary: "light-dark(#374151, #d1d5db)",
            muted: "light-dark(#6b7280, #9ca3af)",
            link: "light-dark(#2563eb, #60a5fa)",
        },
        border: {
            subtle: "light-dark(#e5e7eb, #1f2937)",
            default: "light-dark(#d1d5db, #374151)",
            strong: "light-dark(#9ca3af, #4b5563)",
        },
        focus: { ring: "light-dark(#3b82f6, #60a5fa)" },
        overlay: { scrim: "rgb(0 0 0 / 0.45)" },
        action: {
            primary: {
                background: "light-dark(#2563eb, #3b82f6)",
                backgroundHover: "light-dark(#1d4ed8, #2563eb)",
                backgroundActive: "light-dark(#1e40af, #1d4ed8)",
                foreground: "#ffffff",
                border: "light-dark(#2563eb, #3b82f6)",
            },
            secondary: {
                background: "light-dark(#ffffff, #18181b)",
                backgroundHover: "light-dark(#f9fafb, #27272a)",
                backgroundActive: "light-dark(#f3f4f6, #3f3f46)",
                foreground: "light-dark(#111827, #f3f4f6)",
                border: "light-dark(#d1d5db, #374151)",
            },
            danger: {
                background: "light-dark(#dc2626, #ef4444)",
                backgroundHover: "light-dark(#b91c1c, #dc2626)",
                backgroundActive: "light-dark(#991b1b, #b91c1c)",
                foreground: "#ffffff",
                border: "light-dark(#dc2626, #ef4444)",
            },
        },
    },
});
```

- [ ] **Step 2: Copy that exact same content to the other 4 paths**

Same content, four destinations:
- `bun/app/components/Theme.tsx`
- `cloudflare/app/components/Theme.tsx`
- `service-worker/app/components/Theme.tsx`
- `unbundled/app/components/theme.tsx` (note lowercase filename to match `unbundled`'s convention)

- [ ] **Step 3: Verify nothing breaks at parse time**

The file is type-self-contained (no other code imports it yet). Open one
of the new files in your editor and confirm there are no syntax errors.
Do not start dev servers yet — `<Theme/>` is not rendered anywhere yet,
so it has no effect.

- [ ] **Step 4: Stop for user commit**

Suggested commit message: `Add Theme component (createTheme) in 5 templates`

---

## Task 2: Add `color-scheme: light dark;` to `preflight.css` in all 5 templates

`light-dark()` only switches values when the document's effective
`color-scheme` includes `dark`. Without this declaration, every
`light-dark()` value resolves to its first (light) argument.

**Files:**
- Modify: `default/app/assets/preflight.css`
- Modify: `bun/app/assets/preflight.css`
- Modify: `cloudflare/app/assets/preflight.css`
- Modify: `service-worker/app/assets/preflight.css`
- Modify: `unbundled/app/assets/preflight.css`

The file currently begins with `@layer base {` and a comment block followed
by a `*, ::after, ::before, ::backdrop, ::file-selector-button` rule. We
add a new rule **inside the existing `@layer base` block**, immediately
after the opening `@layer base {` line and before the existing comment.

- [ ] **Step 1: Insert the `:root` rule in `default/app/assets/preflight.css`**

Find this block at the top of the file:

```css
@layer base {
    /*
      1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
```

Replace with:

```css
@layer base {
    :root {
        color-scheme: light dark;
    }

    /*
      1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)
```

- [ ] **Step 2: Apply the same insert to the other 4 templates' `preflight.css` files**

`bun`, `cloudflare`, `service-worker`, `unbundled` — all have identical
preflight.css content; the same insert applies verbatim.

- [ ] **Step 3: Visually confirm**

Open one of the modified files. The first ~5 lines after `@layer base {`
should now be:

```css
@layer base {
    :root {
        color-scheme: light dark;
    }

    /*
```

- [ ] **Step 4: Stop for user commit**

Suggested commit message: `Declare color-scheme: light dark in preflight.css`

---

## Task 3: Reorganize CSS in `default`, `bun`, `cloudflare`, `service-worker`

For these four templates, move `preflight.css` from `app/assets/` to
`app/styles/`, drop the `theme.css` import, update the `preflight.css`
import path, delete `theme.css`, then delete the now-empty `app/assets/`
directory.

**Files (per template, repeat for all 4):**
- Move: `app/assets/preflight.css` → `app/styles/preflight.css`
- Modify: `app/index.css`
- Delete: `app/assets/theme.css`
- Delete: `app/assets/` (empty after the moves/deletes)

- [ ] **Step 1: For `default`, run the file moves**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/default
mkdir -p app/styles
git mv app/assets/preflight.css app/styles/preflight.css
git rm app/assets/theme.css
rmdir app/assets
```

`git mv` preserves history; `git rm` stages the deletion. `rmdir` will
fail loudly if the directory still has anything in it — that's the
correctness check.

- [ ] **Step 2: For `default`, rewrite `app/index.css`**

The file currently contains:

```css
@import "./assets/preflight.css";
@import "./assets/theme.css";
```

Replace with:

```css
@import "./styles/preflight.css";
```

- [ ] **Step 3: Repeat steps 1–2 for `bun`**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/bun
mkdir -p app/styles
git mv app/assets/preflight.css app/styles/preflight.css
git rm app/assets/theme.css
rmdir app/assets
```

Then rewrite `bun/app/index.css` to the same single-import content shown in
Step 2.

- [ ] **Step 4: Repeat steps 1–2 for `cloudflare`**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/cloudflare
mkdir -p app/styles
git mv app/assets/preflight.css app/styles/preflight.css
git rm app/assets/theme.css
rmdir app/assets
```

Then rewrite `cloudflare/app/index.css` to the same single-import content.

- [ ] **Step 5: Repeat steps 1–2 for `service-worker`**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/service-worker
mkdir -p app/styles
git mv app/assets/preflight.css app/styles/preflight.css
git rm app/assets/theme.css
rmdir app/assets
```

Then rewrite `service-worker/app/index.css` to the same single-import
content.

- [ ] **Step 6: Verify**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates
ls default/app/assets bun/app/assets cloudflare/app/assets service-worker/app/assets 2>&1 | head
```

Expected: `ls: …/assets: No such file or directory` for all four.

```bash
ls default/app/styles bun/app/styles cloudflare/app/styles service-worker/app/styles
```

Expected: each lists `preflight.css`.

- [ ] **Step 7: Stop for user commit**

Suggested commit message: `Move preflight.css to app/styles, remove theme.css (default/bun/cloudflare/service-worker)`

---

## Task 4: Reorganize CSS in `unbundled`

`unbundled` keeps its `app/assets/` directory because `index.css` lives
inside it (the unbundled template loads it via `routes.assets.href(...)`,
not via a Vite-style `?url` import). We only delete `theme.css` and drop
its import from `app/assets/index.css`.

**Files:**
- Modify: `unbundled/app/assets/index.css`
- Delete: `unbundled/app/assets/theme.css`

- [ ] **Step 1: Delete `theme.css`**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/unbundled
git rm app/assets/theme.css
```

- [ ] **Step 2: Rewrite `unbundled/app/assets/index.css`**

Current content:

```css
@import "./preflight.css";
@import "./theme.css";
```

Replace with:

```css
@import "./preflight.css";
```

- [ ] **Step 3: Verify the directory still has the right files**

```bash
ls unbundled/app/assets
```

Expected: `index.css  preflight.css` (no `theme.css`).

- [ ] **Step 4: Stop for user commit**

Suggested commit message: `Remove theme.css from unbundled template`

---

## Task 5: Update `Document.tsx` in `default`, `bun`, `cloudflare`

These three templates have **identical** `Document.tsx`. The change adds
`<Theme/>` to `<head>`, swaps the dark-mode-media-queried `<html>`
background for `theme.surface.lvl0`.

**Files:**
- Modify: `default/app/components/Document.tsx`
- Modify: `bun/app/components/Document.tsx`
- Modify: `cloudflare/app/components/Document.tsx`

- [ ] **Step 1: Replace `default/app/components/Document.tsx` with this exact content**

```tsx
import { Theme } from "#/components/Theme.tsx";
import clientAssets from "#/entry.browser.ts?assets=client";
import serverAssets from "#/entry.server.tsx?assets=ssr";
import styles from "#/index.css?url";
import { mergeAssets } from "@hiogawa/vite-plugin-fullstack/runtime";
import { getContext } from "remix/async-context-middleware";
import { Frame, css } from "remix/ui";
import { theme } from "remix/ui/theme";

export function Document() {
    let { url } = getContext();
    let assets = mergeAssets(clientAssets, serverAssets);

    return () => (
        <html
            lang="en"
            mix={css({
                backgroundColor: theme.surface.lvl0,
            })}
        >
            <head>
                <meta charSet="utf-8" />
                <meta content="width=device-width, initial-scale=1" name="viewport" />
                <title>New Remix App</title>

                <link href="/favicon.ico" rel="icon" sizes="32x32" type="image/x-icon" />
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />

                <Theme />
                <link href={styles} rel="stylesheet" />
                {assets.css.map(attrs => (
                    <link key={attrs.href} {...attrs} rel="stylesheet" />
                ))}

                <script async src={clientAssets.entry} type="module" />
                {assets.js.map(attrs => (
                    <link key={attrs.href} {...attrs} rel="modulepreload" />
                ))}
            </head>
            <body>
                <Frame name="welcome" src={url.toString()} />
            </body>
        </html>
    );
}
```

- [ ] **Step 2: Apply the same content to `bun/app/components/Document.tsx`**

Identical bytes — copy the file or repeat the rewrite.

- [ ] **Step 3: Apply the same content to `cloudflare/app/components/Document.tsx`**

Identical bytes.

- [ ] **Step 4: Stop for user commit**

Suggested commit message: `Render Theme in Document head (default/bun/cloudflare)`

---

## Task 6: Update `Document.tsx` in `service-worker`

`service-worker`'s `Document.tsx` has a different baseline — it imports
`styles` and `entry` directly via `?url` instead of using `mergeAssets`,
and its render function takes `{ url }` as a prop rather than reading from
`getContext()`.

**Files:**
- Modify: `service-worker/app/components/Document.tsx`

- [ ] **Step 1: Replace `service-worker/app/components/Document.tsx` with this exact content**

```tsx
import { Theme } from "#/components/Theme.tsx";
import entry from "#/entry.browser.tsx?url";
import styles from "#/index.css?url";
import { Frame, css } from "remix/ui";
import { theme } from "remix/ui/theme";

export function Document() {
    return ({ url }: { url: URL }) => (
        <html
            lang="en"
            mix={css({
                backgroundColor: theme.surface.lvl0,
            })}
        >
            <head>
                <meta charSet="utf-8" />
                <meta content="width=device-width, initial-scale=1" name="viewport" />
                <title>New Remix App</title>

                <link href="/favicon.ico" rel="icon" sizes="32x32" type="image/x-icon" />
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />

                <Theme />
                <link href={styles} rel="stylesheet" />
                <script async src={entry} type="module" />
            </head>
            <body>
                <Frame name="welcome" src={url.toString()} />
            </body>
        </html>
    );
}
```

- [ ] **Step 2: Stop for user commit**

Suggested commit message: `Render Theme in Document head (service-worker)`

---

## Task 7: Update `document.tsx` in `unbundled`

`unbundled` uses lowercase filenames; its `document.tsx` references
stylesheets via `routes.assets.href(...)` (no Vite `?url` resolver). The
shape of the change is the same: add `<Theme/>`, replace the `<html>`
background.

**Files:**
- Modify: `unbundled/app/components/document.tsx`

- [ ] **Step 1: Replace `unbundled/app/components/document.tsx` with this exact content**

```tsx
import { Theme } from "#/components/theme.tsx";
import { routes } from "#/routes.ts";
import { getContext } from "remix/async-context-middleware";
import { Frame, css } from "remix/ui";
import { theme } from "remix/ui/theme";

export function Document() {
    let { url } = getContext();

    return () => (
        <html
            lang="en"
            mix={css({
                backgroundColor: theme.surface.lvl0,
            })}
        >
            <head>
                <meta charSet="utf-8" />
                <meta content="width=device-width, initial-scale=1" name="viewport" />
                <title>New Remix App</title>

                <link href="/favicon.ico" rel="icon" sizes="32x32" type="image/x-icon" />
                <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />

                <Theme />
                <link
                    href={routes.assets.href({ path: "app/assets/index.css" })}
                    rel="stylesheet"
                />

                <script
                    async
                    src={routes.assets.href({ path: "app/entry.browser.ts" })}
                    type="module"
                />
            </head>
            <body>
                <Frame name="welcome" src={url.toString()} />
            </body>
        </html>
    );
}
```

- [ ] **Step 2: Stop for user commit**

Suggested commit message: `Render Theme in document head (unbundled)`

---

## Task 8: Update `Welcome.tsx` in `default`, `bun`, `cloudflare`, `service-worker`

`default`, `bun`, `cloudflare` have identical `Welcome.tsx`. `service-worker` differs in one spot only: it sorts `props.entries` by `createdAt` before rendering (because service-worker storage doesn't return them in order). After the rewrite, `service-worker`'s entries-list section must keep that sort applied. The rewrite otherwise:

- Replaces every `var(--…)` with the corresponding `theme.*` token (or
  raw literal where the contract doesn't reach: page padding `'4rem 1rem'`,
  hero `'2.25rem'`, max-widths `'28rem'`/`'32rem'`, logo height
  `'2.5rem'`, the 32px/48px `marginTop`s as `'2rem'`/`'3rem'`, link hover
  `'light-dark(#1e40af, #93c5fd)'`).
- Deletes every `@media (prefers-color-scheme: dark)` block — `light-dark()`
  in token values handles it.
- Replaces the `<input>`'s `mix` block with `mix={inputStyle}` (imported
  from `remix/ui/combobox`).
- Replaces the `<button>` with `<Button tone="primary" type="submit">`
  imported from `remix/ui/button`, dropping its entire `mix` block. The
  `rmx-target="welcome"` attribute passes through.

**Files:**
- Modify: `default/app/components/Welcome.tsx`
- Modify: `bun/app/components/Welcome.tsx`
- Modify: `cloudflare/app/components/Welcome.tsx`
- Modify: `service-worker/app/components/Welcome.tsx`

- [ ] **Step 1: Replace `default/app/components/Welcome.tsx` with this exact content**

```tsx
import type { GuestBookEntry } from "#/data/schemas.ts";

import { CharacterCounter } from "#/components/CharacterCounter.tsx";
import { routes } from "#/routes.ts";
import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { Button } from "remix/ui/button";
import { inputStyle } from "remix/ui/combobox";

export function Welcome() {
    return (props: { entries: GuestBookEntry[] }) => (
        <div
            mix={[
                css({
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minHeight: "100vh",
                    fontFamily: theme.fontFamily.sans,
                    color: theme.colors.text.primary,
                    padding: "4rem 1rem",
                }),
            ]}
        >
            <header
                mix={[
                    css({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: theme.space.xl,
                        maxWidth: "32rem",
                    }),
                ]}
            >
                <picture>
                    <source media="(prefers-color-scheme: dark)" srcSet="/remix-3-logo-dark.svg" />
                    <img
                        alt="Remix 3"
                        mix={[css({ height: "2.5rem" })]}
                        src="/remix-3-logo-light.svg"
                    />
                </picture>
                <h1
                    mix={[
                        css({
                            fontSize: "2.25rem",
                            fontWeight: theme.fontWeight.bold,
                            letterSpacing: theme.letterSpacing.tight,
                        }),
                    ]}
                >
                    Welcome to Remix 3
                </h1>
            </header>

            <nav
                mix={[
                    css({
                        display: "flex",
                        gap: theme.space.xxl,
                        marginTop: "2rem",
                    }),
                ]}
            >
                <ResourceLink href="https://github.com/remix-run/remix" label="GitHub" />
                <ResourceLink href="https://discord.gg/xwx7mMzVkA" label="Discord" />
            </nav>

            <section
                mix={[
                    css({
                        marginTop: "3rem",
                        width: "100%",
                        maxWidth: "28rem",
                    }),
                ]}
            >
                <h2
                    mix={[
                        css({
                            fontSize: theme.fontSize.xl,
                            fontWeight: theme.fontWeight.semibold,
                            marginBottom: theme.space.xl,
                        }),
                    ]}
                >
                    Guest Book
                </h2>

                {props.entries.length > 0 && (
                    <ul
                        mix={[
                            css({
                                display: "flex",
                                flexDirection: "column",
                                gap: theme.space.lg,
                                marginBottom: theme.space.xxl,
                            }),
                        ]}
                    >
                        {props.entries.map(entry => (
                            <li
                                key={entry.id}
                                mix={[
                                    css({
                                        padding: theme.space.lg,
                                        borderRadius: theme.radius.lg,
                                        backgroundColor: theme.surface.lvl1,
                                        border: `1px solid ${theme.colors.border.subtle}`,
                                    }),
                                ]}
                            >
                                <p
                                    mix={[
                                        css({
                                            fontWeight: theme.fontWeight.medium,
                                            color: theme.colors.text.primary,
                                        }),
                                    ]}
                                >
                                    {entry.name}
                                </p>
                                <p
                                    mix={[
                                        css({
                                            color: theme.colors.text.muted,
                                            fontSize: theme.fontSize.sm,
                                            marginTop: theme.space.sm,
                                        }),
                                    ]}
                                >
                                    {entry.message}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                <form
                    action={routes.guestBook.action.href()}
                    method={routes.guestBook.action.method}
                    mix={[
                        css({
                            display: "flex",
                            flexDirection: "column",
                            gap: theme.space.lg,
                        }),
                    ]}
                >
                    <input
                        mix={inputStyle}
                        name="name"
                        placeholder="Your name"
                        required
                    />
                    <CharacterCounter />
                    <Button rmx-target="welcome" tone="primary" type="submit">
                        Sign
                    </Button>
                </form>
            </section>
        </div>
    );
}

function ResourceLink() {
    return (props: { href: string; label: string }) => (
        <a
            href={props.href}
            target="_blank"
            mix={[
                css({
                    color: theme.colors.text.link,
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.medium,
                    "&:hover": {
                        color: "light-dark(#1e40af, #93c5fd)",
                    },
                }),
            ]}
        >
            {props.label}
        </a>
    );
}
```

- [ ] **Step 2: Apply the same content to `bun/app/components/Welcome.tsx`**

Identical bytes.

- [ ] **Step 3: Apply the same content to `cloudflare/app/components/Welcome.tsx`**

Identical bytes.

- [ ] **Step 4: Apply the same content to `service-worker/app/components/Welcome.tsx`**

Identical bytes.

- [ ] **Step 5: Stop for user commit**

Suggested commit message: `Migrate Welcome to typed theme and design-system components (default/bun/cloudflare/service-worker)`

---

## Task 9: Update `welcome.tsx` in `unbundled`

`unbundled`'s `welcome.tsx` differs from the canonical version in two
spots: it imports `CharacterCounter` from
`#/components/character-counter.client.tsx` (kebab-case + `.client`
suffix), and the `<a>` in `ResourceLink` keeps `target="_blank"` as the
last attribute (its current ordering puts `mix` before `target`). The
body of the rewrite is otherwise identical to Task 8's content.

**Files:**
- Modify: `unbundled/app/components/welcome.tsx`

- [ ] **Step 1: Replace `unbundled/app/components/welcome.tsx` with this exact content**

```tsx
import type { GuestBookEntry } from "#/data/schemas.ts";

import { CharacterCounter } from "#/components/character-counter.client.tsx";
import { routes } from "#/routes.ts";
import { css } from "remix/ui";
import { theme } from "remix/ui/theme";
import { Button } from "remix/ui/button";
import { inputStyle } from "remix/ui/combobox";

export function Welcome() {
    return (props: { entries: GuestBookEntry[] }) => (
        <div
            mix={[
                css({
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minHeight: "100vh",
                    fontFamily: theme.fontFamily.sans,
                    color: theme.colors.text.primary,
                    padding: "4rem 1rem",
                }),
            ]}
        >
            <header
                mix={[
                    css({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: theme.space.xl,
                        maxWidth: "32rem",
                    }),
                ]}
            >
                <picture>
                    <source media="(prefers-color-scheme: dark)" srcSet="/remix-3-logo-dark.svg" />
                    <img
                        alt="Remix 3"
                        mix={[css({ height: "2.5rem" })]}
                        src="/remix-3-logo-light.svg"
                    />
                </picture>
                <h1
                    mix={[
                        css({
                            fontSize: "2.25rem",
                            fontWeight: theme.fontWeight.bold,
                            letterSpacing: theme.letterSpacing.tight,
                        }),
                    ]}
                >
                    Welcome to Remix 3
                </h1>
            </header>

            <nav
                mix={[
                    css({
                        display: "flex",
                        gap: theme.space.xxl,
                        marginTop: "2rem",
                    }),
                ]}
            >
                <ResourceLink href="https://github.com/remix-run/remix" label="GitHub" />
                <ResourceLink href="https://discord.gg/xwx7mMzVkA" label="Discord" />
            </nav>

            <section
                mix={[
                    css({
                        marginTop: "3rem",
                        width: "100%",
                        maxWidth: "28rem",
                    }),
                ]}
            >
                <h2
                    mix={[
                        css({
                            fontSize: theme.fontSize.xl,
                            fontWeight: theme.fontWeight.semibold,
                            marginBottom: theme.space.xl,
                        }),
                    ]}
                >
                    Guest Book
                </h2>

                {props.entries.length > 0 && (
                    <ul
                        mix={[
                            css({
                                display: "flex",
                                flexDirection: "column",
                                gap: theme.space.lg,
                                marginBottom: theme.space.xxl,
                            }),
                        ]}
                    >
                        {props.entries.map(entry => (
                            <li
                                key={entry.id}
                                mix={[
                                    css({
                                        padding: theme.space.lg,
                                        borderRadius: theme.radius.lg,
                                        backgroundColor: theme.surface.lvl1,
                                        border: `1px solid ${theme.colors.border.subtle}`,
                                    }),
                                ]}
                            >
                                <p
                                    mix={[
                                        css({
                                            fontWeight: theme.fontWeight.medium,
                                            color: theme.colors.text.primary,
                                        }),
                                    ]}
                                >
                                    {entry.name}
                                </p>
                                <p
                                    mix={[
                                        css({
                                            color: theme.colors.text.muted,
                                            fontSize: theme.fontSize.sm,
                                            marginTop: theme.space.sm,
                                        }),
                                    ]}
                                >
                                    {entry.message}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}

                <form
                    action={routes.guestBook.action.href()}
                    method={routes.guestBook.action.method}
                    mix={[
                        css({
                            display: "flex",
                            flexDirection: "column",
                            gap: theme.space.lg,
                        }),
                    ]}
                >
                    <input
                        mix={inputStyle}
                        name="name"
                        placeholder="Your name"
                        required
                    />
                    <CharacterCounter />
                    <Button rmx-target="welcome" tone="primary" type="submit">
                        Sign
                    </Button>
                </form>
            </section>
        </div>
    );
}

function ResourceLink() {
    return (props: { href: string; label: string }) => (
        <a
            href={props.href}
            mix={[
                css({
                    color: theme.colors.text.link,
                    fontSize: theme.fontSize.md,
                    fontWeight: theme.fontWeight.medium,
                    "&:hover": {
                        color: "light-dark(#1e40af, #93c5fd)",
                    },
                }),
            ]}
            target="_blank"
        >
            {props.label}
        </a>
    );
}
```

(The only meaningful difference from Task 8 is the `CharacterCounter`
import path and the attribute order on the `<a>`.)

- [ ] **Step 2: Stop for user commit**

Suggested commit message: `Migrate welcome to typed theme and design-system components (unbundled)`

---

## Task 10: Update `CharacterCounter.tsx` in `default`, `bun`, `cloudflare`, `service-worker`

These four templates have identical `CharacterCounter.tsx`. The rewrite
adopts `inputStyle` for the `<textarea>` (with a small extension for
`paddingBlock` and `resize: 'vertical'`), replaces `var(--…)` with theme
tokens, and deletes the dark-mode media queries. The warning text color
becomes a raw `light-dark()` literal — the contract has no
`text.warning`/`text.danger` slot.

**Files:**
- Modify: `default/app/components/CharacterCounter.tsx`
- Modify: `bun/app/components/CharacterCounter.tsx`
- Modify: `cloudflare/app/components/CharacterCounter.tsx`
- Modify: `service-worker/app/components/CharacterCounter.tsx`

- [ ] **Step 1: Replace `default/app/components/CharacterCounter.tsx` with this exact content**

```tsx
import { clientEntry, css, on } from "remix/ui";
import { theme } from "remix/ui/theme";
import { inputStyle } from "remix/ui/combobox";

const MAX_LENGTH = 280;

export let CharacterCounter = clientEntry(import.meta.url, handle => {
    let count = 0;

    return () => {
        let remaining = MAX_LENGTH - count;

        return (
            <div
                mix={[
                    css({
                        display: "flex",
                        flexDirection: "column",
                        gap: theme.space.sm,
                    }),
                ]}
            >
                <textarea
                    maxLength={MAX_LENGTH}
                    mix={[
                        on("input", event => {
                            count = event.currentTarget.value.length;
                            handle.update();
                        }),
                        inputStyle,
                        css({
                            paddingBlock: theme.space.sm,
                            resize: "vertical",
                        }),
                    ]}
                    name="message"
                    placeholder="Leave a message..."
                    required
                    rows={3}
                />
                <p
                    data-warning={remaining <= 20 ? "" : undefined}
                    mix={[
                        css({
                            fontSize: theme.fontSize.xs,
                            color: theme.colors.text.muted,
                            textAlign: "right",
                            "&[data-warning]": {
                                color: "light-dark(#ef4444, #f87171)",
                            },
                        }),
                    ]}
                >
                    {remaining} / {MAX_LENGTH}
                </p>
            </div>
        );
    };
});
```

- [ ] **Step 2: Apply the same content to `bun/app/components/CharacterCounter.tsx`**

Identical bytes.

- [ ] **Step 3: Apply the same content to `cloudflare/app/components/CharacterCounter.tsx`**

Identical bytes.

- [ ] **Step 4: Apply the same content to `service-worker/app/components/CharacterCounter.tsx`**

Identical bytes.

- [ ] **Step 5: Stop for user commit**

Suggested commit message: `Migrate CharacterCounter to typed theme and inputStyle (default/bun/cloudflare/service-worker)`

---

## Task 11: Update `character-counter.client.tsx` in `unbundled`

`unbundled`'s version uses a named function with an explicit `Handle`
type annotation rather than the arrow form. We preserve that style and
apply the same rewrite as Task 10.

**Files:**
- Modify: `unbundled/app/components/character-counter.client.tsx`

- [ ] **Step 1: Replace `unbundled/app/components/character-counter.client.tsx` with this exact content**

```tsx
import { Handle } from "remix/ui";
import { clientEntry, css, on } from "remix/ui";
import { theme } from "remix/ui/theme";
import { inputStyle } from "remix/ui/combobox";

const MAX_LENGTH = 280;

export let CharacterCounter = clientEntry(
    import.meta.url,
    function CharacterCounter(handle: Handle) {
        let count = 0;

        return () => {
            let remaining = MAX_LENGTH - count;

            return (
                <div
                    mix={[
                        css({
                            display: "flex",
                            flexDirection: "column",
                            gap: theme.space.sm,
                        }),
                    ]}
                >
                    <textarea
                        maxLength={MAX_LENGTH}
                        mix={[
                            on("input", event => {
                                count = event.currentTarget.value.length;
                                handle.update();
                            }),
                            inputStyle,
                            css({
                                paddingBlock: theme.space.sm,
                                resize: "vertical",
                            }),
                        ]}
                        name="message"
                        placeholder="Leave a message..."
                        required
                        rows={3}
                    />
                    <p
                        data-warning={remaining <= 20 ? "" : undefined}
                        mix={[
                            css({
                                fontSize: theme.fontSize.xs,
                                color: theme.colors.text.muted,
                                textAlign: "right",
                                "&[data-warning]": {
                                    color: "light-dark(#ef4444, #f87171)",
                                },
                            }),
                        ]}
                    >
                        {remaining} / {MAX_LENGTH}
                    </p>
                </div>
            );
        };
    },
);
```

- [ ] **Step 2: Stop for user commit**

Suggested commit message: `Migrate character-counter to typed theme and inputStyle (unbundled)`

---

## Task 12: Per-template smoke verification

There are no automated tests in these templates — verification is dev
server + visual sanity check. Run each template and confirm the same
checklist.

**Per-template invocations** (run these from the template's directory):

| Template          | Dev command                                                      | Notes                                       |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------------- |
| `default`         | `pnpm exec vite`                                                 |                                             |
| `bun`             | `bun run --bun vite`                                             | Uses Bun's vite runtime                     |
| `cloudflare`      | `pnpm exec vite`                                                 |                                             |
| `service-worker`  | `pnpm exec vite`                                                 |                                             |
| `unbundled`       | `pnpm dev` (defined as `node --watch ... server.ts`)             | Has a real `dev` script                     |

If a template's dev command differs in your environment, use what
actually starts that template.

- [ ] **Step 1: Verify `default`**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/default
pnpm exec vite
```

Open the printed URL (typically <http://localhost:5173>). Confirm:

1. The page loads with no console errors.
2. View page source: there is exactly one `<style>` tag whose contents
   include `--rmx-color-text-primary` and other `--rmx-*` declarations.
   That's the `<Theme/>` output.
3. Inspect the `<html>` element — `color-scheme` should resolve to
   `light dark` (via the `:root` rule in `preflight.css`).
4. Visual checks in light mode (system appearance = Light):
   - Body background is white; text is near-black; the guest-book card has
     a very light gray background with a subtle border.
   - The "GitHub" / "Discord" links are blue; hover slightly darker blue.
   - The name input and message textarea have rounded borders that match
     a `remix/ui` combobox input — thin gray border, white background,
     soft inner highlight, blue 2px focus ring with no offset. Horizontal
     padding is tighter (4px) than the prior 12px — expected.
   - The Sign button is a small **pill** (not rectangular), blue
     background, white text — visibly the design-system `<Button>`.
5. Toggle the OS to dark appearance and reload (Safari/Chrome respect
   the system setting if `color-scheme: light dark` is in effect).
   Confirm:
   - Background goes near-black; text goes near-white.
   - Card background goes dark gray; borders darken.
   - Inputs swap to dark backgrounds with the same border treatment.
   - Sign button stays primary blue (lighter shade in dark mode).
6. Type into the message textarea. Counter at lower-right ticks down.
   With ≤ 20 remaining, the counter text turns red (lighter red in dark
   mode).
7. Submit the form. Verify the new entry appears in the guest-book list
   above. (`rmx-target="welcome"` still routes to the welcome frame.)

Stop the dev server.

- [ ] **Step 2: Verify `bun`**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/bun
bun run --bun vite
```

Repeat the visual checklist from Step 1.

- [ ] **Step 3: Verify `cloudflare`**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/cloudflare
pnpm exec vite
```

Repeat the visual checklist.

- [ ] **Step 4: Verify `service-worker`**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/service-worker
pnpm exec vite
```

Repeat the visual checklist.

- [ ] **Step 5: Verify `unbundled`**

```bash
cd /Users/orion/Developer/Templates/remix-3-templates/unbundled
pnpm dev
```

The `unbundled` template has a real `dev` script and a `typecheck`
script. Also run:

```bash
pnpm typecheck
```

Expected: no errors. (This catches issues with the new `theme` /
`inputStyle` / `Button` imports.)

Repeat the visual checklist.

- [ ] **Step 6: Final cleanup check**

After all five templates pass:

```bash
cd /Users/orion/Developer/Templates/remix-3-templates
find . -name theme.css -not -path '*/node_modules/*'
```

Expected: no output (all `theme.css` files deleted).

```bash
ls default/app/assets bun/app/assets cloudflare/app/assets service-worker/app/assets 2>&1
```

Expected: four "No such file or directory" lines.

```bash
ls unbundled/app/assets
```

Expected: `index.css preflight.css` (no `theme.css`).

- [ ] **Step 7: Stop for user commit (if anything was tweaked during verification)**

If verification surfaced any small fixes, commit them now with a clear
message describing the fix. Otherwise, the implementation is complete.
