import { loadEnvFile } from 'node:process';
import { readSupabaseConfiguration } from '../src/lib/supabaseConfig.ts';

try { loadEnvFile('.env.local'); } catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const config = readSupabaseConfiguration(process.env);
if (config.status !== 'ready') {
  throw new Error(config.status === 'invalid' ? config.message : 'Configura Supabase antes de verificar la conexión.');
}

// Read-only checks: do not create accounts, sessions, tables or sample data.
for (const [name, path] of [['Auth', '/auth/v1/settings'], ['Data API', '/rest/v1/']]) {
  const response = await fetch(`${config.url}${path}`, {
    headers: { apikey: config.publicKey },
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.json();
  // The OpenAPI schema endpoint can deliberately require a secret key.
  // Do not weaken that setting or place a privileged key in this client.
  if (path === '/rest/v1/' && response.status === 401 && body.message === 'Secret API key required') {
    console.log('Data API: servidor accesible; descripción del esquema restringida a claves privadas. Acceso a tablas pendiente de verificar.');
    continue;
  }
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  console.log(`${name}: acceso confirmado (HTTP ${response.status}).`);
}
console.log('Conexión verificada. Esta prueba no demuestra persistencia, RLS ni funcionamiento de las pantallas.');
