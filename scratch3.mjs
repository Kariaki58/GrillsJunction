import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('categories').select('*').limit(1);
  console.log('Categories columns:', error ? error : (data.length ? Object.keys(data[0]) : 'empty table, no columns info directly from data'));
  // let's try getting columns via rpc or just inserting a bad column to see error
  const { error: e2 } = await supabase.from('categories').select('is_featured');
  console.log('is_featured error:', e2);
}
run();
