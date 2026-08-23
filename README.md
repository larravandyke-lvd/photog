# PopPop's Collection — photography gear inventory

A shared app for you and Eric to photograph, catalog, and price out the photography
equipment for sale. Each item gets a sequential number (write it on the sticker),
multiple photos, AI-generated identification/condition/pricing, and a status you
move through as you work through selling it.

## What you need before deploying (15 minutes, one-time)

1. **A GitHub account** (free) — github.com
2. **A Vercel account** (free tier is plenty) — vercel.com, sign up with GitHub
3. **A Supabase account** (free tier is plenty) — supabase.com
4. **An Anthropic API key** — console.anthropic.com → API Keys → Create Key
   (This is billed separately from your Claude.ai subscription, pay-as-you-go.
   Each item's research call costs a few cents.)

## Step 1 — Create the Supabase project

1. New project at supabase.com → note the project's **URL** and **service_role key**
   (Project Settings → API — use the `service_role` secret key, not `anon`).
2. Open the SQL Editor in Supabase → paste in the contents of `supabase/schema.sql`
   from this project → Run. This creates the tables and the photo storage bucket.
   If you already had this project running before weight/shipping/serial-number/net-earnings
   tracking was added, also run `supabase/migration_002_weight.sql` once.

## Step 2 — Push this code to GitHub

```bash
cd gear-inventory
git init
git add .
git commit -m "Initial commit"
gh repo create poppops-collection --private --source=. --push
```
(No `gh` CLI? Create an empty repo on github.com instead, then
`git remote add origin <your-repo-url>` and `git push -u origin main`.)

## Step 3 — Deploy to Vercel

1. vercel.com → Add New Project → Import the GitHub repo you just created.
2. Before the first deploy, add these Environment Variables (from `.env.example`):
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
   `ANTHROPIC_API_KEY`, `APP_PIN`
3. Deploy. You'll get a URL like `poppops-collection.vercel.app`.

## Step 4 — Add it to your iPhone home screens

Open the Vercel URL in Safari on your phone → Share → Add to Home Screen.
It'll use the aperture icon and open full-screen like a native app. Do this on
Eric's phone too. You'll both only need to enter the PIN once per device.

## Using it

- Tap **+** → take as many photos as you want of the item → **Done**.
- You'll see the item's number — write it on a sticker on the physical item.
- Add any notes (condition quirks, what's included) → **Run AI research**.
- The AI identifies the item, assesses condition from the photos, and gives you
  a price range, best venues to sell it, and auction/listing strategy.
- Move the status along as you work: **Hold → In prep → Ready to sell → Listed → Sold**.
- The dashboard shows a running estimated value for whatever status filter you're viewing.
- The AI also reads engraved serial numbers, reads the specific model number (not just the
  general product line), notes brand separately, and flags if original packaging is visible
  in a photo. You can always correct any of these by hand on the item page.
- Give it a weight in grams or ounces (or a scale photo — it'll try to read the display) and
  it'll fold that into its shipping method advice.
- When you mark something Sold, enter the sale price and what shipping actually cost you —
  the app shows net earned per item, and the inventory book totals it across everything sold.
- **Inventory book** (link at the top of the dashboard): a printable, checkable list of every
  item sorted by sticker code — photo, code, model, serial, weight, status, price — meant to
  be printed and physically checked off as you package and ship things. There's also a
  **Download CSV** button next to it for opening the whole inventory in a spreadsheet.

## A few notes on the selling advice, since you asked me to be the expert

- **Price ranges reflect sold prices, not asking prices.** Asking prices on eBay/FB run
  high because sellers anchor optimistically; what matters is what things actually sell for.
- **No-reserve auctions (starting at $0.99–$1) work best for genuinely desirable items**
  with real demand — they create bidding urgency and often land at or above true market
  value. They're a bad idea for common gear that might only draw one bidder; use a fixed
  price or reserve auction there instead.
- **Bundle low-value or incomplete items** (body without a lens, orphaned caps/straps/filters)
  rather than listing them alone — shipping and listing effort eat the margin on anything
  under roughly $25–30 sold individually.
- **KEH/MPB trade-in is the "sell it today, no effort" option** — expect meaningfully less
  than a well-run private sale, but zero listing time and no flaky buyers.
- **Facebook Marketplace wins for bulky/local-pickup gear** (tripods, studio lighting,
  cases) where shipping cost would erase the value.
- **Niche system forums/Facebook groups** (specific lens mounts, specific brands) often
  have buyers who know exactly what they're looking at and will pay closer to top-of-range
  than a generalist marketplace.

The app applies this same logic per item automatically — this is just the reasoning
behind what it tells you.
