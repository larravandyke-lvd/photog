# gear-inventory

Project instructions for Claude Code. Keep this file short and current — stale
instructions are worse than none.

## What this is

A photography equipment inventory tracker: Next.js 16 (App Router) + TypeScript +
Tailwind v4, Supabase for data and photo storage, Claude API for gear research.
See `README.md` for setup and deployment.

## Commands

| Purpose   | Command             |
| --------- | ------------------- |
| Install   | `npm install`       |
| Dev       | `npm run dev`       |
| Build     | `npm run build`     |
| Lint      | `npm run lint`      |
| Typecheck | `npx tsc --noEmit`  |

Run lint, typecheck, and build before pushing.

## Architecture

- **All Supabase access is server-side.** `src/lib/supabase.ts` holds the
  service-role client; `src/lib/gear.ts` is the only module that queries the table.
  Never import either from a client component, and never add a `NEXT_PUBLIC_`
  Supabase key — RLS is on with no policies, so the anon key is deliberately useless.
- **Client components talk to `/api/*`**, not to Supabase directly.
- **Photos** live in the private `gear-photos` bucket. Rows store `photo_path`; the
  data layer attaches a short-lived `photo_url` signed URL on read. Pages that show
  photos set `export const dynamic = "force-dynamic"` so those URLs stay fresh, and
  render them with plain `<img>` rather than `next/image`.
- **Schema changes** go in a new numbered file under `supabase/migrations/`. Keep
  the column checks there in sync with `CATEGORIES` and `CONDITIONS` in
  `src/lib/types.ts`.
- **Claude calls** live only in `src/lib/research.ts` — model `claude-opus-5`, web
  search for findings, then `messages.parse` for structure. Read the `claude-api`
  skill before changing that file rather than working from memory.

## Conventions

- Match the surrounding code: naming, comment density, and idiom follow whatever is
  already in the file being edited.
- Validate untrusted request bodies through `src/lib/validate.ts`; return errors via
  `errorResponse` in `src/lib/http.ts` so stack traces stay server-side.
- Money is `numeric(12,2)` in Postgres and arrives as a number or string — format it
  with `money()` from `src/lib/format.ts` rather than inline.
- Never invent gear values or specs in prompts or fallback code paths. An inventory
  used for insurance is worse than useless when it carries made-up numbers.
- Commit messages: imperative mood, one-line subject, body only when the "why" is
  not obvious from the diff.
- Don't commit photo assets, RAW files, or `.env.local`.

## Git

- Default branch: `main`.
- Work on feature branches; do not push directly to `main`.
