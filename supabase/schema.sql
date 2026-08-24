-- Run this once in the Supabase SQL editor for your project.

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  item_number serial unique,             -- the sequential number you write on the sticker
  title text,                            -- e.g. "Canon AE-1 Program body"
  category text,                         -- e.g. "35mm SLR body", "Manual lens", "Tripod"
  notes text,                            -- freeform notes from you or Eric
  status text not null default 'HOLD' check (status in ('HOLD','PREP','FOR_SALE','LISTED','SOLD')),
  ai_identification text,                -- what the AI thinks it is, make/model/era
  brand text,                            -- e.g. "Canon", "Nikon", "Pentax"
  model_number text,                     -- the specific model number, e.g. "EOS 630QD", not just "Canon EOS"
  serial_number text,                    -- read from a photo (engraved/printed) or entered manually
  has_original_box boolean not null default false,
  ai_condition_assessment text,          -- condition notes from photos
  ai_price_low numeric,
  ai_price_high numeric,
  ai_price_notes text,
  ai_venues jsonb,                       -- array of {venue, why, fit_score}
  ai_auction_strategy text,              -- start price / reserve / bundle advice
  weight_value numeric,                  -- as entered by you/Eric, in weight_unit
  weight_unit text check (weight_unit in ('g','oz')),
  ai_weight_estimate_g numeric,          -- AI's estimate from a scale photo, in grams, if visible
  ai_shipping_recommendation text,       -- box/method/carrier advice based on weight + item type
  sold_price numeric,
  shipping_cost numeric,                 -- what it actually cost you to ship it
  sold_venue text,
  created_by text,                       -- 'you' or 'eric', from the shared login
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists item_photos (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_item_photos_item_id on item_photos(item_id);

-- Storage bucket for photos (create via dashboard Storage tab if this fails):
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

-- Simple open policies since access is gated by the app's shared PIN, not Supabase auth.
alter table items enable row level security;
alter table item_photos enable row level security;

create policy "allow all items" on items for all using (true) with check (true);
create policy "allow all item_photos" on item_photos for all using (true) with check (true);

create policy "public read item-photos"
on storage.objects for select
using (bucket_id = 'item-photos');

create policy "public insert item-photos"
on storage.objects for insert
with check (bucket_id = 'item-photos');
