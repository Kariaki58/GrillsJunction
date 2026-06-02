-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. MENU ITEMS TABLE
-- ==========================================
CREATE TABLE public.menu_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    rating NUMERIC DEFAULT 0.0,
    "desc" TEXT,
    image TEXT,
    badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 1.75. SITE SETTINGS TABLE
-- ==========================================
CREATE TABLE public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    business_name TEXT NOT NULL,
    site_title TEXT NOT NULL,
    site_description TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    opening_time TEXT,
    closing_time TEXT,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    minimum_order NUMERIC NOT NULL DEFAULT 0,
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    maintenance_message TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to site_settings"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admin write access to site_settings"
ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- 2. ORDERS TABLE
-- ==========================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_id TEXT UNIQUE NOT NULL,
    
    -- Customer Info
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    
    -- Fulfillment Info
    fulfillment_type TEXT NOT NULL, -- 'delivery' or 'pickup'
    fulfillment_address TEXT,
    fulfillment_area TEXT,
    fulfillment_notes TEXT,
    
    -- Totals
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    
    -- Status
    payment_confirmed BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 3. ORDER ITEMS TABLE
-- ==========================================
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES public.menu_items(id),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
-- Enable RLS on all tables
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Menu Items Policies:
-- Anyone can view the menu. Only authenticated users (admins) can modify it.
CREATE POLICY "Public read access to menu_items" 
ON public.menu_items FOR SELECT USING (true);

CREATE POLICY "Admin write access to menu_items" 
ON public.menu_items FOR ALL USING (auth.role() = 'authenticated');

-- Orders Policies:
-- Anyone (anon) can insert an order. Only authenticated admins can read or update them.
CREATE POLICY "Public insert access to orders" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read/write access to orders" 
ON public.orders FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update access to orders" 
ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete access to orders" 
ON public.orders FOR DELETE USING (auth.role() = 'authenticated');

-- Order Items Policies:
-- Anyone can insert order items. Only authenticated admins can read/update them.
CREATE POLICY "Public insert access to order_items" 
ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read/write access to order_items" 
ON public.order_items FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update access to order_items" 
ON public.order_items FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin delete access to order_items" 
ON public.order_items FOR DELETE USING (auth.role() = 'authenticated');


-- ==========================================
-- SEED DATA (MOCK MENU ITEMS)
-- ==========================================
INSERT INTO public.menu_items (name, price, rating, "desc", image, badge) VALUES
('Special Lagos Asun', 4500, 4.9, 'Fiery goat meat, hand-cut and slow grilled with scotch bonnets.', 'asun-special', 'Best Seller'),
('Flame BBQ Chicken', 6500, 4.8, 'Half chicken marinated in house spices for 24 hours.', 'bbq-chicken', 'Popular'),
('Premium Grilled Catfish', 8500, 5.0, 'Whole point-and-kill catfish, expertly seasoned.', 'catfish-bbq', 'Fresh'),
('Suya Spiced Beef BBQ', 5500, 4.7, 'Tender beef chunks with yaji spice and grilled onions.', 'beef-bbq', NULL),
('Signature Turkey Wings', 4800, 4.6, 'Massive turkey wings, grilled till crispy and golden.', 'turkey-bbq', NULL),
('Spicy Goat Chops', 7000, 4.8, 'Thick cut goat chops grilled over wood fire.', 'asun-special', 'New');

-- ==========================================
-- SEED SITE SETTINGS
-- ==========================================
INSERT INTO public.site_settings (id, business_name, site_title, site_description, address, city, state, zip_code, opening_time, closing_time, delivery_fee, minimum_order, maintenance_mode, maintenance_message)
VALUES
(1, 'GrillsJunction', 'GrillsJunction | Lagos Premium BBQ Experience', 'Luxury African BBQ specializing in Asun, Grilled Chicken, Catfish, and more.', '31 Santos Ave', 'Abule Egba', 'Lagos', '100276', '10:00', '23:59', 2000, 10000, false, 'We are currently under maintenance. Please try again later.');

