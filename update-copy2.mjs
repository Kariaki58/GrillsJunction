import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function update() {
  const { data, error } = await supabase
    .from('site_settings')
    .update({
      site_title: "Lagos' Favorite Spot for Premium BBQ & Grills",
      site_description: "Savor the rich flavors of our signature Asun, perfectly grilled Chicken, spicy Catfish, and other mouthwatering specialties. Prepared fresh, served hot, and crafted with passion because every meal should be memorable."
    })
    .eq('id', 1);
  if (error) console.error(error);
}
update();
