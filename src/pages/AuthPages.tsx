import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { isSafeInternalReturnTo } from '../domain/predicates';
import { useDemoStore } from '../repositories/demoStore';
import { getSupabaseClient } from '../lib/supabase';
import { InlineNotice } from '../components/ui/StatusBadge';

const inputClass = 'w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm';
const buttonClass = 'w-full min-h-[44px] rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] disabled:opacity-60 text-white text-sm font-bold cursor-pointer';
const Frame: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <div className="max-w-md mx-auto px-4 py-10"><div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 sm:p-8 space-y-5"><h1 className="text-2xl font-extrabold text-[#172D28]">{title}</h1>{children}</div></div>;

const AccessForm: React.FC<{ register?: boolean }> = ({ register = false }) => {
  const { currentUser, signInDemo, registerDemo } = useDemoStore();
  const [params] = useSearchParams(); const navigate = useNavigate();
  const returnTo = isSafeInternalReturnTo(params.get('returnTo'));
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  if (currentUser) return <Navigate to={returnTo} replace />;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try {
      const result = register ? await registerDemo(name.trim(), email.trim(), phone.trim(), password) : await signInDemo(email.trim(), password);
      if (!result.ok) { setError(result.error || 'No se pudo completar la solicitud.'); return; }
      if (register && !result.data) { setSent(true); setPassword(''); }
      else navigate(returnTo, { replace: true });
    } catch { setError('No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.'); }
    finally { setBusy(false); }
  };
  return <Frame title={register ? 'Crear tu cuenta' : 'Acceder a Eventin'}>
    <p className="text-sm text-[#566A63]">{register ? 'Organiza tus eventos y encuentra proveedores en un solo lugar.' : 'Continúa con tus eventos, negocios y publicaciones.'}</p>
    {error && <InlineNotice tone="danger">{error}</InlineNotice>}
    {sent ? <InlineNotice tone="success">Revisa tu correo para confirmar la cuenta. Después podrás iniciar sesión. Si ya tenías una cuenta, utiliza Acceder o Recuperar acceso.</InlineNotice> : <form onSubmit={submit} className="space-y-4" aria-busy={busy}>
      <fieldset disabled={busy} className="space-y-4">
        {register && <><label className="block text-sm font-semibold">Nombre completo<input className={inputClass} autoComplete="name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label><label className="block text-sm font-semibold">WhatsApp (opcional)<input className={inputClass} type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} /></label></>}
        <label className="block text-sm font-semibold">Correo electrónico<input className={inputClass} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label className="block text-sm font-semibold">Contraseña<input className={inputClass} type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : 1} value={password} onChange={e => setPassword(e.target.value)} /></label>
        {register && <p className="text-xs text-[#566A63]">Usa al menos 8 caracteres.</p>}
        <button className={buttonClass} type="submit">{busy ? 'Procesando…' : register ? 'Crear mi cuenta' : 'Entrar'}</button>
      </fieldset>
    </form>}
    <div className="flex flex-wrap gap-4 text-sm"><Link className="text-[#145C46] font-semibold" to={`/acceder?returnTo=${encodeURIComponent(returnTo)}`}>Acceder</Link><Link className="text-[#145C46] font-semibold" to={`/registro?returnTo=${encodeURIComponent(returnTo)}`}>Crear cuenta</Link><Link className="text-[#145C46] font-semibold" to="/recuperar-acceso">Olvidé mi contraseña</Link></div>
  </Frame>;
};
export const LoginPage = () => <AccessForm />;
export const RegisterPage = () => <AccessForm register />;

