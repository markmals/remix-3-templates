# Remix 3 — Bun Template

A [Remix 3](https://remix.run) starter that runs on [Bun](https://bun.com) with [`Bun.SQL`](https://bun.com/docs/api/sql) for the database.

| Runtime | Package manager | Database  | Toolchain                         |
| ------- | --------------- | --------- | --------------------------------- |
| Bun     | Bun             | `Bun.SQL` | [Vite+](https://vite.plus) (`vp`) |

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

You will also need [Bun](https://bun.com/docs/installation) installed.

## Getting Started

```sh
vp install        # install dependencies via Bun
vp run db:migrate # create and migrate the SQLite database
vp dev            # start the dev server
```

The dev server reads `DATABASE_URL` from [.env](./.env) (defaults to `sqlite://db/data.db`).

## Commands

```sh
vp dev              # dev server (runs db:migrate first)
vp build            # production build
vp preview          # serve the production build
vp check            # format, lint, and type-check
vp run db:migrate   # apply pending migrations
vp run db:reset     # delete the local database
vp run typecheck    # typecheck using tsgo
```

To run the built server directly with Bun:

```sh
bun run server.ts
```

## Notes

The `postinstall` script symlinks `@voidzero-dev/vite-plus-core` as `vite` inside `node_modules` so Bun resolves the Vite+ core package where packages expect plain `vite`.
