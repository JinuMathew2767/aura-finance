import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const missingEnvMessage =
  'FATAL: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is missing.';

type SupabaseClientLike = ReturnType<typeof createClient>;

function createMissingEnvClient(): SupabaseClientLike {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(missingEnvMessage);
      },
    }
  ) as SupabaseClientLike;
}

// Create a single supabase client for interacting with your database from server routes
// WARNING: NEVER EXPOSE THIS CLIENT TO THE BROWSER
export const supabaseServerAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : createMissingEnvClient();
