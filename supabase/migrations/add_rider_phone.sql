-- ==========================================
-- MIGRATION: Add rider phone number to orders
-- ==========================================
-- When an admin marks an order as "out_for_delivery" they can attach the
-- delivery rider's phone number. Customers tracking the order can then tap
-- "Call rider" to reach the rider directly.
--
-- Run this against your Supabase project (SQL Editor) once.

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS rider_phone TEXT;
