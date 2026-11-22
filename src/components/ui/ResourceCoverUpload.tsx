import React, { useState } from 'react';
import { getSupabaseClient } from '../../lib/supabase';

export const ResourceCoverUpload: React.FC<{ kind: 'business' | 'public_event'; resourceId: string }> = ({ kind, resourceId }) => {
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file || busy) return;
    const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
    if (!extensions[file.type] || file.size > 5 * 1024 * 1024) { setError('Elige una imagen JPG, PNG o WebP de hasta 5 MB.'); event.target.value = ''; return; }
    setBusy(true); setError(''); const client = getSupabaseClient(); let path = '';
    try {
      const { data: identity, error: invalid } = await client.auth.getUser();
      if (invalid || !identity.user) throw new Error('Inicia sesión para subir la portada.');
      path = `${identity.user.id}/${resourceId}/${crypto.randomUUID()}.${extensions[file.type]}`;
      const { error: uploadError } = await client.storage.from('eventin-covers').upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { error: failure } = await client.rpc('eventin_set_cover', { kind, resource: resourceId, path });
      if (failure) { await client.storage.from('eventin-covers').remove([path]); throw failure; }
      window.location.reload();
    } catch (failure) { setError((failure as Error).message || 'No se pudo subir la portada.'); }
    finally { setBusy(false); event.target.value = ''; }
  };
  return <div className="rounded-[12px] border border-[#DCE4DF] p-4 space-y-2"><label className="block text-sm font-semibold text-[#172D28]">Portada de la publicación<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload} className="block mt-2 max-w-full text-sm" /></label><p className="text-xs text-[#566A63]">{busy ? 'Subiendo portada…' : 'JPG, PNG o WebP, hasta 5 MB. Al cambiarla, la publicación vuelve a borrador para una nueva revisión.'}</p>{error && <p role="alert" className="text-sm text-red-800">{error}</p>}</div>;
};
