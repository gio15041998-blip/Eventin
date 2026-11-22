export type SupabaseEnvironment = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

export type SupabaseConfiguration =
  | { status: 'not-configured' }
  | { status: 'invalid'; message: string }
  | { status: 'ready'; url: string; publicKey: string };

// Returns configuration state only; it does not claim that the remote project
// exists or that its Auth, schema, Storage and RLS have been verified.
export function readSupabaseConfiguration(env: SupabaseEnvironment): SupabaseConfiguration {
  const url = env.VITE_SUPABASE_URL?.trim() ?? '';
  const publicKey = (
    env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || ''
  ).trim();

  if (!url && !publicKey) return { status: 'not-configured' };
  if (!url || !publicKey) {
    return { status: 'invalid', message: 'Completa la URL y la clave pública de Supabase.' };
  }

  try {
    const parsed = new URL(url);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
    if ((parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:')) ||
        parsed.username || parsed.password || parsed.search || parsed.hash ||
        (parsed.pathname !== '/' && parsed.pathname !== '')) {
      return { status: 'invalid', message: 'Usa la URL base HTTPS del proyecto Supabase.' };
    }
  } catch {
    return { status: 'invalid', message: 'La URL del proyecto Supabase no es válida.' };
  }

  if (!publicKey.startsWith('sb_publishable_')) {
    try {
      const segments = publicKey.split('.');
      if (segments.length !== 3) throw new Error('Invalid public key');
      const payload = JSON.parse(atob(segments[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.role !== 'anon') throw new Error('Non-public role');
    } catch {
      return { status: 'invalid', message: 'Usa una clave publishable o anon; las claves privadas no van en el frontend.' };
    }
  }

  return { status: 'ready', url: url.replace(/\/$/, ''), publicKey };
}
