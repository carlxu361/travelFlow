import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function requireSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createSupabaseBrowserClient();
}
