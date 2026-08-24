-- Only needed if you already ran schema.sql before weight tracking existed.
-- Safe to run even if columns already exist (uses IF NOT EXISTS where possible).

alter table items add column if not exists weight_value numeric;
alter table items add column if not exists weight_unit text check (weight_unit in ('g','oz'));
alter table items add column if not exists ai_weight_estimate_g numeric;
alter table items add column if not exists ai_shipping_recommendation text;
alter table items add column if not exists shipping_cost numeric;
alter table items add column if not exists serial_number text;
alter table items add column if not exists model_number text;
alter table items add column if not exists brand text;
alter table items add column if not exists listing_title text;
alter table items add column if not exists listing_description text;
alter table items add column if not exists listed_venue text;
alter table items add column if not exists duplicate_dismissed boolean not null default false;
alter table items add column if not exists has_original_box boolean not null default false;
