import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const categories = [
    { name: 'Asun', image: 'asun-special' },
    { name: 'Chicken', image: 'bbq-chicken' },
    { name: 'Fish', image: 'catfish-bbq' },
    { name: 'Beef', image: 'beef-bbq' },
    { name: 'Turkey', image: 'turkey-bbq' }
  ];
  
  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'name' });
    if (error) console.error('Error inserting category:', error);
  }

  const menuItems = [
    { name: 'Special Lagos Asun', category: 'Asun', price: 4500, rating: 4.9, desc: 'Fiery goat meat, hand-cut and slow grilled with scotch bonnets.', image: 'asun-special', badge: 'Best Seller' },
    { name: 'Flame BBQ Chicken', category: 'Chicken', price: 6500, rating: 4.8, desc: 'Half chicken marinated in house spices for 24 hours.', image: 'bbq-chicken', badge: 'Popular' },
    { name: 'Premium Grilled Catfish', category: 'Fish', price: 8500, rating: 5.0, desc: 'Whole point-and-kill catfish, expertly seasoned.', image: 'catfish-bbq', badge: 'Fresh' },
    { name: 'Suya Spiced Beef BBQ', category: 'Beef', price: 5500, rating: 4.7, desc: 'Tender beef chunks with yaji spice and grilled onions.', image: 'beef-bbq', badge: null },
    { name: 'Signature Turkey Wings', category: 'Turkey', price: 4800, rating: 4.6, desc: 'Massive turkey wings, grilled till crispy and golden.', image: 'turkey-bbq', badge: null },
    { name: 'Spicy Goat Chops', 'category': 'Asun', price: 7000, rating: 4.8, desc: 'Thick cut goat chops grilled over wood fire.', image: 'asun-special', badge: 'New' }
  ];

  for (const item of menuItems) {
    const { error } = await supabase.from('menu_items').upsert(item, { onConflict: 'id' });
    if (error) console.error('Error inserting item:', item.name, error);
  }
  
}

seed();
