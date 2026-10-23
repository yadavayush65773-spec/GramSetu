import { database } from '../../config/database.js';
import { supabaseAdminClient, supabaseClient } from '../../config/supabase.js';

export async function getProfileByAuthOrId(idOrAuthId) {
  if (!idOrAuthId) return null;

  // 1. Check in-memory store
  const found = database.store.profiles.find(
    (p) => p.id === idOrAuthId || p.auth_user_id === idOrAuthId || p.email === idOrAuthId
  );
  if (found) return found;

  // 2. Query Supabase if configured
  const client = supabaseAdminClient || supabaseClient;
  if (client) {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .or(`id.eq.${idOrAuthId},auth_user_id.eq.${idOrAuthId},email.eq.${idOrAuthId}`)
        .maybeSingle();

      if (!error && data) return data;
    } catch (_) {}
  }

  return null;
}

export async function getAllProfiles() {
  const client = supabaseAdminClient || supabaseClient;
  if (client) {
    try {
      const { data, error } = await client.from('profiles').select('*');
      if (!error && data && data.length > 0) return data;
    } catch (_) {}
  }
  return database.store.profiles;
}
