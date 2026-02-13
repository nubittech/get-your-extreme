import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const SUPABASE_PUBLISHABLE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

export const SUPABASE_RESERVATIONS_TABLE =
  (import.meta.env.VITE_SUPABASE_RESERVATIONS_TABLE ?? 'reservations').trim() || 'reservations';
export const SUPABASE_EVENTS_TABLE =
  (import.meta.env.VITE_SUPABASE_EVENTS_TABLE ?? 'events').trim() || 'events';

const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
export const isSupabaseConfigured = hasSupabaseConfig;

export const supabase = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

/**
 * Session-free Supabase client that always uses the anon key without any
 * user JWT. Used for public reads (e.g. listing events) so that RLS
 * policies based on the anon role work regardless of whether a user is
 * signed in.
 */
export const supabasePublic: SupabaseClient | null = hasSupabaseConfig
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

export const requireSupabase = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return supabase;
};

export const requireSupabasePublic = () => {
  if (!supabasePublic) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  return supabasePublic;
};
