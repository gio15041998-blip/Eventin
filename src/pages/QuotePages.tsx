import React, { useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { CheckCircle2, Scale } from 'lucide-react';
import {
  canAccessPrivateEvent,
  formatPen,
  formatShortDate,
  isBusinessVisible,
  isProposalActionable,
  isProposalExpired,
} from '../domain/predicates';
import { useDemoStore } from '../repositories/demoStore';
import { PlannerLayout } from '../components/ui/Shells';
import {
  BackButton,
  EmptyState,
  GuardDenied403,
  NotFound404,
} from '../components/ui/StateBlocks';
import {
  InlineNotice,
  StatusBadge,
  mapQuoteStatus,
} from '../components/ui/StatusBadge';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const QuoteListPage: React.FC = () => {
  const { privateEventId } = useParams();
  const {
    currentUser,
    privateEvents,
    memberships,
    quoteRequests,
    proposals,
  } = useDemoStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const event = privateEvents.find((e) => e.id === privateEventId);
  if (!event) return <NotFound404 />;
  if (!canAccessPrivateEvent(event.id, currentUser?.id ?? null, memberships)) {
    return <GuardDenied403 />;
  }

  const estado = searchParams.get('estado') ?? 'todas';
  const eventRequests = quoteRequests.filter((r) => r.privateEventId === event.id);
  const eventProposals = proposals.filter(
    (p) => p.privateEventId === event.id && p.status !== 'draft'
  );

  const filteredRequests =
    estado === 'todas'
      ? eventRequests
      : eventRequests.filter((r) => r.status === estado);

  return (
    <PlannerLayout
      privateEventId={event.id}
      title="Cotizaciones del evento"
      subtitle={`Solicitudes enviadas y propuestas recibidas para ${event.title}`}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex p-1 bg-white border border-[#DCE4DF] rounded-[12px]">
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'pending', label: 'Pendientes' },
              { id: 'responded', label: 'Con propuesta' },
              { id: 'closed', label: 'Elegidas' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setSearchParams(
                    tab.id === 'todas' ? {} : { estado: tab.id },
                    { replace: true }
                  )
                }
                className={`min-h-[38px] px-3 rounded-[8px] text-xs font-semibold cursor-pointer ${
                  estado === tab.id ? 'bg-[#145C46] text-white' : 'text-[#566A63]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {eventProposals.length >= 2 && (
              <Link
                to={`/mis-eventos/${event.id}/propuestas/comparar`}
                className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#145C46] bg-[#E7F3ED] text-[#145C46] text-sm font-bold inline-flex items-center gap-2 no-underline"
              >
                <Scale className="w-4 h-4" aria-hidden="true" />
                <span>Comparar propuestas ({eventProposals.length})</span>
              </Link>
            )}
            <Link
              to={`/mis-eventos/${event.id}/solicitudes/nueva`}
              className="min-h-[44px] px-4 py-2 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center no-underline"
            >
              Nueva solicitud
            </Link>
          </div>
        </div>

        {/* Solicitudes */}
        <section className="space-y-3">
          <h2 className="text-lg font-extrabold text-[#172D28]">
            Solicitudes enviadas ({filteredRequests.length})
          </h2>
          {filteredRequests.length === 0 ? (
            <EmptyState
              title="Sin solicitudes en este filtro"
              description="Envía una solicitud a un proveedor del catálogo para recibir su propuesta formal en PEN."
              actionLabel="Solicitar cotización"
              actionTo={`/mis-eventos/${event.id}/solicitudes/nueva`}
            />
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const st = mapQuoteStatus(req.status);
                const linkedProps = eventProposals.filter(
                  (p) => p.requestId === req.id
                );
                return (
                  <div
                    key={req.id}
                    className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={st.tone} label={st.label} />
                        <span className="text-xs text-[#566A63] tabular-nums">
                          {formatShortDate(req.eventDate)} · {req.guestCount} inv.
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#172D28]">
                        {req.businessName} · {req.serviceName}
                      </h3>
                      <p className="text-xs text-[#566A63]">
                        Presupuesto estimado: {formatPen(req.estimatedBudgetPen)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Link
                        to={`/mis-eventos/${event.id}/solicitudes/${req.id}`}
                        className="min-h-[40px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-xs font-bold text-[#172D28] inline-flex items-center no-underline"
                      >
                        Ver solicitud
                      </Link>
                      {linkedProps[0] && (
                        <Link
                          to={`/mis-eventos/${event.id}/propuestas/${linkedProps[0].id}`}
                          className="min-h-[40px] px-3.5 rounded-[12px] bg-[#145C46] text-white text-xs font-bold inline-flex items-center no-underline"
                        >
                          Ver propuesta ({formatPen(linkedProps[0].amountPen)})
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PlannerLayout>
  );
};

export const QuoteCreatePage: React.FC = () => {
  const { privateEventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    currentUser,
    privateEvents,
    memberships,
    businesses,
    services,
    createQuoteRequest,
  } = useDemoStore();

  const event = privateEvents.find((e) => e.id === privateEventId);
  const preselectedBiz = searchParams.get('proveedor') ?? '';
  const visibleBusinesses = businesses.filter((b) => isBusinessVisible(b));

  const [businessId, setBusinessId] = useState(
    preselectedBiz || visibleBusinesses[0]?.id || ''
  );
  const bizServices = services.filter(
    (s) => s.businessId === businessId && s.active
  );
  const [serviceId, setServiceId] = useState(bizServices[0]?.id || '');
  const [eventDate, setEventDate] = useState(event?.eventDate || '2026-12-19');
  const [guestCount, setGuestCount] = useState(event?.guestCount || 35);
  const [zone, setZone] = useState(event?.zone || 'Miraflores');
  const [estimatedBudgetPen, setEstimatedBudgetPen] = useState(1800);
  const [message, setMessage] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState('');

  if (!event) return <NotFound404 />;
  if (!canAccessPrivateEvent(event.id, currentUser?.id ?? null, memberships)) {
    return <GuardDenied403 />;
  }

  const chosenBiz = businesses.find((b) => b.id === businessId);
  const chosenService = bizServices.find((s) => s.id === serviceId);

  const handleOpenConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      setError('Selecciona un proveedor.');
      return;
    }
    if (!message.trim()) {
      setError('Describe brevemente lo que necesitas cotizar.');
      return;
    }
    setError('');
    setConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    const res = await createQuoteRequest({
      privateEventId: event.id,
      businessId,
      serviceId: chosenService?.id,
      serviceName: chosenService?.name || 'Servicio personalizado',
      eventDate,
      guestCount,
      zone,
      estimatedBudgetPen,
      message,
    });
    setConfirmOpen(false);
    if (!res.ok || !res.data) {
      setError(res.error || 'No pudimos enviar la solicitud.');
      return;
    }
    navigate(`/mis-eventos/${event.id}/solicitudes/${res.data.id}`, {
      replace: true,
    });
  };

  return (
    <PlannerLayout
      privateEventId={event.id}
      title="Solicitar cotización"
      subtitle={`Revisa y confirma los datos antes de enviar la solicitud para ${event.title}`}
    >
      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 sm:p-8 max-w-2xl space-y-5">
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}

        <form onSubmit={handleOpenConfirm} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#172D28]" htmlFor="q-biz">
              Proveedor
            </label>
            <select
              id="q-biz"
              value={businessId}
              onChange={(e) => {
                setBusinessId(e.target.value);
                const nextSrv = services.find(
                  (s) => s.businessId === e.target.value && s.active
                );
                setServiceId(nextSrv?.id || '');
              }}
              className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
            >
              {visibleBusinesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#172D28]" htmlFor="q-srv">
              Servicio de interés
            </label>
            <select
              id="q-srv"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
            >
              {bizServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.pricingMode === 'quote' ? 'Por cotizar' : formatPen(s.pricePen)})
                </option>
              ))}
              <option value="">Servicio personalizado</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#172D28]" htmlFor="q-date">
                Fecha
              </label>
              <input
                id="q-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#172D28]" htmlFor="q-guests">
                Invitados
              </label>
              <input
                id="q-guests"
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#172D28]" htmlFor="q-budget">
                Presupuesto ref. (S/)
              </label>
              <input
                id="q-budget"
                type="number"
                min={0}
                value={estimatedBudgetPen}
                onChange={(e) => setEstimatedBudgetPen(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#172D28]" htmlFor="q-zone">
              Distrito del evento
            </label>
            <input
              id="q-zone"
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#172D28]" htmlFor="q-msg">
              Detalle de tu solicitud
            </label>
            <textarea
              id="q-msg"
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Horario estimado, restricciones alimentarias o requerimientos de montaje."
              className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
          >
            Revisar y enviar solicitud
          </button>
        </form>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar solicitud de cotización"
        description={`Enviarás esta consulta a ${chosenBiz?.name || 'el proveedor'} para el ${formatShortDate(eventDate)} (${guestCount} invitados en ${zone}).`}
        confirmLabel="Enviar solicitud"
        onConfirm={handleConfirmSend}
        onCancel={() => setConfirmOpen(false)}
      />
    </PlannerLayout>
  );
};

export const QuoteRequestPage: React.FC = () => {
  const { privateEventId, requestId } = useParams();
  const { currentUser, privateEvents, memberships, quoteRequests, proposals } =
    useDemoStore();

  const event = privateEvents.find((e) => e.id === privateEventId);
  const req = quoteRequests.find(
    (r) => r.id === requestId && r.privateEventId === privateEventId
  );

  if (!event || !req) return <NotFound404 />;
  if (!canAccessPrivateEvent(event.id, currentUser?.id ?? null, memberships)) {
    return <GuardDenied403 />;
  }

  const st = mapQuoteStatus(req.status);
  const linkedProposal = proposals.find(
    (p) => p.requestId === req.id && p.status !== 'draft'
  );

  return (
    <PlannerLayout
      privateEventId={event.id}
      title="Estado de solicitud enviada"
      subtitle={`${req.businessName} · ${req.serviceName}`}
    >
      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 sm:p-8 max-w-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge tone={st.tone} label={st.label} />
          <span className="text-xs text-[#566A63] tabular-nums">
            Fecha solicitada: {formatShortDate(req.eventDate)}
          </span>
        </div>

        <div className="p-4 rounded-[12px] bg-[#F6F8F7] border border-[#DCE4DF] space-y-2 text-sm">
          <p>
            <strong className="text-[#172D28]">Invitados y zona:</strong>{' '}
            {req.guestCount} personas · {req.zone}
          </p>
          <p>
            <strong className="text-[#172D28]">Presupuesto referencial:</strong>{' '}
            {formatPen(req.estimatedBudgetPen)}
          </p>
          <p>
            <strong className="text-[#172D28]">Mensaje enviado:</strong>{' '}
            {req.message}
          </p>
        </div>

        {req.status === 'declined' && req.declineReason && (
          <InlineNotice tone="warning" title="El proveedor indicó falta de disponibilidad">
            Motivo: {req.declineReason}
          </InlineNotice>
        )}

        {linkedProposal && (
          <div className="p-4 rounded-[12px] bg-[#E7F3ED] border border-[#C7DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#172D28]">
                Propuesta recibida: {formatPen(linkedProposal.amountPen)}
              </p>
              <p className="text-xs text-[#566A63]">
                Válida hasta {formatShortDate(linkedProposal.expiresAt)}
              </p>
            </div>
            <Link
              to={`/mis-eventos/${event.id}/propuestas/${linkedProposal.id}`}
              className="min-h-[44px] px-4 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center justify-center no-underline"
            >
              Ver detalle de propuesta
            </Link>
          </div>
        )}

        <Link
          to={`/mis-eventos/${event.id}/cotizaciones`}
          className="min-h-[44px] px-4 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
        >
          Ir a mis cotizaciones
        </Link>
      </div>
    </PlannerLayout>
  );
};

export const QuoteComparePage: React.FC = () => {
  const { privateEventId } = useParams();
  const { currentUser, privateEvents, memberships, proposals } = useDemoStore();

  const event = privateEvents.find((e) => e.id === privateEventId);
  if (!event) return <NotFound404 />;
  if (!canAccessPrivateEvent(event.id, currentUser?.id ?? null, memberships)) {
    return <GuardDenied403 />;
  }

  const eventProposals = proposals.filter(
    (p) => p.privateEventId === event.id && p.status !== 'draft'
  );

  return (
    <PlannerLayout
      privateEventId={event.id}
      title="Compara lo que importa."
      subtitle={`${event.title} · Propuestas e importes ilustrativos pertenecientes a este evento`}
    >
      {eventProposals.length === 0 ? (
        <EmptyState
          title="Todavía no hay propuestas para comparar"
          description="Cuando los proveedores respondan tus solicitudes podrás comparar precios, inclusiones y vigencia lado a lado."
          actionLabel="Volver a cotizaciones"
          actionTo={`/mis-eventos/${event.id}/cotizaciones`}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {eventProposals.map((prop) => {
              const expired = isProposalExpired(prop);
              return (
                <article
                  key={prop.id}
                  className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-lg font-bold text-[#172D28]">
                        {prop.businessName}
                      </h2>
                      <StatusBadge
                        tone={
                          prop.status === 'selected'
                            ? 'success'
                            : expired
                            ? 'danger'
                            : 'brand'
                        }
                        label={
                          prop.status === 'selected'
                            ? 'Seleccionada'
                            : expired
                            ? 'Vencida'
                            : 'Vigente'
                        }
                      />
                    </div>
                    <p className="text-3xl font-bold text-[#145C46] tabular-nums">
                      {formatPen(prop.amountPen)}
                    </p>
                    <p className="text-xs text-[#566A63] tabular-nums">
                      Propuesta de ejemplo · Vence {formatShortDate(prop.expiresAt)}
                    </p>

                    <div className="pt-3 border-t border-[#DCE4DF] space-y-1.5">
                      <p className="text-sm font-bold text-[#172D28]">Incluye</p>
                      <ul className="text-sm text-[#566A63] space-y-1 list-disc pl-4">
                        {prop.inclusions.map((inc, idx) => (
                          <li key={idx}>{inc}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-[#172D28]">No incluye</p>
                      <ul className="text-sm text-[#566A63] space-y-1 list-disc pl-4">
                        {prop.exclusions.map((exc, idx) => (
                          <li key={idx}>{exc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Link
                    to={`/mis-eventos/${event.id}/propuestas/${prop.id}`}
                    className="min-h-[48px] w-full rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/50 text-[#145C46] text-sm font-bold flex items-center justify-center no-underline"
                  >
                    Ver condiciones
                  </Link>
                </article>
              );
            })}

            {/* Tarjeta de contexto Figma */}
            <aside className="bg-[#E7F3ED] rounded-[16px] p-6 flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <Scale className="w-7 h-7 text-[#145C46]" aria-hidden="true" />
                <h2 className="text-2xl font-bold text-[#172D28]">Antes de elegir</h2>
                <div className="text-sm text-[#566A63] space-y-3 leading-relaxed">
                  <p>
                    Revisa alcance, horarios, traslados, cambios y condiciones de pago.
                  </p>
                  <p>Un precio menor puede incluir servicios diferentes.</p>
                  <p>Consulta tus dudas antes de acordar la contratación.</p>
                </div>
              </div>
              <Link
                to={`/mis-eventos/${event.id}`}
                className="min-h-[48px] w-full rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold flex items-center justify-center no-underline"
              >
                Volver a mi evento
              </Link>
            </aside>
          </div>
          <p className="text-xs text-[#566A63]">
            Elegir una propuesta no confirma un pago ni un contrato dentro del prototipo.
          </p>
        </div>
      )}
    </PlannerLayout>
  );
};

export const QuoteDetailPage: React.FC = () => {
  const { privateEventId, proposalId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentUser,
    privateEvents,
    memberships,
    proposals,
    quoteRequests,
    selectProposal,
  } = useDemoStore();
  const [error, setError] = useState('');

  const event = privateEvents.find((e) => e.id === privateEventId);
  const proposal = proposals.find(
    (p) => p.id === proposalId && p.privateEventId === privateEventId
  );

  if (!event || !proposal) return <NotFound404 />;
  if (!canAccessPrivateEvent(event.id, currentUser?.id ?? null, memberships)) {
    return <GuardDenied403 />;
  }

  const request = quoteRequests.find((r) => r.id === proposal.requestId);
  const expired = isProposalExpired(proposal);
  const actionable = isProposalActionable(proposal, request);
  const modalOpen = searchParams.get('modal') === 'select';

  const handleConfirmSelect = async () => {
    const res = await selectProposal(proposal.id);
    setSearchParams({}, { replace: true });
    if (!res.ok) {
      setError(res.error || 'No pudimos confirmar la selección.');
    }
  };

  return (
    <PlannerLayout
      privateEventId={event.id}
      title={`Propuesta de ${proposal.businessName}`}
      subtitle={`Importe cotizado ${formatPen(proposal.amountPen)} · Vigencia hasta ${formatShortDate(proposal.expiresAt)}`}
    >
      <div className="space-y-5 max-w-2xl">
        <BackButton
          fallbackTo={`/mis-eventos/${event.id}/propuestas/comparar`}
          label="Volver a comparar"
        />

        {error && <InlineNotice tone="danger">{error}</InlineNotice>}

        {proposal.status === 'selected' && (
          <InlineNotice tone="success" title="Propuesta seleccionada">
            Confirmaste esta propuesta para tu equipo. Esta selección no genera cobro automático ni contrato en Eventin; coordina directamente con el proveedor.
          </InlineNotice>
        )}

        {(expired || request?.status === 'declined' || request?.status === 'closed') &&
          proposal.status !== 'selected' && (
            <InlineNotice tone="warning" title="Propuesta vencida o solicitud cerrada (G05)">
              Ya no es posible seleccionar esta propuesta. Revisa otras alternativas vigentes en comparar propuestas.
            </InlineNotice>
          )}

        <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#566A63]">Importe propuesto</p>
              <p className="text-3xl font-extrabold text-[#145C46] tabular-nums">
                {formatPen(proposal.amountPen)}
              </p>
            </div>
            <StatusBadge
              tone={
                proposal.status === 'selected'
                  ? 'success'
                  : expired
                  ? 'danger'
                  : 'brand'
              }
              label={
                proposal.status === 'selected'
                  ? 'Seleccionada'
                  : expired
                  ? 'Vencida'
                  : 'Vigente'
              }
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-[#172D28]">Inclusiones</h2>
            <ul className="text-sm text-[#566A63] space-y-1 list-disc pl-5">
              {proposal.inclusions.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-bold text-[#172D28]">Exclusiones</h2>
            <ul className="text-sm text-[#566A63] space-y-1 list-disc pl-5">
              {proposal.exclusions.map((e, idx) => (
                <li key={idx}>{e}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-[12px] bg-[#F6F8F7] border border-[#DCE4DF] text-sm text-[#172D28]">
            <strong>Condiciones del proveedor: </strong>
            <span className="text-[#566A63]">{proposal.conditions}</span>
          </div>

          {actionable ? (
            <button
              type="button"
              onClick={() => setSearchParams({ modal: 'select' })}
              className="w-full min-h-[48px] rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>Seleccionar esta propuesta</span>
            </button>
          ) : (
            <Link
              to={`/mis-eventos/${event.id}`}
              className="w-full min-h-[48px] rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-bold flex items-center justify-center no-underline"
            >
              Volver a mi evento
            </Link>
          )}
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="Confirmar selección de propuesta"
        description="Seleccionar esta propuesta informa a tu equipo la opción elegida. No efectúa ningún pago ni crea un contrato vinculante."
        confirmLabel="Confirmar selección"
        cancelLabel="Seguir comparando"
        onConfirm={handleConfirmSelect}
        onCancel={() => setSearchParams({}, { replace: true })}
      />
    </PlannerLayout>
  );
};
