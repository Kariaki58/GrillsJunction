-- ==========================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ==========================================

-- 1. Drop the category column from menu_items
ALTER TABLE public.menu_items DROP COLUMN IF EXISTS category;

-- 2. Drop the categories table completely
DROP TABLE IF EXISTS public.categories;
