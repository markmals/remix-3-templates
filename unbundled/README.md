# Remix 3 — Unbundled Template

A [Remix 3](https://remix.run) starter that runs TypeScript directly on Node.js
with no bundler. Server modules are loaded by
[`remix/node-tsx`](https://api.remix.run/api/remix/node-tsx/overview); browser modules
are transformed and served on demand by [`remix/assets`](https://api.remix.run/api/remix/assets/overview).

| Runtime | Package manager | Database      | Toolchain                                                                                         |
| ------- | --------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| Node.js | pnpm            | `node:sqlite` | [Oxc](https://oxc.rs/) (`oxc-transform` via `remix/assets` & `remix/node-tsx`, `oxfmt`, `oxlint`) |

## Getting Started

```sh
pnpm install
node --run db:migrate   # create and migrate the SQLite database
node --run dev          # start the dev server
```

The dev server reads `DATABASE_URL` (and any other env vars) from
[.env](./.env) (defaults to `db/data.db`).

## Commands

```sh
node --run dev          # dev server with --watch
node --run start        # production-mode server (NODE_ENV=production)
node --run db:migrate   # apply pending migrations
node --run db:reset     # delete the local database
node --run fmt          # format with Oxfmt
node --run lint         # lint with Oxlint
node --run check        # check formatting, linting, and typechecking
node --run check:fix    # format, lint, and typecheck
node --run typecheck    # tsc
```

## How It Works

There is no `vite.config.ts`, no build step, and no `dist/` output.

- `server.ts` is started directly with
  `node --import remix/node-tsx server.ts`. The `remix/node-tsx` loader transforms server-side
  TypeScript and TSX on import.
- `app/router.tsx` configures `createRouter` and a `createAssetServer`
  from `remix/assets`. The asset server transforms files under `app/` and
  `node_modules/` on demand and serves them at `/assets/*path`.
- `app/components/document.tsx` references the browser entry and CSS via
  `routes.assets.href({ path: "..." })`, which the asset server resolves at
  runtime.
