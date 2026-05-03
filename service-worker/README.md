# Remix 3 — Browser Template

A [Remix 3](https://remix.run) starter that runs entirely in the browser. The Remix fetch router lives inside a Service Worker, and data is persisted locally with [`idb-keyval`](https://github.com/jakearchibald/idb-keyval).

| Runtime        | Package manager | Database     | Toolchain                            |
| -------------- | --------------- | ------------ | ------------------------------------ |
| Service Worker | pnpm            | `idb-keyval` | [Vite+](https://viteplus.dev) (`vp`) |

There is no Node.js server — once built, this template deploys as pure static files.

## Install Vite+

This template uses [Vite+](https://viteplus.dev) as the canonical toolchain for dev, build, lint, format, test, and task running. Pick one:

```sh
# Unix script
curl -fsSL https://vite.plus | bash

# Homebrew
brew install vite-plus

# Powershell
irm https://vite.plus/ps1 | iex
```

## Getting Started

```sh
vp install # install dependencies
vp dev     # start the dev server
```

The dev server sets `Service-Worker-Allowed: /` so the Service Worker can control the whole origin.

## Commands

```sh
vp dev              # dev server
vp build            # production build (static files in dist/)
vp preview          # serve the production build
vp check            # format, lint, and type-check
vp run typecheck    # typecheck using tsgo
```

## Deploy

`vp build` emits a fully static site. Upload `dist/` to any static host (Cloudflare Pages, Netlify, S3, GitHub Pages, etc.) — just make sure the host serves the Service Worker with `Service-Worker-Allowed: /` if the worker is scoped above its own path.
