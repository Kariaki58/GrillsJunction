-- ==========================================
-- MIGRATION: Update business address to the Abule Egba location
-- Run this in the Supabase SQL editor.
-- ==========================================

UPDATE public.site_settings
SET
    address = '31 Santos Ave',
    city = 'Abule Egba',
    state = 'Lagos',
    zip_code = '100276'
WHERE id = 1;
