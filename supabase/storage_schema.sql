-- ==========================================
-- SUPABASE STORAGE CONFIGURATION
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Create a new public bucket for menu images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR STORAGE
-- ==========================================

-- Allow public read access to all images in the menu-images bucket
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'menu-images');

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admin Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'menu-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users (admins) to update their uploaded images
CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'menu-images' 
    AND auth.role() = 'authenticated'
);

-- Allow authenticated users (admins) to delete images
CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'menu-images' 
    AND auth.role() = 'authenticated'
);
