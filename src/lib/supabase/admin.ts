import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client using the Service Role key.
 * This bypasses RLS and should ONLY be used in server-side API routes.
 * NEVER expose this client or the service role key to the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
