-- ============================================================
-- Elevate Salon — Supabase Schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Products
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  image_url   text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Variants
create table if not exists variants (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references products(id) on delete cascade,
  label             text not null,
  price             numeric(10, 2) not null,
  stripe_price_id   text,
  stripe_product_id text,
  in_stock          boolean not null default true,
  created_at        timestamptz not null default now()
);

-- Orders
create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  items             jsonb not null default '[]',
  total             integer,        -- in cents (from Stripe)
  email             text,
  created_at        timestamptz not null default now()
);

-- Indexes
create index if not exists variants_product_id_idx on variants(product_id);
create index if not exists orders_created_at_idx on orders(created_at desc);

-- ── Storage bucket ──────────────────────────────────────────
-- Create a public bucket named "product-images" in the
-- Supabase dashboard under Storage, then run:

-- Allow public read access to product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public product images are readable"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

create policy "Admin can upload product images"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' );

create policy "Admin can update product images"
  on storage.objects for update
  using ( bucket_id = 'product-images' );

-- ── Row Level Security ──────────────────────────────────────
-- Products and variants are publicly readable (for the shop)
alter table products enable row level security;
alter table variants enable row level security;
alter table orders enable row level security;

create policy "Products are publicly readable"
  on products for select using (true);

create policy "Variants are publicly readable"
  on variants for select using (true);

-- Orders are only accessible via the service role key (server-side)
-- (No public RLS policies needed for orders)
