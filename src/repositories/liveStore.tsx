import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { authErrorMessage } from '../lib/authError';
import { DemoStoreContext, type DemoStoreContextValue, type DemoStoreState, type CommandResult } from './demoStore';
import type { User } from '../domain/types';

const emptyState: DemoStoreState = {
  users: [], currentUserId: null, publicEvents: [], businesses: [], services: [],
  privateEvents: [], memberships: [], budgetItems: [], tasks: [], invitations: [],
  quoteRequests: [], proposals: [], payments: [], subscriptions: [], reports: [],
  auditLog: [], notifications: [], favorites: [],
  settings: { businessMonthlyPen: 30, publicEventMonthlyPen: 100, beneficiaryConfigured: false,
    beneficiaryName: '', beneficiaryChannel: '', beneficiaryAccount: '', beneficiaryNote: 'Pagos deshabilitados. Integración Izipay pendiente.' },
};
const commandNames = ['toggleFavorite', 'markNotificationRead', 'markAllNotificationsRead',
  'createPrivateEvent', 'addProposedBusinessToEvent', 'addBudgetItem', 'toggleBudgetItemPaid',
  'addTask', 'toggleTask', 'createInvitation', 'revokeInvitation', 'acceptInvitation',
  'createQuoteRequest', 'saveProposalDraft', 'sendProposal', 'declineQuoteRequest', 'selectProposal',
  'saveBusinessDraft', 'saveService', 'savePublicEventDraft', 'submitPaymentProof', 'moderateContent',
  'reviewPayment', 'toggleUserSuspension', 'resolveReport', 'updatePlatformSettings'] as const;
type RemoteActions = Pick<DemoStoreContextValue, typeof commandNames[number]>;

