import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseClient = null;
let supabaseAdminClient = null;

if (env.isSupabaseConfigured) {
  try {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      supabaseAdminClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    console.log('[Supabase] Successfully initialized Supabase PostgreSQL & Storage client');
  } catch (err) {
    console.warn('[Supabase] Failed to initialize Supabase client:', err.message);
    supabaseClient = null;
    supabaseAdminClient = null;
  }
} else {
  console.log('[Supabase] Credentials not provided; operating in resilient demo mode');
}

export { supabaseClient, supabaseAdminClient };
