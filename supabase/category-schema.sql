-- ==========================================
-- CATEGORIES TABLE FOR DYNAMIC DASHBOARD + FRONTEND
-- ==========================================

CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable row level security for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to categories"
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admin write access to categories"
ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- Example seed data for categories (optional)
INSERT INTO public.categories (name, image) VALUES
('Asun', 'asun-special'),
('Chicken', 'bbq-chicken'),
('Fish', 'catfish-bbq'),
('Beef', 'beef-bbq'),
('Turkey', 'turkey-bbq');
