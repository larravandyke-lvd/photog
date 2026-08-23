-- gear-inventory: initial schema.
--
-- Run against a fresh Supabase project with `supabase db push`, or paste into
-- the SQL editor in the dashboard.

create extension if not exists "pgcrypto";

create table if not exists public.gear_items (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null default 'other'
                    check (category in ('camera-body', 'lens', 'lighting', 'support',
                                        'audio', 'storage', 'bag', 'accessory', 'other')),
  brand           text,
  model           text,
  serial_number   text,
  condition       text not null default 'good'
                    check (condition in ('mint', 'excellent', 'good', 'fair', 'poor')),
  purchase_date   date,
  purchase_price  numeric(12, 2) check (purchase_price >= 0),
  estimated_value numeric(12, 2) check (estimated_value >= 0),
  notes           text,
  photo_path      text,
  research        jsonb,
  researched_at   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists gear_items_created_at_idx on public.gear_items (created_at desc);
create index if not exists gear_items_category_idx on public.gear_items (category);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gear_items_set_updated_at on public.gear_items;
create trigger gear_items_set_updated_at
  before update on public.gear_items
  for each row execute function public.set_updated_at();

-- RLS is on with no policies on purpose: the app reaches the table only from
-- server code holding the service-role key, which bypasses RLS. The anon key
-- therefore grants no access at all. Add per-user policies here when the app
-- grows real accounts.
alter table public.gear_items enable row level security;

-- Private bucket for captured photos; the app hands out short-lived signed URLs.
insert into storage.buckets (id, name, public)
values ('gear-photos', 'gear-photos', false)
on conflict (id) do nothing;
