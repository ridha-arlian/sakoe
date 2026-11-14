# Sakoe

A single-page donation site. Visitors pick an amount, pay through Midtrans Snap, and see the transaction result. Donations are stored in Cloudflare D1 and the app runs on Cloudflare Workers.

## Stack

- Nuxt 4 (Vue 3, Vue Router 5, Vite 8)
- Tailwind CSS 4 + shadcn-vue (reka-ui)
- Cloudflare Workers (`cloudflare_module` preset) + D1
- Midtrans Snap
- Vitest

## Requirements

- Node `^22.22.3`, `^24.15.0`, or `>=26.0.0`
- pnpm `12.14.0` (see `packageManager` in `package.json`)

## Setup

```bash
pnpm install
cp .env.example .env
cp .dev.vars.example .dev.vars
```

`.env` is read by `nuxt dev`. `.dev.vars` is read by `wrangler dev` (the `preview` script). Keep both in sync; neither is committed.

Required values:

| Variable | Scope | Description |
| --- | --- | --- |
| `NUXT_MIDTRANS_SERVER_KEY` | server | Midtrans server key, used for Snap and signature checks |
| `NUXT_MIDTRANS_IS_PRODUCTION` | server | `"true"` to hit the production Midtrans API |
| `NUXT_PUBLIC_MIDTRANS_CLIENT_KEY` | public | Midtrans client key, loaded by `snap.js` |
| `NUXT_PUBLIC_MIDTRANS_SNAP_URL` | public | Snap script URL, sandbox by default |

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Nuxt dev server on `http://localhost:3000` |
| `pnpm build` | Production build into `.output/` |
| `pnpm preview` | Serve the build with `wrangler dev` (needs `.dev.vars` and a prior `pnpm build`) |
| `pnpm deploy` | `wrangler deploy` |
| `pnpm test` | Vitest |
| `pnpm typecheck` | `nuxt typecheck` |
| `pnpm lint` | ESLint |
| `pnpm db:migrate:local` | Apply D1 migrations to the local database |
| `pnpm db:migrate:remote` | Apply D1 migrations to the deployed database |

## Database

Migrations live in `migrations/` and are applied with Wrangler against the `SAKOE` D1 binding declared in `wrangler.jsonc`.

```bash
pnpm db:migrate:local
pnpm db:migrate:remote
```

Local data is stored under `.wrangler/`.

## Deploy

```bash
pnpm build
wrangler secret put NUXT_MIDTRANS_SERVER_KEY
wrangler secret put NUXT_MIDTRANS_IS_PRODUCTION
wrangler secret put NUXT_PUBLIC_MIDTRANS_CLIENT_KEY
wrangler secret put NUXT_PUBLIC_MIDTRANS_SNAP_URL
pnpm deploy
```

Set the Midtrans notification URL to `https://<your-domain>/api/notification`. In production the Snap client key and script URL must use the production values from the Midtrans dashboard.

## Project layout

```
app/                Vue app (pages, components, composables, utils)
  components/ui/    shadcn-vue components
server/api/         Nitro endpoints (donation, cancel, notification, status, stats)
server/utils/       server helpers (D1 binding, Midtrans)
shared/             constants shared by app and server
migrations/         D1 migrations
tests/              Vitest tests
```
