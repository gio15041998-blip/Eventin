import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readSupabaseConfiguration } from './supabaseConfig';
import { eventinProject } from './supabaseProject';

export const supabaseConfiguration = readSupabaseConfiguration({ ...eventinProject, ...Object.fromEntries(Object.entries(import.meta.env).filter(([key]) => key.startsWith('VITE_SUPABASE_'))) });

let client: SupabaseClient | null = null;

// Lazy initialization keeps the existing demo intact while credentials are
// absent. Live repositories must explicitly use this client and await results.
export function getSupabaseClient(): SupabaseClient {
  if (supabaseConfiguration.status !== 'ready') {
    throw new Error(
      supabaseConfiguration.status === 'invalid'
        ? supabaseConfiguration.message
        : 'Supabase todavía no está configurado para Eventin.'
    );
  }

  client ??= createClient(supabaseConfiguration.url, supabaseConfiguration.publicKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
}
