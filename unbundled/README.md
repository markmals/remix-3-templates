# Remix 3 — Unbundled Template

A [Remix 3](https://remix.run) starter that runs TypeScript directly on Node.js
with no bundler. Server modules are loaded by
[`@oxc-node/core`](https://github.com/oxc-project/oxc-node); browser modules
are transformed and served on demand by `remix/assets`.

| Runtime | Package manager | Database      | Toolchain                                                                                        |
| ------- | --------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| Node.js | pnpm            | `node:sqlite` | [Oxc](https://oxc.rs/) (`oxc-transform` via `remix/assets`, `@oxc-node/core`, `oxfmt`, `oxlint`) |

## Getting Started

```sh
pnpm install
pnpm run db:migrate   # create and migrate the SQLite database
pnpm run dev          # start the dev server
```

The dev server reads `DATABASE_URL` (and any other env vars) from
[.env](./.env) (defaults to `db/data.db`).

## Commands

```sh
pnpm run dev          # dev server with --watch
pnpm run start        # production-mode server (NODE_ENV=production)
pnpm run db:migrate   # apply pending migrations
pnpm run db:reset     # delete the local database
pnpm run fmt          # format with Oxfmt
pnpm run lint         # lint with Oxlint
pnpm run check        # check formatting, linting, and typechecking
pnpm run check:fix    # format, lint, and typecheck
pnpm run typecheck    # tsgo --noEmit
```

## How It Works

There is no `vite.config.ts`, no build step, and no `dist/` output.

- `server.ts` is started directly with
  `node --import @oxc-node/core/register server.ts`. The loader transforms server-side
  TypeScript and TSX on import.
- `app/entry.server.tsx` configures `createRouter` and a `createAssetServer`
  from `remix/assets`. The asset server transforms files under `app/` and
  `node_modules/` on demand and serves them at `/assets/*path`.
- `app/components/document.tsx` references the browser entry and CSS via
  `routes.assets.href({ path: "..." })`, which the asset server resolves at
  runtime.
