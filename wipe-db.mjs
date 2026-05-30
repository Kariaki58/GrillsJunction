import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
  console.log('Wiping menu items...');
  const { error: err1 } = await supabase.from('menu_items').delete().neq('id', 0);
  if (err1) console.error(err1);
  console.log('Wiping categories...');
  const { error: err2 } = await supabase.from('categories').delete().neq('id', 0);
  if (err2) console.error(err2);
  console.log('Done!');
}
wipe();
