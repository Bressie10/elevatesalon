-- Run this in the Supabase SQL editor after schema.sql
-- Adds subscription system tables and stock_quantity column

-- ── Add stock_quantity to variants ─────────────────────────────────────────────
ALTER TABLE variants ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 99;

-- ── Add subscription_id to orders (nullable, links subscription invoice orders) ─
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subscription_id uuid;

-- ── Subscriptions ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email            text NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id    text,
  billing_day           integer NOT NULL CHECK (billing_day >= 1 AND billing_day <= 28),
  status                text NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'paused', 'cancelled')),
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- ── Subscription items ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  variant_id      uuid NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
  stripe_item_id  text,
  quantity        integer NOT NULL DEFAULT 1
);

-- ── Reserved stock (one row per variant that has active reservations) ──────────
CREATE TABLE IF NOT EXISTS reserved_stock (
  variant_id         uuid PRIMARY KEY REFERENCES variants(id) ON DELETE CASCADE,
  quantity_reserved  integer NOT NULL DEFAULT 0
);

-- ── Indexes ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS subscriptions_email_idx    ON subscriptions(user_email);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx   ON subscriptions(status);
CREATE INDEX IF NOT EXISTS sub_items_sub_idx          ON subscription_items(subscription_id);
CREATE INDEX IF NOT EXISTS sub_items_variant_idx      ON subscription_items(variant_id);

-- ── Row-Level Security ─────────────────────────────────────────────────────────
ALTER TABLE subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserved_stock     ENABLE ROW LEVEL SECURITY;

-- Public read on reserved_stock so the shop and subscribe page can
-- calculate available_to_sell without a service-role key
CREATE POLICY "reserved_stock public read"
  ON reserved_stock FOR SELECT USING (true);

-- Subscriptions and subscription_items have no public policies —
-- they are only accessible via the service-role key (API routes).
