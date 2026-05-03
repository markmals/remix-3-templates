# Remix 3 — Minimal Template

A stripped-down [Remix 3](https://remix.run) starter that runs on Node.js with no database and no bundled middleware. Use this as a clean slate when you want to add only the pieces you need.

| Runtime | Package manager | Database | Toolchain                            |
| ------- | --------------- | -------- | ------------------------------------ |
| Node.js | pnpm            | none     | [Vite+](https://viteplus.dev) (`vp`) |

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

## Commands

```sh
vp dev              # dev server (runs db:migrate first)
vp build            # production build
vp preview          # serve the production build
vp check            # format, lint, and type-check
```
