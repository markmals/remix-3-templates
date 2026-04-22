# Remix 3 — Cloudflare Template

A [Remix 3](https://remix.run) starter that deploys to [Cloudflare Workers](https://developers.cloudflare.com/workers/) with a [D1](https://developers.cloudflare.com/d1/) database.

| Runtime            | Package manager | Database     | Toolchain                         |
| ------------------ | --------------- | ------------ | --------------------------------- |
| Cloudflare Workers | pnpm            | `D1Database` | [Vite+](https://vite.plus) (`vp`) |

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

You will also need a [Cloudflare account](https://dash.cloudflare.com/sign-up) to deploy. Local development works without one.

## Getting Started

```sh
vp install        # install dependencies
vp run db:migrate # create and migrate the local D1 database
vp dev            # start the dev server (runs typegen + db:migrate first)
```

## Commands

```sh
vp dev              # dev server (runs typegen and db:migrate first)
vp build            # production build
vp preview          # serve the production build
vp check            # format, lint, and type-check
vp run db:migrate   # apply pending migrations to local D1
vp run db:reset     # remove the local D1 state
vp run typegen      # regenerate worker-configuration.d.ts from wrangler.jsonc
vp run typecheck    # typecheck using tsgo
```

## Deploy

```sh
vp build
vpx wrangler deploy
```

Before deploying, create a D1 database and update [wrangler.jsonc](./wrangler.jsonc) with its `database_id`:

```sh
vpx wrangler d1 create remix-3-cloudflare-db
vpx wrangler d1 migrations apply remix-3-cloudflare-db --remote
```
