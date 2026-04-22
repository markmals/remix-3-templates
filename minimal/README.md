# Remix 3 — Minimal Template

A stripped-down [Remix 3](https://remix.run) starter that runs on Node.js with no database and no bundled middleware. Use this as a clean slate when you want to add only the pieces you need.

| Runtime | Package manager | Database | Toolchain                         |
| ------- | --------------- | -------- | --------------------------------- |
| Node.js | pnpm            | none     | [Vite+](https://vite.plus) (`vp`) |

## Install Vite+

This template uses [Vite+](https://vite.plus) as the canonical toolchain for dev, build, lint, format, test, and task running. Pick one:

```sh
# Official installer
curl -fsSL https://vite.plus/install.sh | sh

# Homebrew
brew install markmals/tap/vite-plus

# Mise
mise plugin add vite-plus https://github.com/markmals/mise-vite-plus.git
mise use -g vite-plus@latest
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
