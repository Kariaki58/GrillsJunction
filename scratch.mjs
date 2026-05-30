import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data: cat } = await supabase.from('categories').select('*');
  console.log('Categories:', cat);
  const { data: menu } = await supabase.from('menu_items').select('category');
  console.log('Menu Categories:', menu);
}
run();
