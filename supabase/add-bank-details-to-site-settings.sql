-- ==========================================
-- MIGRATION: Add bank / payment details to site_settings
-- Run this in the Supabase SQL editor.
-- ==========================================

ALTER TABLE public.site_settings
    ADD COLUMN IF NOT EXISTS bank_name TEXT,
    ADD COLUMN IF NOT EXISTS account_name TEXT,
    ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Backfill the existing settings row with the current payment details.
UPDATE public.site_settings
SET
    bank_name = COALESCE(bank_name, 'OPay'),
    account_name = COALESCE(account_name, 'Grillsjunction'),
    account_number = COALESCE(account_number, '6108713737')
WHERE id = 1;