export const LiveStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const requestNumber = useRef(0);
  const commandInFlight = useRef(false);
  const mounted = useRef(true);
  const authUserId = useRef<string | null | undefined>(undefined);
  const client = getSupabaseClient();

  const refresh = useCallback(async () => {
    const version = generation.current;
    const request = ++requestNumber.current;
    const { data, error: failure } = await client.rpc('eventin_snapshot');
    if (!mounted.current || version !== generation.current || request !== requestNumber.current) return;
    if (failure) throw failure;
    if (!data || !Array.isArray(data.users)) throw new Error('La respuesta del servidor no es válida.');
    setState(data as DemoStoreState);
    setError('');
  }, [client]);

  useEffect(() => {
    mounted.current = true;
    const load = () => { void refresh().catch(e => setError(e.message || 'No se pudo cargar Eventin.')).finally(() => setLoading(false)); };
    // The callback does no awaited Auth operations, avoiding auth-lock deadlocks.
    const { data: subscription } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return;
      const nextUserId = session?.user.id ?? null;
      // Supabase can emit SIGNED_IN again on window focus. Preserve open forms
      // when the identity did not change; polling still refreshes server data.
      if (authUserId.current === nextUserId) return;
      authUserId.current = nextUserId;
      generation.current++;
      setState(emptyState);
      setLoading(true);
      queueMicrotask(load);
    });
    load();
    const interval = window.setInterval(() => { if (document.visibilityState === 'visible' && !commandInFlight.current) load(); }, 20_000);
    const onFocus = () => { if (!commandInFlight.current) load(); };
    window.addEventListener('focus', onFocus);
    return () => { mounted.current = false; generation.current++; subscription.subscription.unsubscribe(); window.clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, [client, refresh]);

  const execute = async (action: string, args: unknown[]): Promise<CommandResult<any>> => {
    if (commandInFlight.current) return { ok: false, error: 'Espera a que termine la operación anterior.' };
    let input: Record<string, unknown> = (typeof args[0] === 'object' && args[0] !== null ? args[0] : {}) as Record<string, unknown>;
    if (['toggleBudgetItemPaid','toggleTask','revokeInvitation','sendProposal','selectProposal','markNotificationRead'].includes(action)) input = { id: args[0] };
    if (action === 'toggleFavorite') input = { kind: args[0], id: args[1] };
    if (action === 'addProposedBusinessToEvent') input = { privateEventId: args[0], businessId: args[1] };
    if (action === 'acceptInvitation') input = { token: args[0] };
    if (action === 'declineQuoteRequest') input = { id: args[0], reason: args[1] };
    if (action === 'savePublicEventDraft') {
      input = { ...input };
      for (const key of ['startsAt', 'endsAt']) {
        const date = input[key];
        if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) input[key] = `${date}:00-05:00`;
      }
    }
    if (action === 'saveProposalDraft' && typeof input.expiresAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.expiresAt)) input = { ...input, expiresAt: `${input.expiresAt}T23:59:59-05:00` };
    if (action === 'moderateContent') {
      const resource = (input.resourceKind === 'business' ? state.businesses : state.publicEvents).find(r => r.id === input.resourceId);
      input = { ...input, expectedVersion: resource?.version };
    }
    commandInFlight.current = true; setBusy(true); setError('');
    try {
      const { data, error: failure } = await client.rpc('eventin_command', { action, input });
      if (failure) throw failure;
      // A successful write is already durable. A failed refresh must not invite
      // the user to submit the same creation a second time.
      try { await refresh(); } catch { setError('El cambio se guardó. No se pudo actualizar la vista; vuelve a cargarla.'); }
      return { ok: true, data };
    } catch (e) {
      const message = e instanceof Error ? e.message : (e as { message?: string }).message || 'No se pudo guardar. Inténtalo de nuevo.';
      setError(message); return { ok: false, error: message };
    } finally { commandInFlight.current = false; setBusy(false); }
  };
  const remote = Object.fromEntries(commandNames.map(name => [name, (...args: unknown[]) => execute(name, args)])) as unknown as RemoteActions;
  const authResult = async (operation: () => Promise<{ data: { user: { id: string } | null }; error: { message: string } | null }>): Promise<CommandResult<User>> => {
    const { data, error: failure } = await operation();
    if (failure) return { ok: false, error: authErrorMessage(failure) };
    await refresh();
    return { ok: true, data: data.user ? { id: data.user.id } as User : undefined };
  };
  const value: DemoStoreContextValue = {
    ...state, ...remote, isDemoMode: false,
    currentUser: state.users.find(u => u.id === state.currentUserId) || null,
    switchDemoUser: () => { setError('El cambio de usuario demo está deshabilitado.'); },
    resetDemoData: () => { setError('Los datos reales no se restablecen desde esta opción.'); },
    isFavorite: (kind, id) => state.favorites.some(f => f.kind === kind && f.id === id),
    signInDemo: (email, password) => authResult(() => client.auth.signInWithPassword({ email, password })),
    registerDemo: async (name, email, phone, password) => {
      if (!password || password.length < 8) return { ok: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
      const { data, error: failure } = await client.auth.signUp({ email, password, options: { data: { name, phone }, emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (failure) return { ok: false, error: authErrorMessage(failure) };
      if (data.session) await refresh();
      return { ok: true, data: data.session && data.user ? { id: data.user.id } as User : undefined };
    },
    signOutDemo: async () => {
      const { error: failure } = await client.auth.signOut();
      if (failure) { setError(failure.message); return; }
      generation.current++; setState(emptyState); await refresh();
    },
  };
  if (loading) return <div role="status" className="min-h-dvh grid place-items-center text-[#145C46]">Cargando Eventin…</div>;
  return <DemoStoreContext.Provider value={value}>
    {error && <div role="alert" className="sticky top-0 z-50 border-b border-red-200 bg-red-50 p-3 text-center text-sm text-red-900">{error} <button type="button" className="underline ml-2" onClick={() => void refresh().catch(e => setError(e.message))}>Volver a cargar</button></div>}
    <div aria-busy={busy}>{children}</div>
  </DemoStoreContext.Provider>;
};
