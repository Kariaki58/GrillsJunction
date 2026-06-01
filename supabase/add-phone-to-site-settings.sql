-- ==========================================
-- MIGRATION: Add business phone to site_settings
-- Run this in the Supabase SQL editor.
-- ==========================================

ALTER TABLE public.site_settings
    ADD COLUMN IF NOT EXISTS phone TEXT;

-- Backfill the existing single settings row with a default contact number.
UPDATE public.site_settings
SET phone = COALESCE(phone, '+234 800 123 4567')
WHERE id = 1;
