# Sakoe

A single-page donation site. Visitors pick an amount, pay through Tako, and see the transaction result. Donations are stored in Cloudflare D1 and the app runs on Cloudflare Workers.

## Stack

- Nuxt 4 (Vue 3, Vue Router 5, Vite 8)
- Tailwind CSS 4 + shadcn-vue (reka-ui)
- Cloudflare Workers (`cloudflare_module` preset) + D1
- Tako Gift API
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
| `NUXT_TAKO_API_KEY` | server | Tako API key used to create gifts and read their status |
| `NUXT_TAKO_CALLBACK_SECRET` | server | Callback secret for the same API key, used to verify `X-Tako-Signature` |
| `NUXT_TAKO_USERNAME` | server | Tako creator that receives the gifts (`ridha_arlian`) |
| `NUXT_TAKO_USER_AGENT` | server | User-Agent sent to Tako, e.g. `Sakoe/1.0` |

Tako has no sandbox. Creating a gift is free, but paying it moves real money. For local callbacks use a public HTTPS tunnel, and use a separate API key per environment because the callback and redirect URLs are configured per key.

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
wrangler secret put NUXT_TAKO_API_KEY
wrangler secret put NUXT_TAKO_CALLBACK_SECRET
wrangler secret put NUXT_TAKO_USERNAME
wrangler secret put NUXT_TAKO_USER_AGENT
pnpm deploy
```

In the Tako API key settings, set:

- Callback URL: `https://<your-domain>/api/tako/callback`
- Redirect URL: `https://<your-domain>/status`
- Callback Secret: same value as `NUXT_TAKO_CALLBACK_SECRET`
- IP restriction: off (Cloudflare Workers does not have a fixed outbound IP)

## Project layout

```
app/                Vue app (pages, components, composables, utils)
  components/ui/    shadcn-vue components
server/api/         Nitro endpoints (donation, status, stats, Tako callback)
server/utils/       server helpers (D1 binding, Tako)
shared/             constants shared by app and server
migrations/         D1 migrations
tests/              Vitest tests
```
