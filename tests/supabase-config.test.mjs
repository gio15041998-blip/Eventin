import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readSupabaseConfiguration as read } from '../src/lib/supabaseConfig.ts';

const project = { VITE_SUPABASE_URL: 'https://eventin-test.supabase.co' };
const anon = `e30.${btoa(JSON.stringify({ role: 'anon' }))}.example`;
const service = `e30.${btoa(JSON.stringify({ role: 'service_role' }))}.example`;

test('missing configuration does not activate a live connection', () => {
  assert.equal(read({}).status, 'not-configured');
  assert.equal(read(project).status, 'invalid');
});

test('accepts public configuration and a legacy anon key', () => {
  assert.equal(read({ ...project, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example' }).status, 'ready');
  assert.equal(read({ ...project, VITE_SUPABASE_ANON_KEY: anon }).status, 'ready');
});

test('rejects privileged keys without echoing the key in errors', () => {
  for (const key of ['sb_secret_example', service]) {
    const result = read({ ...project, VITE_SUPABASE_PUBLISHABLE_KEY: key });
    assert.equal(result.status, 'invalid');
    assert.equal(JSON.stringify(result).includes(key), false);
  }
});

test('accepts local development HTTP and rejects credential-bearing or insecure remote URLs', () => {
  const key = { VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_example' };
  assert.equal(read({ ...key, VITE_SUPABASE_URL: 'http://127.0.0.1:54321' }).status, 'ready');
  for (const url of ['http://eventin-test.supabase.co', 'https://user:pass@example.com', 'https://example.com?key=value']) {
    assert.equal(read({ ...key, VITE_SUPABASE_URL: url }).status, 'invalid');
  }
});
