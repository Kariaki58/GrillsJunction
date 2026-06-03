-- ==========================================
-- MIGRATION: Add optional extras / add-ons to menu items and order items
-- Run this in the Supabase SQL editor.
-- ==========================================
--
-- Each menu item can carry a list of optional extras a customer may add, e.g.
--   [{ "name": "Extra Beef", "price": 1000 }, { "name": "Extra sausage", "price": 500 }]
--
-- When a customer orders, the extras they actually picked are stored on the
-- matching order item so we can show exactly what was ordered.

ALTER TABLE public.menu_items
    ADD COLUMN IF NOT EXISTS addons JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.order_items
    ADD COLUMN IF NOT EXISTS addons JSONB NOT NULL DEFAULT '[]'::jsonb;
