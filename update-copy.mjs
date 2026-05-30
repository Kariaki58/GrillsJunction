import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function update() {
  const { data, error } = await supabase
    .from('site_settings')
    .update({
      site_title: "Experience Lagos' Finest Premium BBQ",
      site_description: "Indulge in our legendary Asun, tender Grilled Chicken, and spicy Catfish crafted for true BBQ lovers and delivered smoking hot to your door."
    })
    .eq('id', 1);
  if (error) console.error(error);
  else console.log('Updated successfully');
}
update();
