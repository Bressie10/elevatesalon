-- Run this in the Supabase SQL editor if you've already run subscription_schema.sql
-- Adds a separate recurring Stripe price ID for subscription billing

ALTER TABLE variants ADD COLUMN IF NOT EXISTS stripe_subscription_price_id text;