export const RecoveryPage = () => {
  const [email, setEmail] = useState(''); const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try {
      const { error: failure } = await getSupabaseClient().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/restablecer-acceso` });
      if (failure) throw failure; setSent(true);
    } catch { setError('No se pudo enviar la solicitud. Inténtalo de nuevo en unos minutos.'); }
    finally { setBusy(false); }
  };
  return <Frame title="Recuperar acceso">{error && <InlineNotice tone="danger">{error}</InlineNotice>}{sent ? <InlineNotice tone="success">Si existe una cuenta asociada a ese correo, recibirás un enlace para recuperar el acceso.</InlineNotice> : <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">Correo electrónico<input className={inputClass} type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><button className={buttonClass} disabled={busy}>{busy ? 'Enviando…' : 'Enviar recuperación'}</button></form>}<Link to="/acceder" className="text-[#145C46] font-semibold">Volver a acceder</Link></Frame>;
};

export const ResetPage = () => {
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [done, setDone] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    if (password !== confirm || password.length < 8) { setError('Las contraseñas deben coincidir y tener al menos 8 caracteres.'); return; }
    setBusy(true); setError('');
    try {
      const client = getSupabaseClient(); const { data: identity, error: invalid } = await client.auth.getUser();
      if (invalid || !identity.user) throw new Error('Abre un enlace de recuperación válido desde tu correo.');
      const { error: failure } = await client.auth.updateUser({ password }); if (failure) throw failure;
      setPassword(''); setConfirm(''); setDone(true);
    } catch (failure) { setError((failure as Error).message || 'No se pudo cambiar la contraseña.'); }
    finally { setBusy(false); }
  };
  return <Frame title="Restablecer contraseña">{error && <InlineNotice tone="danger">{error}</InlineNotice>}{done ? <InlineNotice tone="success">Tu contraseña se actualizó correctamente.</InlineNotice> : <form className="space-y-4" onSubmit={submit}><label className="block text-sm font-semibold">Nueva contraseña<input className={inputClass} type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></label><label className="block text-sm font-semibold">Confirmar contraseña<input className={inputClass} type="password" autoComplete="new-password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} /></label><button disabled={busy} className={buttonClass}>{busy ? 'Guardando…' : 'Guardar contraseña'}</button></form>}<Link className="text-[#145C46] font-semibold" to="/cuenta">Ir a mi cuenta</Link></Frame>;
};

export const CallbackPage = () => {
  const { currentUser } = useDemoStore(); const [error, setError] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) setError('El enlace expiró o no es válido. Solicita uno nuevo.');
    // supabase-js detects and exchanges PKCE codes; do not exchange twice.
    const timer = window.setTimeout(() => setError('No se pudo confirmar la sesión. Abre el enlace en el mismo navegador donde iniciaste el registro o vuelve a acceder.'), 12_000);
    window.history.replaceState({}, '', '/auth/callback');
    return () => window.clearTimeout(timer);
  }, []);
  if (currentUser) return <Navigate to="/cuenta" replace />;
  return <Frame title="Confirmando tu acceso">{error ? <InlineNotice tone="danger">{error}</InlineNotice> : <p role="status">Comprobando la sesión…</p>}<Link className="text-[#145C46] font-semibold" to="/acceder">Volver a acceder</Link></Frame>;
};

export const AdminSetupPage = () => {
  const { currentUser } = useDemoStore(); const [token,setToken] = useState('');
  const [error,setError] = useState(''); const [busy,setBusy] = useState(false);
  if (!currentUser) return <Navigate to="/acceder?returnTo=%2Fconfigurar-admin" replace />;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try {
      const { error: failure } = await getSupabaseClient().rpc('eventin_claim_admin',{ token: token.trim() });
      if (failure) throw failure; setToken(''); window.location.assign('/admin');
    } catch (failure) { setError((failure as Error).message || 'No se pudo activar la cuenta.'); }
    finally { setBusy(false); }
  };
  return <Frame title="Activar administración"><p className="text-sm text-[#566A63]">Esta activación requiere el código de instalación del propietario y solo puede utilizarse una vez. Cuenta: {currentUser.email}</p>{error && <InlineNotice tone="danger">{error}</InlineNotice>}<form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">Código de instalación<input type="password" autoComplete="off" className={inputClass} required value={token} onChange={e => setToken(e.target.value)} /></label><button className={buttonClass} disabled={busy}>{busy ? 'Verificando…' : 'Activar mi cuenta administradora'}</button></form></Frame>;
};
