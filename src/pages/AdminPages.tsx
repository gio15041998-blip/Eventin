import React, { useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  CalendarCheck,
  CreditCard,
  Flag,
  History,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react';
import type { AdminCapability } from '../domain/types';
import {
  formatDateTime,
  formatPen,
  formatShortDate,
  hasAdminCapability,
  isPublicEventVisible,
} from '../domain/predicates';
import { useDemoStore } from '../repositories/demoStore';
import { AdminShell } from '../components/ui/Shells';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import {
  BackButton,
  EmptyState,
  GuardDenied403,
  NotFound404,
} from '../components/ui/StateBlocks';
import {
  InlineNotice,
  StatusBadge,
  mapModerationStatus,
  mapPaymentStatus,
} from '../components/ui/StatusBadge';

const AdminGuard: React.FC<{
  capability: AdminCapability;
  children: React.ReactNode;
}> = ({ capability, children }) => {
  const { currentUser } = useDemoStore();
  if (!hasAdminCapability(currentUser, capability)) {
    return (
      <AdminShell>
        <GuardDenied403
          title="Capacidad administrativa requerida (403)"
          description={`Esta vista requiere el permiso ${capability}. Puedes cambiar de actor demostrativo en Mi cuenta para probar los distintos niveles de moderación y administración.`}
        />
      </AdminShell>
    );
  }
  return <AdminShell>{children}</AdminShell>;
};

export const AdminHomePage: React.FC = () => {
  const {
    publicEvents,
    businesses,
    payments,
    reports,
    auditLog,
    subscriptions,
  } = useDemoStore();

  const pendingEvents = publicEvents.filter((e) => e.contentStatus === 'pending').length;
  const pendingBiz = businesses.filter((b) => b.contentStatus === 'pending').length;
  const pendingPayments = payments.filter((p) => p.status === 'proof_received').length;
  const openReports = reports.filter((r) => r.status === 'open').length;

  return (
    <AdminGuard capability="ADMIN">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28]">
            Resumen administrativo
          </h1>
          <p className="text-sm text-[#566A63] mt-1">
            Cola de moderación, comprobantes por cotejar y trazabilidad operativa en entorno demo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              to: '/admin/eventos',
              title: 'Eventos por revisar',
              count: pendingEvents,
              sub: `${publicEvents.length} totales en plataforma`,
              icon: CalendarCheck,
            },
            {
              to: '/admin/negocios',
              title: 'Negocios por revisar',
              count: pendingBiz,
              sub: `${businesses.length} fichas registradas`,
              icon: Store,
            },
            {
              to: '/admin/pagos',
              title: 'Comprobantes pendientes',
              count: pendingPayments,
              sub: `${subscriptions.length} suscripciones activas/pendientes`,
              icon: CreditCard,
            },
            {
              to: '/admin/reportes',
              title: 'Reportes abiertos',
              count: openReports,
              sub: `${auditLog.length} acciones en bitácora`,
              icon: Flag,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.to}
                to={card.to}
                className="bg-white border border-[#DCE4DF] hover:border-[#145C46] rounded-[16px] p-5 no-underline transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#566A63]">{card.title}</span>
                  <Icon className="w-5 h-5 text-[#145C46]" aria-hidden="true" />
                </div>
                <p className="text-3xl font-extrabold text-[#172D28] tabular-nums">
                  {card.count}
                </p>
                <p className="text-xs text-[#566A63] mt-1">{card.sub}</p>
              </Link>
            );
          })}
        </div>

        <section className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-[#172D28]">Últimos movimientos</h2>
            <Link
              to="/admin/actividad"
              className="text-sm font-semibold text-[#145C46] no-underline hover:underline"
            >
              Ver registro completo →
            </Link>
          </div>
          <div className="divide-y divide-[#DCE4DF]">
            {auditLog.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[#172D28]">{item.resourceTitle}</p>
                  <p className="text-xs text-[#566A63]">
                    {item.action} · {item.actorName} · {item.reason}
                  </p>
                </div>
                <span className="text-xs text-[#566A63] shrink-0">
                  {formatDateTime(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminGuard>
  );
};

export const AdminEventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { publicEvents } = useDemoStore();
  const q = (searchParams.get('q') || '').toLowerCase();
  const estado = searchParams.get('estado') || 'todos';

  const filtered = publicEvents.filter((e) => {
    if (estado !== 'todos' && e.contentStatus !== estado) return false;
    if (q && !`${e.title} ${e.zone} ${e.organizerName}`.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  return (
    <AdminGuard capability="ADMIN_EVENT_REVIEW">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#172D28]">Bandeja de eventos</h1>
            <p className="text-sm text-[#566A63]">
              Aprobar contenido es independiente del pago verificado del plan de S/ 100/mes.
            </p>
          </div>
          <input
            type="search"
            value={searchParams.get('q') || ''}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set('q', e.target.value);
              else next.delete('q');
              setSearchParams(next);
            }}
            placeholder="Buscar evento o zona..."
            className="min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-white text-sm w-full sm:w-64"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['todos', 'pending', 'observed', 'approved', 'suspended'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={async () => {
                const next = new URLSearchParams(searchParams);
                if (key === 'todos') next.delete('estado');
                else next.set('estado', key);
                setSearchParams(next);
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-[12px] text-xs font-semibold border cursor-pointer ${
                estado === key
                  ? 'bg-[#145C46] border-[#145C46] text-white'
                  : 'bg-white border-[#DCE4DF] text-[#172D28]'
              }`}
            >
              {key === 'todos' ? 'Todos' : mapModerationStatus(key).label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((evt) => (
            <Link
              key={evt.id}
              to={`/admin/eventos/${evt.id}`}
              className="block bg-white border border-[#DCE4DF] hover:border-[#145C46] rounded-[16px] p-4 no-underline"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge {...mapModerationStatus(evt.contentStatus)} />
                    <StatusBadge {...mapPaymentStatus(evt.paymentStatus)} />
                  </div>
                  <h2 className="text-base font-bold text-[#172D28]">{evt.title}</h2>
                  <p className="text-xs text-[#566A63]">
                    {evt.zone} · {evt.organizerName} · Versión {evt.version}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#145C46] shrink-0">
                  Revisar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
};

export const AdminEventDetailPage: React.FC = () => {
  const { publicEventId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { publicEvents, moderateContent } = useDemoStore();
  const [approveReason, setApproveReason] = useState(
    'Contenido completo, horario claro y categoría adecuada.'
  );

  const event = publicEvents.find((e) => e.id === publicEventId);
  const showApproveModal = searchParams.get('modal') === 'approve';

  const handleApprove = async () => {
    if (!event) return;
    const outcome = await moderateContent({
      resourceKind: 'public_event',
      resourceId: event.id,
      decision: 'approved',
      reason: approveReason,
    });
    if (!outcome.ok) return;
    setSearchParams({});
  };

  return (
    <AdminGuard capability="ADMIN_EVENT_REVIEW">
      {!event ? (
        <NotFound404 title="Evento no encontrado" />
      ) : (
        <div className="max-w-3xl space-y-6">
          <div>
            <BackButton fallbackTo="/admin/eventos" label="Bandeja de eventos" />
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge {...mapModerationStatus(event.contentStatus)} />
              <StatusBadge {...mapPaymentStatus(event.paymentStatus)} />
              {isPublicEventVisible(event) && (
                <StatusBadge tone="brand" label="Visible en cartelera" />
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
              {event.title}
            </h1>
          </div>

          <InlineNotice tone="info" title="Regla de visibilidad dual">
            Aprobar este evento cambia únicamente <strong>contentStatus</strong>. Para hacerse visible al público también requiere pago verificado en Pagos (S/ 100/mes) y horario vigente.
          </InlineNotice>

          <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-3 text-sm">
            <p className="text-[#172D28] leading-relaxed">{event.description}</p>
            <p className="text-xs text-[#566A63]">
              Dirección: {event.address} · {formatDateTime(event.startsAt)} —{' '}
              {formatDateTime(event.endsAt)}
            </p>
            {event.observationNote && (
              <InlineNotice tone="warning" title="Última observación registrada">
                {event.observationNote}
              </InlineNotice>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSearchParams({ modal: 'approve' })}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
            >
              Aprobar contenido
            </button>
            <Link
              to={`/admin/eventos/${event.id}/decision`}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#F5C6C6] bg-[#FDECEC] text-[#B53737] text-sm font-semibold inline-flex items-center no-underline"
            >
              Observar, rechazar o suspender
            </Link>
          </div>

          <ConfirmModal
            open={showApproveModal}
            title="Aprobar contenido del evento"
            description="El estado de contenido pasará a aprobado y quedará registrado en el historial de actividad."
            confirmLabel="Confirmar aprobación"
            onConfirm={handleApprove}
            onCancel={() => setSearchParams({})}
          >
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#172D28]">Nota de revisión</span>
              <input
                type="text"
                value={approveReason}
                onChange={(e) => setApproveReason(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] text-sm"
              />
            </label>
          </ConfirmModal>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminEventDecisionPage: React.FC = () => {
  const { publicEventId } = useParams();
  const navigate = useNavigate();
  const { publicEvents, moderateContent } = useDemoStore();
  const event = publicEvents.find((e) => e.id === publicEventId);

  const [decision, setDecision] = useState<'observed' | 'rejected' | 'suspended'>(
    'observed'
  );
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setError(null);
    const res = await moderateContent({
      resourceKind: 'public_event',
      resourceId: event.id,
      decision,
      reason,
    });
    if (!res.ok) {
      setError(res.error || 'Ingresa un motivo obligatorio.');
      return;
    }
    navigate(`/admin/eventos/${event.id}`);
  };

  return (
    <AdminGuard capability="ADMIN_EVENT_REVIEW">
      {!event ? (
        <NotFound404 title="Evento no encontrado" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <div>
            <BackButton
              fallbackTo={`/admin/eventos/${event.id}`}
              label="Volver al evento"
            />
            <h1 className="text-2xl font-extrabold text-[#172D28] mt-2">
              Decisión sobre: {event.title}
            </h1>
          </div>
          {error && <InlineNotice tone="danger">{error}</InlineNotice>}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-4"
          >
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">Resultado</span>
              <select
                value={decision}
                onChange={(e) =>
                  setDecision(e.target.value as 'observed' | 'rejected' | 'suspended')
                }
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm bg-white"
              >
                <option value="observed">Solicitar cambios (Observado)</option>
                <option value="rejected">Rechazar publicación</option>
                <option value="suspended">Suspender por incumplimiento</option>
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">
                Motivo obligatorio (visible para el organizador)
              </span>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Detalla qué debe corregirse o el motivo de suspensión..."
                className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
                required
              />
            </label>
            <div className="flex justify-end gap-3">
              <Link
                to={`/admin/eventos/${event.id}`}
                className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#B53737] text-white text-sm font-bold cursor-pointer"
              >
                Guardar decisión
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminBusinessesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { businesses } = useDemoStore();
  const q = (searchParams.get('q') || '').toLowerCase();
  const estado = searchParams.get('estado') || 'todos';

  const filtered = businesses.filter((b) => {
    if (estado !== 'todos' && b.contentStatus !== estado) return false;
    if (q && !`${b.name} ${b.zone} ${b.category}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <AdminGuard capability="ADMIN_BUSINESS_REVIEW">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#172D28]">Bandeja de negocios</h1>
            <p className="text-sm text-[#566A63]">
              Revisa fichas comerciales antes de habilitarlas en catálogo y mapa.
            </p>
          </div>
          <input
            type="search"
            value={searchParams.get('q') || ''}
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              if (e.target.value) next.set('q', e.target.value);
              else next.delete('q');
              setSearchParams(next);
            }}
            placeholder="Buscar negocio o distrito..."
            className="min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-white text-sm w-full sm:w-64"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((biz) => (
            <Link
              key={biz.id}
              to={`/admin/negocios/${biz.id}`}
              className="block bg-white border border-[#DCE4DF] hover:border-[#145C46] rounded-[16px] p-4 no-underline"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1.5">
                    <StatusBadge {...mapModerationStatus(biz.contentStatus)} />
                    <StatusBadge {...mapPaymentStatus(biz.paymentStatus)} />
                  </div>
                  <h2 className="text-base font-bold text-[#172D28]">{biz.name}</h2>
                  <p className="text-xs text-[#566A63]">
                    {biz.category} · {biz.zone} · Versión {biz.version}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#145C46]">Revisar →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
};

export const AdminBusinessDetailPage: React.FC = () => {
  const { businessId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { businesses, moderateContent } = useDemoStore();
  const [reason, setReason] = useState('Ficha comercial verificada y completa.');

  const biz = businesses.find((b) => b.id === businessId);
  const showModal = searchParams.get('modal') === 'approve';

  const handleApprove = async () => {
    if (!biz) return;
    const outcome = await moderateContent({
      resourceKind: 'business',
      resourceId: biz.id,
      decision: 'approved',
      reason,
    });
    if (!outcome.ok) return;
    setSearchParams({});
  };

  return (
    <AdminGuard capability="ADMIN_BUSINESS_REVIEW">
      {!biz ? (
        <NotFound404 title="Negocio no encontrado" />
      ) : (
        <div className="max-w-3xl space-y-6">
          <div>
            <BackButton fallbackTo="/admin/negocios" label="Bandeja de negocios" />
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge {...mapModerationStatus(biz.contentStatus)} />
              <StatusBadge {...mapPaymentStatus(biz.paymentStatus)} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
              {biz.name}
            </h1>
          </div>

          <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-3 text-sm">
            <p>{biz.description}</p>
            <p className="text-xs text-[#566A63]">
              Cobertura: {biz.coverageZones.join(', ')} · WhatsApp: {biz.whatsappPhone}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSearchParams({ modal: 'approve' })}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold cursor-pointer"
            >
              Aprobar contenido del negocio
            </button>
            <Link
              to={`/admin/negocios/${biz.id}/decision`}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#F5C6C6] bg-[#FDECEC] text-[#B53737] text-sm font-semibold inline-flex items-center no-underline"
            >
              Observar o suspender
            </Link>
          </div>

          <ConfirmModal
            open={showModal}
            title="Aprobar ficha de negocio"
            description="El contenido quedará aprobado. La visibilidad pública también requiere comprobante verificado de S/ 30/mes."
            confirmLabel="Confirmar aprobación"
            onConfirm={handleApprove}
            onCancel={() => setSearchParams({})}
          >
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] text-sm"
            />
          </ConfirmModal>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminBusinessDecisionPage: React.FC = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { businesses, moderateContent } = useDemoStore();
  const biz = businesses.find((b) => b.id === businessId);
  const [decision, setDecision] = useState<'observed' | 'rejected' | 'suspended'>(
    'observed'
  );
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biz) return;
    setError(null);
    const res = await moderateContent({
      resourceKind: 'business',
      resourceId: biz.id,
      decision,
      reason,
    });
    if (!res.ok) {
      setError(res.error || 'Ingresa el motivo.');
      return;
    }
    navigate(`/admin/negocios/${biz.id}`);
  };

  return (
    <AdminGuard capability="ADMIN_BUSINESS_REVIEW">
      {!biz ? (
        <NotFound404 title="Negocio no encontrado" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <div>
            <BackButton
              fallbackTo={`/admin/negocios/${biz.id}`}
              label="Volver al negocio"
            />
            <h1 className="text-2xl font-extrabold text-[#172D28] mt-2">
              Observaciones sobre: {biz.name}
            </h1>
          </div>
          {error && <InlineNotice tone="danger">{error}</InlineNotice>}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-4"
          >
            <select
              value={decision}
              onChange={(e) =>
                setDecision(e.target.value as 'observed' | 'rejected' | 'suspended')
              }
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm bg-white"
            >
              <option value="observed">Solicitar correcciones (Observado)</option>
              <option value="rejected">Rechazar ficha</option>
              <option value="suspended">Suspender ficha</option>
            </select>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Indica exactamente qué debe corregir el proveedor..."
              className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
              required
            />
            <div className="flex justify-end gap-3">
              <Link
                to={`/admin/negocios/${biz.id}`}
                className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#B53737] text-white text-sm font-bold cursor-pointer"
              >
                Registrar decisión
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminPaymentsPage: React.FC = () => {
  const { payments } = useDemoStore();

  return (
    <AdminGuard capability="ADMIN_PAYMENT_VERIFY">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172D28]">Bandeja de pagos</h1>
          <p className="text-sm text-[#566A63]">
            Comprobantes de negocios (S/ 30) y eventos públicos (S/ 100) pendientes de cotejo.
          </p>
        </div>

        <div className="space-y-3">
          {payments.map((pay) => {
            const st = mapPaymentStatus(pay.status);
            return (
              <Link
                key={pay.id}
                to={`/admin/pagos/${pay.id}`}
                className="block bg-white border border-[#DCE4DF] hover:border-[#145C46] rounded-[16px] p-4 no-underline"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={st.tone} label={st.label} />
                      <span className="text-xs font-semibold text-[#566A63]">
                        {pay.resourceKind === 'business' ? 'Negocio' : 'Evento público'} ·{' '}
                        {pay.orderId}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-[#172D28]">
                      {pay.resourceTitle}
                    </h2>
                    <p className="text-xs text-[#566A63]">
                      Ref. {pay.proofReference} · {pay.ownerName}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-extrabold text-[#145C46] tabular-nums">
                      {formatPen(pay.amountPen)}
                    </p>
                    <p className="text-xs font-semibold text-[#145C46]">Cotejar →</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AdminGuard>
  );
};

export const AdminPaymentDetailPage: React.FC = () => {
  const { paymentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { payments, reviewPayment } = useDemoStore();
  const [note, setNote] = useState('Operación verificada en conciliación demo.');

  const pay = payments.find((p) => p.id === paymentId);
  const showVerifyModal = searchParams.get('modal') === 'verify';

  const handleVerify = async () => {
    if (!pay) return;
    const outcome = await reviewPayment({ paymentId: pay.id, decision: 'verified', reason: note });
    if (!outcome.ok) return;
    setSearchParams({});
  };

  return (
    <AdminGuard capability="ADMIN_PAYMENT_VERIFY">
      {!pay ? (
        <NotFound404 title="Pago no encontrado" />
      ) : (
        <div className="max-w-3xl space-y-6">
          <div>
            <BackButton fallbackTo="/admin/pagos" label="Bandeja de pagos" />
            <div className="mt-2">
              <StatusBadge {...mapPaymentStatus(pay.status)} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
              {pay.orderId} · {pay.resourceTitle}
            </h1>
          </div>

          <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[#566A63]">Titular</span>
              <span className="font-bold text-[#172D28]">{pay.ownerName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#566A63]">Importe</span>
              <span className="font-extrabold text-[#145C46] tabular-nums">
                {formatPen(pay.amountPen)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#566A63]">Referencia</span>
              <span className="font-bold text-[#172D28]">{pay.proofReference}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#566A63]">Archivo adjunto</span>
              <span className="font-semibold text-[#172D28]">{pay.proofFileName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#566A63]">Periodo</span>
              <span className="font-semibold text-[#172D28]">{pay.periodLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSearchParams({ modal: 'verify' })}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold cursor-pointer"
            >
              Verificar pago y activar periodo
            </button>
            <Link
              to={`/admin/pagos/${pay.id}/observacion`}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#F5C6C6] bg-[#FDECEC] text-[#B53737] text-sm font-semibold inline-flex items-center no-underline"
            >
              Solicitar corrección
            </Link>
          </div>

          <ConfirmModal
            open={showVerifyModal}
            title="Confirmar verificación de pago"
            description="Activará el periodo vigente de la suscripción correspondiente (si el contenido también está aprobado, quedará visible)."
            confirmLabel="Verificar pago"
            onConfirm={handleVerify}
            onCancel={() => setSearchParams({})}
          >
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] text-sm"
            />
          </ConfirmModal>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminPaymentObservationPage: React.FC = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { payments, reviewPayment } = useDemoStore();
  const pay = payments.find((p) => p.id === paymentId);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pay) return;
    setError(null);
    const res = await reviewPayment({ paymentId: pay.id, decision: 'observed', reason });
    if (!res.ok) {
      setError(res.error || 'Ingresa el motivo.');
      return;
    }
    navigate(`/admin/pagos/${pay.id}`);
  };

  return (
    <AdminGuard capability="ADMIN_PAYMENT_VERIFY">
      {!pay ? (
        <NotFound404 title="Pago no encontrado" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <div>
            <BackButton
              fallbackTo={`/admin/pagos/${pay.id}`}
              label="Volver al comprobante"
            />
            <h1 className="text-2xl font-extrabold text-[#172D28] mt-2">
              Solicitar corrección · {pay.orderId}
            </h1>
          </div>
          {error && <InlineNotice tone="danger">{error}</InlineNotice>}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-4"
          >
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej. Imagen borrosa o número de operación no coincide con el monto..."
              className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
              required
            />
            <div className="flex justify-end gap-3">
              <Link
                to={`/admin/pagos/${pay.id}`}
                className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#B53737] text-white text-sm font-bold cursor-pointer"
              >
                Marcar como observado
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminSubscriptionsPage: React.FC = () => {
  const { subscriptions } = useDemoStore();

  return (
    <AdminGuard capability="ADMIN_SUBSCRIPTION">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172D28]">
            Vigencias y suscripciones
          </h1>
          <p className="text-sm text-[#566A63]">
            Control mensual de planes de S/ 30 (negocios) y S/ 100 (eventos públicos).
          </p>
        </div>

        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <Link
              key={sub.id}
              to={`/admin/suscripciones/${sub.id}`}
              className="block bg-white border border-[#DCE4DF] hover:border-[#145C46] rounded-[16px] p-4 no-underline"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-[#172D28]">
                    {sub.resourceTitle}
                  </p>
                  <p className="text-xs text-[#566A63]">
                    {sub.resourceKind === 'business' ? 'Negocio S/ 30' : 'Evento S/ 100'} ·{' '}
                    {formatShortDate(sub.periodStart)} – {formatShortDate(sub.periodEnd)}
                  </p>
                </div>
                <StatusBadge
                  tone={sub.status === 'active' ? 'success' : 'warning'}
                  label={sub.status === 'active' ? 'Activa' : 'Pago pendiente'}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
};

export const AdminSubscriptionDetailPage: React.FC = () => {
  const { subscriptionId } = useParams();
  const { subscriptions, payments } = useDemoStore();
  const sub = subscriptions.find((s) => s.id === subscriptionId);
  const linkedPayment = sub?.latestPaymentId
    ? payments.find((p) => p.id === sub.latestPaymentId)
    : undefined;

  return (
    <AdminGuard capability="ADMIN_SUBSCRIPTION">
      {!sub ? (
        <NotFound404 title="Suscripción no encontrada" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <div>
            <BackButton
              fallbackTo="/admin/suscripciones"
              label="Vigencias y renovaciones"
            />
            <h1 className="text-2xl font-extrabold text-[#172D28] mt-2">
              {sub.resourceTitle}
            </h1>
          </div>

          <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#566A63]">Titular</span>
              <span className="font-bold text-[#172D28]">{sub.ownerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#566A63]">Tarifa</span>
              <span className="font-extrabold text-[#145C46] tabular-nums">
                {formatPen(sub.planAmountPen)} / mes
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#566A63]">Vigencia</span>
              <span className="font-semibold text-[#172D28]">
                {formatShortDate(sub.periodStart)} – {formatShortDate(sub.periodEnd)}
              </span>
            </div>
            {linkedPayment && (
              <div className="pt-2">
                <Link
                  to={`/admin/pagos/${linkedPayment.id}`}
                  className="text-sm font-bold text-[#145C46] no-underline hover:underline"
                >
                  Ver cobro asociado ({linkedPayment.orderId}) →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminUsersPage: React.FC = () => {
  const { users } = useDemoStore();

  return (
    <AdminGuard capability="ADMIN_USER_MANAGE">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172D28]">
            Usuarios y capacidades
          </h1>
          <p className="text-sm text-[#566A63]">
            Revisa capacidades activas y estado de cuenta.
          </p>
        </div>

        <div className="space-y-3">
          {users.map((u) => (
            <Link
              key={u.id}
              to={`/admin/usuarios/${u.id}`}
              className="block bg-white border border-[#DCE4DF] hover:border-[#145C46] rounded-[16px] p-4 no-underline"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-[#172D28]">{u.name}</p>
                  <p className="text-xs text-[#566A63]">
                    {u.email} · {u.capabilities.join(', ')}
                  </p>
                </div>
                <StatusBadge
                  tone={u.accountStatus === 'active' ? 'success' : 'danger'}
                  label={u.accountStatus === 'active' ? 'Activa' : 'Suspendida'}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
};

export const AdminUserDetailPage: React.FC = () => {
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { users, toggleUserSuspension } = useDemoStore();
  const [reason, setReason] = useState('');

  const user = users.find((u) => u.id === userId);
  const showSuspendModal = searchParams.get('modal') === 'suspend';

  const handleToggle = async (suspend: boolean) => {
    if (!user) return;
    const outcome = await toggleUserSuspension({
      userId: user.id,
      suspend,
      reason: suspend ? reason : 'Reactivación verificada.',
    });
    if (!outcome.ok) return;
    setSearchParams({});
  };

  return (
    <AdminGuard capability="ADMIN_USER_MANAGE">
      {!user ? (
        <NotFound404 title="Usuario no encontrado" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <div>
            <BackButton fallbackTo="/admin/usuarios" label="Usuarios" />
            <div className="mt-2">
              <StatusBadge
                tone={user.accountStatus === 'active' ? 'success' : 'danger'}
                label={user.accountStatus === 'active' ? 'Cuenta activa' : 'Suspendida'}
              />
            </div>
            <h1 className="text-2xl font-extrabold text-[#172D28] mt-2">
              {user.name}
            </h1>
          </div>

          <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-2 text-sm">
            <p>Correo: {user.email}</p>
            <p>Teléfono: {user.phone}</p>
            <p>Capacidades: {user.capabilities.join(', ')}</p>
            <p>
              Permisos admin:{' '}
              {user.adminCapabilities.length > 0
                ? user.adminCapabilities.join(', ')
                : 'Ninguno'}
            </p>
          </div>

          {user.accountStatus === 'active' ? (
            <button
              type="button"
              onClick={() => setSearchParams({ modal: 'suspend' })}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#B53737] text-white text-sm font-bold cursor-pointer"
            >
              Suspender cuenta
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleToggle(false)}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold cursor-pointer"
            >
              Reactivar cuenta
            </button>
          )}

          <ConfirmModal
            open={showSuspendModal}
            title="Suspender cuenta de usuario"
            description="La cuenta quedará bloqueada para iniciar sesión o gestionar recursos."
            confirmLabel="Confirmar suspensión"
            tone="danger"
            onConfirm={() => handleToggle(true)}
            onCancel={() => setSearchParams({})}
          >
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo obligatorio de suspensión..."
              className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] text-sm"
            />
          </ConfirmModal>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminReportsPage: React.FC = () => {
  const { reports } = useDemoStore();

  return (
    <AdminGuard capability="ADMIN_REPORT_MANAGE">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172D28]">Bandeja de reportes</h1>
          <p className="text-sm text-[#566A63]">
            Incidencias abiertas sobre eventos públicos o fichas de negocio.
          </p>
        </div>
        {reports.length === 0 ? (
          <EmptyState
            title="Sin reportes pendientes"
            description="No hay incidencias registradas."
          />
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <Link
                key={rep.id}
                to={`/admin/reportes/${rep.id}`}
                className="block bg-white border border-[#DCE4DF] hover:border-[#145C46] rounded-[16px] p-4 no-underline"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-[#172D28]">
                      {rep.resourceTitle}
                    </p>
                    <p className="text-xs text-[#566A63]">
                      {rep.reason} · {formatDateTime(rep.createdAt)}
                    </p>
                  </div>
                  <StatusBadge
                    tone={rep.status === 'open' ? 'warning' : 'success'}
                    label={
                      rep.status === 'open'
                        ? 'Abierto'
                        : rep.status === 'resolved'
                        ? 'Resuelto'
                        : 'Desestimado'
                    }
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
};

export const AdminReportDetailPage: React.FC = () => {
  const { reportId } = useParams();
  const { reports } = useDemoStore();
  const rep = reports.find((r) => r.id === reportId);

  return (
    <AdminGuard capability="ADMIN_REPORT_MANAGE">
      {!rep ? (
        <NotFound404 title="Reporte no encontrado" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <div>
            <BackButton fallbackTo="/admin/reportes" label="Bandeja de reportes" />
            <h1 className="text-2xl font-extrabold text-[#172D28] mt-2">
              {rep.resourceTitle}
            </h1>
          </div>

          <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-3 text-sm">
            <p className="font-bold text-[#172D28]">{rep.reason}</p>
            <p className="text-[#566A63]">{rep.reporterNote}</p>
            {rep.resolutionNote && (
              <InlineNotice tone="success" title="Resolución registrada">
                {rep.resolutionNote}
              </InlineNotice>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/admin/reportes/${rep.id}/resolver`}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center no-underline"
            >
              Resolver reporte
            </Link>
            <Link
              to={
                rep.resourceKind === 'public_event'
                  ? `/admin/eventos/${rep.resourceId}`
                  : `/admin/negocios/${rep.resourceId}`
              }
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#DCE4DF] bg-white text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
            >
              Ver recurso reportado
            </Link>
          </div>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminReportResolvePage: React.FC = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { reports, resolveReport } = useDemoStore();
  const rep = reports.find((r) => r.id === reportId);
  const [status, setStatus] = useState<'resolved' | 'dismissed'>('resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [suspendResource, setSuspendResource] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rep) return;
    setError(null);
    const res = await resolveReport({
      reportId: rep.id,
      status,
      resolutionNote,
      suspendResource,
    });
    if (!res.ok) {
      setError(res.error || 'Ingresa el detalle de resolución.');
      return;
    }
    navigate(`/admin/reportes/${rep.id}`);
  };

  return (
    <AdminGuard capability="ADMIN_REPORT_MANAGE">
      {!rep ? (
        <NotFound404 title="Reporte no encontrado" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <div>
            <BackButton
              fallbackTo={`/admin/reportes/${rep.id}`}
              label="Volver al reporte"
            />
            <h1 className="text-2xl font-extrabold text-[#172D28] mt-2">
              Resolver reporte · {rep.resourceTitle}
            </h1>
          </div>
          {error && <InlineNotice tone="danger">{error}</InlineNotice>}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-4"
          >
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'resolved' | 'dismissed')}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm bg-white"
            >
              <option value="resolved">Marcar como resuelto</option>
              <option value="dismissed">Desestimar reporte</option>
            </select>
            <textarea
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="Detalla la acción tomada..."
              className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
              required
            />
            <label className="flex items-center gap-2.5 text-sm font-semibold text-[#172D28] cursor-pointer">
              <input
                type="checkbox"
                checked={suspendResource}
                onChange={(e) => setSuspendResource(e.target.checked)}
                className="w-4 h-4 accent-[#145C46]"
              />
              <span>Suspender publicación asociada al resolver</span>
            </label>
            <div className="flex justify-end gap-3">
              <Link
                to={`/admin/reportes/${rep.id}`}
                className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold cursor-pointer"
              >
                Guardar resolución
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminGuard>
  );
};

export const AdminAuditPage: React.FC = () => {
  const { auditLog } = useDemoStore();

  return (
    <AdminGuard capability="ADMIN_AUDIT_READ">
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172D28]">
            Registro de actividad
          </h1>
          <p className="text-sm text-[#566A63]">
            Historial auditable de moderaciones, verificaciones de pago y suspensiones.
          </p>
        </div>
        <div className="bg-white border border-[#DCE4DF] rounded-[16px] divide-y divide-[#DCE4DF]">
          {auditLog.map((entry) => (
            <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-[#172D28]">{entry.resourceTitle}</p>
                <p className="text-xs text-[#566A63]">
                  {entry.action} · {entry.previousState} → {entry.newState} · {entry.actorName}
                </p>
                <p className="text-xs text-[#172D28]">{entry.reason}</p>
              </div>
              <span className="text-xs text-[#566A63] shrink-0">
                {formatDateTime(entry.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
};

export const AdminSettingsPage: React.FC = () => {
  const { settings, updatePlatformSettings } = useDemoStore();
  const [businessMonthlyPen, setBusinessMonthlyPen] = useState(
    String(settings.businessMonthlyPen)
  );
  const [publicEventMonthlyPen, setPublicEventMonthlyPen] = useState(
    String(settings.publicEventMonthlyPen)
  );
  const [beneficiaryConfigured, setBeneficiaryConfigured] = useState(
    settings.beneficiaryConfigured
  );
  const [beneficiaryName, setBeneficiaryName] = useState(settings.beneficiaryName);
  const [beneficiaryChannel, setBeneficiaryChannel] = useState(
    settings.beneficiaryChannel
  );
  const [beneficiaryAccount, setBeneficiaryAccount] = useState(
    settings.beneficiaryAccount
  );
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const outcome = await updatePlatformSettings({
      businessMonthlyPen: Number(businessMonthlyPen) || 30,
      publicEventMonthlyPen: Number(publicEventMonthlyPen) || 100,
      beneficiaryConfigured,
      beneficiaryName,
      beneficiaryChannel,
      beneficiaryAccount,
      beneficiaryNote: settings.beneficiaryNote,
    });
    if (!outcome.ok) return;
    setSaved(true);
  };

  return (
    <AdminGuard capability="ADMIN_CONFIG_MANAGE">
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172D28]">
            Tarifas y canales de cobro
          </h1>
          <p className="text-sm text-[#566A63]">
            Los valores de producción deberán gestionarse en backend; aquí puedes probar la vista de beneficiario configurado en demo.
          </p>
        </div>

        {saved && (
          <InlineNotice tone="success">
            Configuración demostrativa actualizada y registrada en la bitácora.
          </InlineNotice>
        )}

        <form
          onSubmit={handleSave}
          className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">
                Tarifa negocio mensual (PEN)
              </span>
              <input
                type="number"
                value={businessMonthlyPen}
                onChange={(e) => setBusinessMonthlyPen(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm tabular-nums"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">
                Tarifa evento mensual (PEN)
              </span>
              <input
                type="number"
                value={publicEventMonthlyPen}
                onChange={(e) => setPublicEventMonthlyPen(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm tabular-nums"
              />
            </label>
          </div>

          <label className="flex items-center gap-2.5 min-h-[44px] cursor-pointer">
            <input
              type="checkbox"
              checked={beneficiaryConfigured}
              onChange={(e) => setBeneficiaryConfigured(e.target.checked)}
              className="w-4 h-4 accent-[#145C46]"
            />
            <span className="text-sm font-semibold text-[#172D28]">
              Simular canal de cobro demo configurado
            </span>
          </label>

          {beneficiaryConfigured && (
            <div className="grid grid-cols-1 gap-3 pt-1">
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="Titular demo (ej. Eventin Demo SAC)"
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
              />
              <input
                type="text"
                value={beneficiaryChannel}
                onChange={(e) => setBeneficiaryChannel(e.target.value)}
                placeholder="Canal (ej. Transferencia / Billetera demo)"
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
              />
              <input
                type="text"
                value={beneficiaryAccount}
                onChange={(e) => setBeneficiaryAccount(e.target.value)}
                placeholder="Código demo de prueba"
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
              />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold cursor-pointer"
            >
              Guardar configuración
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
};
