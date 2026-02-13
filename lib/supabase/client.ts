import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Whether runtime env variables are present.
 *
 * Keep this check side-effect free so tests/build tooling can import the module
 * without crashing when env is not configured.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Create a typed Supabase browser client.
 * Throws only when the function is called, not at module import time.
 */
export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Shared singleton for app runtime usage.
 * `null` when env is not configured (common in CI static checks).
 */
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string)
  : null;
