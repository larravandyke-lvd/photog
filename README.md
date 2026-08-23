# photog / gear-inventory

A photography equipment inventory tracker. Catalogue each body, lens, and light;
photograph it with your device camera; and have Claude research its specs,
used-market value, and known issues.

Built with Next.js (App Router) + TypeScript + Tailwind, Supabase for data and
photo storage, and the Claude API with web search for research.

## Features

- **Inventory** — name, brand, model, category, serial number, condition, purchase
  date and price, estimated value, and free-form notes, with a running total across
  the collection.
- **Camera capture** — photograph an item in the browser (`getUserMedia`) and store
  the frame in a private Supabase bucket; the UI reads it back through short-lived
  signed URLs.
- **Claude research** — one click searches the web for the exact model and records a
  structured summary: key specs, release year, MSRP, current used-market value,
  documented reliability problems, care notes, and sources.

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

Create a project, then apply the schema in `supabase/migrations/0001_init.sql` —
either `supabase db push` with the CLI, or paste it into the dashboard SQL editor.
It creates the `gear_items` table, its `updated_at` trigger, and the private
`gear-photos` storage bucket.

Row-level security is enabled on `gear_items` with **no policies**, on purpose. The
app reads and writes only from server code holding the service-role key, which
bypasses RLS, so the anon key grants no access to anything. Adding real user
accounts means adding per-user policies here.

### 3. Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where it comes from |
| --- | --- |
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | same page — **server-only**, never `NEXT_PUBLIC_` |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |

### 4. Run

```bash
npm run dev      # http://localhost:3000
```

Camera capture needs a secure context: it works on `localhost` and over HTTPS, but
not on a plain-HTTP host.

## Commands

| Purpose | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Start built app | `npm start` |
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |

## Deploying to Vercel

1. Push this branch and import the repo at [vercel.com/new](https://vercel.com/new).
   Vercel detects Next.js; no build settings to change.
2. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `ANTHROPIC_API_KEY` under
   **Settings → Environment Variables** for Production, Preview, and Development.
   None of them are `NEXT_PUBLIC_`, so they stay server-side.
3. Deploy. Vercel serves over HTTPS, so camera capture works on the deployed URL.

Or from the CLI:

```bash
npx vercel link
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel env add ANTHROPIC_API_KEY
npx vercel --prod
```

`/api/research` sets `maxDuration = 300` because a web-search research turn can run
well past the default. Lower it if your plan's ceiling is shorter.

## Layout

```
src/
  app/
    page.tsx                      inventory list
    gear/[id]/page.tsx            item detail
    api/gear/route.ts             list + create
    api/gear/[id]/route.ts        read + update + delete
    api/gear/[id]/photo/route.ts  camera upload
    api/research/route.ts         Claude research
  components/                     camera capture, forms, detail, research panel
  lib/
    gear.ts                       Supabase data access + signed URLs
    research.ts                   Claude API calls
    supabase.ts                   service-role client
    types.ts  validate.ts  format.ts  http.ts
supabase/migrations/0001_init.sql
```

## How the research call works

`src/lib/research.ts` makes two calls to `claude-opus-5`:

1. **Research** — adaptive thinking plus the `web_search` server tool, with
   `pause_turn` resumed so a long search finishes, and server-side refusal
   fallbacks enabled.
2. **Structure** — `messages.parse` reshapes those findings into the stored schema.

The two are kept separate because the citations carried by web-search results
cannot be combined with `output_config.format` in a single request. The extraction
step is instructed to use only what the research notes established and to leave a
field null otherwise — an inventory used for insurance should not carry invented
numbers.
