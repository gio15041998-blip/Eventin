import React, { useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  Copy,
  Heart,
  Lock,
  MapPin,
  MessageSquare,
  Plus,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { LIMA_ZONES } from '../data/seed';
import {
  canAccessPrivateEvent,
  evaluateInvitation,
  formatPen,
  formatShortDate,
  isPrivateEventOwner,
} from '../domain/predicates';
import { useDemoStore } from '../repositories/demoStore';
import { BrandLogo } from '../components/ui/BrandLogo';
import { PlannerLayout } from '../components/ui/Shells';
import {
  BackButton,
  EmptyState,
  GuardDenied403,
  NotFound404,
} from '../components/ui/StateBlocks';
import { InlineNotice, StatusBadge } from '../components/ui/StatusBadge';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function summarizeTeamNames(names: string[]): string {
  if (names.length === 0) return 'Solo tú';
  const firstNames = names.map((n) => n.trim().split(/\s+/)[0]);
  if (firstNames.length === 1) return firstNames[0];
  if (firstNames.length === 2) return `${firstNames[0]} y ${firstNames[1]}`;
  return `${firstNames[0]}, ${firstNames[1]} y ${firstNames.length - 2} más`;
}

export const PrivateListPage: React.FC = () => {
  const {
    currentUser,
    privateEvents,
    memberships,
    businesses,
    quoteRequests,
    tasks,
  } = useDemoStore();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get('intent');
  const providerId = searchParams.get('proveedor');

  if (!currentUser) {
    return <GuardDenied403 title="Inicia sesión para organizar tus eventos" />;
  }

  const targetBusiness = providerId
    ? businesses.find((b) => b.id === providerId)
    : undefined;

  const myEvents = privateEvents.filter((ev) =>
    memberships.some(
      (m) => m.privateEventId === ev.id && m.userId === currentUser.id
    )
  );

  const createDest =
    intent === 'quote' && providerId
      ? `/mis-eventos/nuevo?intent=quote&proveedor=${providerId}`
      : '/mis-eventos/nuevo';

  return (
    <div>
      {/* MOBILE ORGANIZE VIEW (320px - 767px) */}
      <div className="md:hidden px-6 pt-5 pb-8 space-y-6">
        <div className="flex items-center gap-3">
          <BackButton fallbackTo="/" label="Organizar" />
        </div>

        <div className="space-y-2">
          <h1 className="text-[30px] leading-[1.2] font-bold text-[#172D28]">
            {intent === 'quote' && targetBusiness ? (
              <>Elige un evento para cotizar</>
            ) : (
              <>
                Tu evento,
                <br />
                paso a paso.
              </>
            )}
          </h1>
          <p className="text-sm text-[#566A63]">
            {intent === 'quote' && targetBusiness
              ? `Asocia tu solicitud para ${targetBusiness.name}.`
              : 'Del primer plan al último detalle.'}
          </p>
        </div>

        <Link
          to={createDest}
          className="w-full min-h-[48px] px-5 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold flex items-center justify-center no-underline"
        >
          Crear un evento
        </Link>

        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[22px] font-bold text-[#172D28]">Mis eventos</h2>
            <StatusBadge tone="brand" label="Privado" />
          </div>

          {myEvents.length === 0 ? (
            <EmptyState
              title="Aún no tienes celebraciones privadas"
              description="Crea tu primer evento para llevar presupuesto y tareas en equipo."
              actionLabel="Crear evento privado"
              actionTo={createDest}
            />
          ) : (
            <div className="space-y-4">
              {myEvents.map((ev) => {
                const evTasks = tasks.filter((t) => t.privateEventId === ev.id);
                const doneCount = evTasks.filter((t) => t.done).length;
                const totalTasks = evTasks.length || 1;
                const pct = Math.min(100, Math.round((doneCount / totalTasks) * 100));
                const dest =
                  intent === 'quote' && providerId
                    ? `/mis-eventos/${ev.id}/solicitudes/nueva?proveedor=${providerId}`
                    : `/mis-eventos/${ev.id}`;

                return (
                  <article
                    key={ev.id}
                    className="bg-white rounded-[16px] p-5 space-y-4 border border-[#DCE4DF]/60"
                  >
                    <div className="space-y-2">
                      <Calendar className="w-[22px] h-[22px] text-[#145C46]" aria-hidden="true" />
                      <h3 className="text-[20px] font-bold text-[#172D28] leading-snug">
                        {ev.title}
                      </h3>
                      <p className="text-[13px] text-[#566A63] tabular-nums">
                        {formatShortDate(ev.eventDate)} · {ev.guestCount} invitados
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#566A63]">
                          Tu preparación
                        </span>
                        <span className="font-bold text-[#145C46] tabular-nums">
                          {doneCount} de {evTasks.length} tareas
                        </span>
                      </div>
                      <div className="h-[6px] w-full rounded-[8px] bg-[#E7F3ED] overflow-hidden">
                        <div
                          className="h-full rounded-[8px] bg-[#145C46]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      to={dest}
                      className="pt-1 flex items-center justify-between text-[13px] font-bold text-[#145C46] no-underline min-h-[44px]"
                    >
                      <span>
                        {intent === 'quote' && providerId
                          ? 'Cotizar con este evento'
                          : 'Continuar planificación'}
                      </span>
                      <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-1">
          <h2 className="text-[19px] font-bold text-[#172D28]">
            Encuentra lo que te falta
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: 'Decoración', cat: 'Decoración y ambientación' },
              { label: 'Catering', cat: 'Catering y gastronomía' },
              { label: 'Música', cat: 'Música y sonido' },
            ].map((chip) => (
              <Link
                key={chip.label}
                to={`/proveedores?categoria=${encodeURIComponent(chip.cat)}`}
                className="min-h-[40px] px-4 py-2 rounded-full bg-[#E7F3ED] text-[#145C46] text-sm font-semibold inline-flex items-center no-underline"
              >
                {chip.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[#566A63] pt-1">
            Solo tú y las personas que invites podrán verlo.
          </p>
        </div>
      </div>

      {/* DESKTOP ORGANIZE LIST (>= 768px) */}
      <div className="hidden md:block max-w-[1440px] mx-auto px-6 lg:px-20 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#145C46] inline-flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Espacio privado · Nunca visible en cartelera pública</span>
            </p>
            <h1 className="text-3xl font-extrabold text-[#172D28]">
              {intent === 'quote' && targetBusiness
                ? `Elige un evento para cotizar con ${targetBusiness.name}`
                : 'Mis eventos privados'}
            </h1>
            <p className="text-sm text-[#566A63] mt-1">
              Organiza celebraciones privadas con presupuesto, tareas, equipo y cotizaciones.
            </p>
          </div>

          <Link
            to={createDest}
            className="min-h-[48px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center justify-center gap-2 no-underline shrink-0"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Crear evento privado</span>
          </Link>
        </div>

        {intent === 'quote' && targetBusiness && (
          <InlineNotice tone="info" title="Intención de cotización activa">
            Selecciona el evento privado al que deseas asociar la solicitud para{' '}
            <strong>{targetBusiness.name}</strong> o crea uno nuevo.
          </InlineNotice>
        )}

        {myEvents.length === 0 ? (
          <EmptyState
            title="Aún no tienes celebraciones privadas"
            description="Crea tu primer evento para llevar presupuesto, checklist y solicitudes a proveedores en equipo."
            actionLabel="Crear evento privado"
            actionTo="/mis-eventos/nuevo"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.map((ev) => {
              const role = memberships.find(
                (m) => m.privateEventId === ev.id && m.userId === currentUser.id
              )?.role;
              const reqCount = quoteRequests.filter(
                (r) => r.privateEventId === ev.id
              ).length;
              const evTasks = tasks.filter((t) => t.privateEventId === ev.id);
              const doneCount = evTasks.filter((t) => t.done).length;
              const dest =
                intent === 'quote' && providerId
                  ? `/mis-eventos/${ev.id}/solicitudes/nueva?proveedor=${providerId}`
                  : `/mis-eventos/${ev.id}`;

              return (
                <article
                  key={ev.id}
                  className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#145C46]">
                        {ev.celebrationType} · {ev.zone}
                      </span>
                      <StatusBadge
                        tone={role === 'owner' ? 'success' : 'neutral'}
                        label={role === 'owner' ? 'Propietario' : 'Coorganizador'}
                      />
                    </div>
                    <h2 className="text-lg font-extrabold text-[#172D28]">
                      {ev.title}
                    </h2>
                    <p className="text-xs text-[#566A63] tabular-nums">
                      {formatShortDate(ev.eventDate)} · {ev.guestCount} invitados · Meta{' '}
                      {formatPen(ev.targetBudgetPen)}
                    </p>
                    <p className="text-xs text-[#145C46] font-semibold tabular-nums pt-1">
                      {doneCount} de {evTasks.length} tareas completadas
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#DCE4DF] flex items-center justify-between gap-3">
                    <span className="text-xs text-[#566A63] tabular-nums">
                      {reqCount} cotizaciones
                    </span>
                    <Link
                      to={dest}
                      className="min-h-[44px] px-4 py-2 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center no-underline"
                    >
                      {intent === 'quote' && providerId
                        ? 'Cotizar con este evento'
                        : 'Abrir planificación'}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const PrivateCreatePage: React.FC = () => {
  const { currentUser, createPrivateEvent } = useDemoStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const intent = searchParams.get('intent');
  const providerId = searchParams.get('proveedor');

  const [title, setTitle] = useState('');
  const [celebrationType, setCelebrationType] = useState('Cumpleaños');
  const [eventDate, setEventDate] = useState('2026-12-28');
  const [zone, setZone] = useState('Miraflores');
  const [guestCount, setGuestCount] = useState(30);
  const [targetBudgetPen, setTargetBudgetPen] = useState(3500);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!currentUser) {
    return <GuardDenied403 />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createPrivateEvent({
      title,
      celebrationType,
      eventDate,
      zone,
      guestCount,
      targetBudgetPen,
      notes,
    });
    if (!res.ok || !res.data) {
      setError(res.error || 'No se pudo crear el evento.');
      return;
    }
    if (intent === 'quote' && providerId) {
      navigate(
        `/mis-eventos/${res.data.id}/solicitudes/nueva?proveedor=${providerId}`,
        { replace: true }
      );
      return;
    }
    navigate(`/mis-eventos/${res.data.id}`, { replace: true });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <BackButton fallbackTo="/mis-eventos" label="Volver a mis eventos" />

      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172D28]">
            Crear evento privado
          </h1>
          <p className="text-sm text-[#566A63] mt-1">
            Este espacio es confidencial para ti y tus coorganizadores invitados. No se publicará en la cartelera pública.
          </p>
        </div>

        {error && <InlineNotice tone="danger">{error}</InlineNotice>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#172D28]" htmlFor="pe-title">
              Nombre del evento
            </label>
            <input
              id="pe-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Cena de grado de Mateo"
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#172D28]" htmlFor="pe-type">
                Tipo de celebración
              </label>
              <select
                id="pe-type"
                value={celebrationType}
                onChange={(e) => setCelebrationType(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
              >
                <option value="Cumpleaños">Cumpleaños</option>
                <option value="Aniversario">Aniversario</option>
                <option value="Cena familiar">Cena familiar</option>
                <option value="Celebración íntima">Celebración íntima</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#172D28]" htmlFor="pe-date">
                Fecha tentativa
              </label>
              <input
                id="pe-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#172D28]" htmlFor="pe-zone">
                Zona
              </label>
              <select
                id="pe-zone"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
              >
                {LIMA_ZONES.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#172D28]" htmlFor="pe-guests">
                Invitados
              </label>
              <input
                id="pe-guests"
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[#172D28]" htmlFor="pe-budget">
                Presupuesto meta (S/)
              </label>
              <input
                id="pe-budget"
                type="number"
                min={0}
                value={targetBudgetPen}
                onChange={(e) => setTargetBudgetPen(Number(e.target.value))}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#172D28]" htmlFor="pe-notes">
              Notas de estilo o prioridades
            </label>
            <textarea
              id="pe-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Preferimos terraza ventilada y opciones vegetarianas."
              className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
          >
            Continuar al presupuesto
          </button>
        </form>
      </div>
    </div>
  );
};

export const PrivateDetailPage: React.FC = () => {
  const { privateEventId } = useParams();
  const {
    currentUser,
    privateEvents,
    memberships,
    budgetItems,
    tasks,
    businesses,
    notifications,
    addBudgetItem,
    toggleBudgetItemPaid,
    addTask,
    toggleTask,
  } = useDemoStore();

  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [showMobileBudgetTable, setShowMobileBudgetTable] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemCategory, setItemCategory] = useState('Decoración');
  const [itemEstimated, setItemEstimated] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('2026-12-15');
  const [formMsg, setFormMsg] = useState('');

  const event = privateEvents.find((e) => e.id === privateEventId);
  if (!event) {
    return (
      <div className="max-w-[1120px] mx-auto px-4 py-8">
        <NotFound404 />
      </div>
    );
  }
  if (!canAccessPrivateEvent(event.id, currentUser?.id ?? null, memberships)) {
    return (
      <div className="max-w-[1120px] mx-auto px-4 py-8">
        <GuardDenied403
          title="Evento privado restringido"
          description="Solo el propietario o coorganizadores aceptados pueden consultar este tablero."
        />
      </div>
    );
  }

  const eventMembers = memberships.filter((m) => m.privateEventId === event.id);
  const teamLabel = summarizeTeamNames(eventMembers.map((m) => m.userName));
  const eventBudget = budgetItems.filter((b) => b.privateEventId === event.id);
  const eventTasks = tasks.filter((t) => t.privateEventId === event.id);
  const proposedBusinesses = businesses.filter((b) =>
    event.proposedBusinessIds.includes(b.id)
  );
  const unreadCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.read).length
    : 0;

  const totalEstimated = eventBudget.reduce((acc, b) => acc + b.estimatedPen, 0);
  const available = event.targetBudgetPen - totalEstimated;
  const budgetPct =
    event.targetBudgetPen > 0
      ? Math.round((totalEstimated / event.targetBudgetPen) * 100)
      : 0;
  const doneCount = eventTasks.filter((t) => t.done).length;

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addBudgetItem({
      privateEventId: event.id,
      category: itemCategory,
      title: itemTitle,
      estimatedPen: Number(itemEstimated) || 0,
    });
    if (!res.ok) {
      setFormMsg(res.error || 'Error al agregar partida.');
      return;
    }
    setItemTitle('');
    setItemEstimated('');
    setFormMsg('');
    setShowAddServiceForm(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await addTask({
      privateEventId: event.id,
      title: taskTitle,
      assigneeName: currentUser?.name || 'Equipo',
      dueDate: taskDue,
    });
    if (res.ok) {
      setTaskTitle('');
      setShowAddTaskForm(false);
    }
  };

  const getRowStatus = (paid: boolean, estimatedPen: number) => {
    if (paid) return { label: 'Cotizado', tone: 'brand' as const };
    if (estimatedPen > 0) return { label: 'Por elegir', tone: 'neutral' as const };
    return { label: 'Pendiente', tone: 'warning' as const };
  };

  return (
    <div>
      {/* MOBILE PLANNER (320px - 767px) — Figma 7:292 */}
      <div className="md:hidden px-6 pt-4 pb-8 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/mis-eventos"
              aria-label="Volver a mis eventos"
              className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center text-[#172D28] shrink-0 no-underline"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </Link>
            <span className="text-[18px] font-bold text-[#172D28] truncate">
              Mi evento
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/favoritos"
              aria-label="Abrir favoritos"
              className="w-[44px] h-[44px] rounded-[12px] bg-white flex items-center justify-center text-[#172D28] no-underline"
            >
              <Heart className="w-[22px] h-[22px]" aria-hidden="true" />
            </Link>
            <Link
              to="/notificaciones"
              aria-label={`Abrir notificaciones (${unreadCount} sin leer)`}
              className="relative w-[44px] h-[44px] rounded-[12px] bg-white flex items-center justify-center text-[#172D28] no-underline"
            >
              <Bell className="w-[22px] h-[22px]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#145C46] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-[25px] leading-snug font-bold text-[#172D28]">
            {event.title}
          </h1>
          <p className="text-xs text-[#566A63] tabular-nums">
            {formatShortDate(event.eventDate)} · {event.guestCount} invitados
          </p>
        </div>

        <div className="bg-white rounded-[12px] h-[56px] px-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-5 h-5 text-[#145C46] shrink-0" aria-hidden="true" />
            <span className="text-[13px] font-semibold text-[#172D28] truncate">
              {teamLabel}
            </span>
          </div>
          <Link
            to={`/mis-eventos/${event.id}/equipo`}
            className="min-h-[44px] px-5 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-sm font-bold inline-flex items-center justify-center no-underline shrink-0"
          >
            Compartir
          </Link>
        </div>

        <section className="bg-[#E7F3ED] rounded-[16px] p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#145C46]">
              Presupuesto estimado
            </p>
            <p className="text-[34px] leading-tight font-bold text-[#145C46] tabular-nums">
              {formatPen(event.targetBudgetPen)}
            </p>
          </div>

          <div className="h-[6px] w-full rounded-[8px] bg-white overflow-hidden">
            <div
              className="h-full rounded-[8px] bg-[#145C46] transition-all"
              style={{ width: `${Math.min(100, Math.max(0, budgetPct))}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
            <span className="font-semibold text-[#172D28]">
              Planificado: {formatPen(totalEstimated)}
            </span>
            <span
              className={
                available < 0 ? 'font-semibold text-[#B53737]' : 'text-[#566A63]'
              }
            >
              Disponible: {formatPen(available)}
            </span>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[21px] font-bold text-[#172D28]">
              Lo que falta por resolver
            </h2>
            <button
              type="button"
              onClick={() => setShowAddTaskForm((v) => !v)}
              className="text-xs font-bold text-[#145C46] min-h-[36px] px-2 cursor-pointer"
            >
              {showAddTaskForm ? 'Cerrar' : '+ Tarea'}
            </button>
          </div>

          <div className="bg-white rounded-[16px] divide-y divide-[#DCE4DF] overflow-hidden">
            {eventTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => toggleTask(task.id)}
                className="w-full px-4 py-4 flex items-center gap-3 text-left cursor-pointer"
              >
                {task.done ? (
                  <Check className="w-5 h-5 text-[#145C46] shrink-0" aria-hidden="true" />
                ) : (
                  <Plus className="w-5 h-5 text-[#145C46] shrink-0" aria-hidden="true" />
                )}
                <span
                  className={`text-sm flex-1 min-w-0 ${
                    task.done
                      ? 'font-medium text-[#172D28]'
                      : 'font-semibold text-[#145C46]'
                  }`}
                >
                  {task.title}
                  {!task.done && task.assigneeName
                    ? ` · ${task.assigneeName.split(' ')[0]}`
                    : ''}
                </span>
              </button>
            ))}
          </div>

          {showAddTaskForm && (
            <form
              onSubmit={handleAddTask}
              className="bg-white rounded-[16px] p-4 border border-[#DCE4DF] space-y-3"
            >
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Nueva tarea para el equipo..."
                aria-label="Nueva tarea"
                className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  aria-label="Fecha límite"
                  className="flex-1 min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-4 rounded-[12px] bg-[#145C46] text-white text-sm font-bold cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </form>
          )}
        </section>

        <div className="space-y-3">
          <Link
            to="/proveedores"
            className="w-full min-h-[48px] px-5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold flex items-center justify-center no-underline"
          >
            Buscar proveedores
          </Link>
          <Link
            to={`/mis-eventos/${event.id}/cotizaciones`}
            className="w-full min-h-[48px] px-5 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-sm font-bold flex items-center justify-center no-underline"
          >
            Ver cotizaciones
          </Link>
        </div>

        {/* Servicios detallados desplegables en móvil */}
        <section className="bg-white rounded-[16px] p-4 border border-[#DCE4DF] space-y-3">
          <button
            type="button"
            onClick={() => setShowMobileBudgetTable((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-bold text-[#172D28] min-h-[40px] cursor-pointer"
          >
            <span>Servicios y presupuesto ({eventBudget.length})</span>
            <span className="text-xs font-semibold text-[#145C46]">
              {showMobileBudgetTable ? 'Ocultar' : 'Editar tabla'}
            </span>
          </button>

          {showMobileBudgetTable && (
            <div className="space-y-3 pt-2 border-t border-[#DCE4DF]">
              {formMsg && <InlineNotice tone="danger">{formMsg}</InlineNotice>}
              <div className="divide-y divide-[#DCE4DF]">
                {eventBudget.map((item) => {
                  const st = getRowStatus(item.paid, item.estimatedPen);
                  return (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[#172D28] truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#566A63] tabular-nums">
                          {item.estimatedPen > 0
                            ? formatPen(item.estimatedPen)
                            : 'Sin definir'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleBudgetItemPaid(item.id)}
                        className="px-3 py-1 rounded-[8px] bg-[#E7F3ED] text-[#145C46] text-xs font-semibold cursor-pointer shrink-0"
                      >
                        {st.label}
                      </button>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleAddBudget} className="space-y-2 pt-2">
                <input
                  type="text"
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="Añadir servicio (ej. Fotografía)"
                  aria-label="Descripción de servicio"
                  className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={itemEstimated}
                    onChange={(e) => setItemEstimated(e.target.value)}
                    placeholder="Monto S/"
                    aria-label="Monto estimado en soles"
                    className="w-32 min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm tabular-nums"
                  />
                  <button
                    type="submit"
                    className="flex-1 min-h-[44px] px-4 rounded-[12px] bg-[#145C46] text-white text-sm font-bold cursor-pointer"
                  >
                    Añadir
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>

      {/* DESKTOP PLANNER (>= 768px) — Figma 9:215 */}
      <div className="hidden md:flex min-h-dvh w-full bg-[#F6F8F7]">
        {/* Flush-left 248px white sidebar */}
        <aside className="w-[248px] shrink-0 bg-white border-r border-[#DCE4DF] min-h-dvh sticky top-0 h-dvh flex flex-col justify-between px-4 py-7">
          <div>
            <div className="px-4 mb-10">
              <BrandLogo to="/" size="md" />
            </div>

            <p className="px-4 mb-4 text-[13px] font-semibold text-[#566A63]">
              Mi espacio
            </p>

            <nav aria-label="Espacio privado del evento" className="space-y-2">
              <Link
                to="/mis-eventos"
                className="h-[48px] px-4 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-[14px] font-bold flex items-center gap-3.5 no-underline"
              >
                <Calendar className="w-[22px] h-[22px] shrink-0" aria-hidden="true" />
                <span>Mis eventos</span>
              </Link>
              <Link
                to={`/mis-eventos/${event.id}/cotizaciones`}
                className="h-[48px] px-4 rounded-[12px] text-[#566A63] hover:bg-[#F6F8F7] hover:text-[#172D28] text-[14px] font-medium flex items-center gap-3.5 no-underline transition-colors"
              >
                <MessageSquare className="w-[22px] h-[22px] shrink-0" aria-hidden="true" />
                <span>Cotizaciones</span>
              </Link>
              <Link
                to="/mapa"
                className="h-[48px] px-4 rounded-[12px] text-[#566A63] hover:bg-[#F6F8F7] hover:text-[#172D28] text-[14px] font-medium flex items-center gap-3.5 no-underline transition-colors"
              >
                <MapPin className="w-[22px] h-[22px] shrink-0" aria-hidden="true" />
                <span>Mapa</span>
              </Link>
              <Link
                to="/cuenta"
                className="h-[48px] px-4 rounded-[12px] text-[#566A63] hover:bg-[#F6F8F7] hover:text-[#172D28] text-[14px] font-medium flex items-center gap-3.5 no-underline transition-colors"
              >
                <User className="w-[22px] h-[22px] shrink-0" aria-hidden="true" />
                <span>Mi perfil</span>
              </Link>
            </nav>
          </div>

          <div className="px-4 pt-6">
            <Link
              to="/"
              className="inline-flex items-center min-h-[44px] text-[13px] font-bold text-[#145C46] hover:underline no-underline"
            >
              Volver al inicio
            </Link>
          </div>
        </aside>

        {/* Main workspace content starting cleanly after 248px sidebar */}
        <div className="flex-1 min-w-0 px-8 lg:px-12 py-10 lg:py-12">
          <div className="max-w-[1088px] space-y-9">
            {/* Event Title + Share + Team + Favorites + Notifications + Privado badge */}
            <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-[30px] lg:text-[34px] leading-[1.25] font-bold text-[#172D28] tracking-[-0.02em]">
                  {event.title}
                </h1>
                <p className="text-[14px] text-[#566A63] mt-2 tabular-nums">
                  {formatShortDate(event.eventDate)} · {event.guestCount} invitados
                </p>
              </div>

              <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="flex items-center gap-4">
                  <Link
                    to={`/mis-eventos/${event.id}/equipo`}
                    className="h-[48px] px-6 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/60 text-[#145C46] text-[14px] font-bold inline-flex items-center justify-center transition-colors no-underline whitespace-nowrap"
                  >
                    Compartir evento
                  </Link>
                  <StatusBadge tone="brand" label="Privado" />
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/mis-eventos/${event.id}/equipo`}
                    className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#145C46] hover:underline no-underline mr-2"
                  >
                    <Users className="w-[20px] h-[20px] shrink-0" aria-hidden="true" />
                    <span>{teamLabel}</span>
                  </Link>
                  <Link
                    to="/favoritos"
                    aria-label="Abrir favoritos"
                    className="w-[44px] h-[44px] rounded-[12px] bg-white hover:bg-[#E7F3ED]/60 text-[#172D28] flex items-center justify-center no-underline transition-colors"
                  >
                    <Heart className="w-[22px] h-[22px]" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/notificaciones"
                    aria-label={`Abrir notificaciones (${unreadCount} sin leer)`}
                    className="relative w-[44px] h-[44px] rounded-[12px] bg-white hover:bg-[#E7F3ED]/60 text-[#172D28] flex items-center justify-center no-underline transition-colors"
                  >
                    <Bell className="w-[22px] h-[22px]" aria-hidden="true" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#145C46] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </header>

            {/* Single light-green budget block with 3 columns (NO nested white cards) */}
            <section
              aria-label="Presupuesto del evento"
              className="bg-[#E7F3ED] rounded-[16px] px-7 py-6 space-y-5"
            >
              <div className="grid grid-cols-3 gap-6 items-start">
                <div>
                  <p className="text-[18px] font-semibold text-[#145C46] leading-[26px]">
                    Tu presupuesto
                  </p>
                  <p className="text-[36px] xl:text-[42px] leading-[1.2] font-bold text-[#145C46] tabular-nums mt-1.5">
                    {formatPen(event.targetBudgetPen)}
                  </p>
                </div>

                <div>
                  <p className="text-[13px] font-medium text-[#566A63] leading-[19px] pt-2">
                    Planificado
                  </p>
                  <p className="text-[26px] xl:text-[28px] leading-[1.25] font-bold text-[#172D28] tabular-nums mt-2">
                    {formatPen(totalEstimated)}
                  </p>
                </div>

                <div>
                  <p className="text-[13px] font-medium text-[#566A63] leading-[19px] pt-2">
                    Disponible
                  </p>
                  <p
                    className={`text-[26px] xl:text-[28px] leading-[1.25] font-bold tabular-nums mt-2 ${
                      available < 0 ? 'text-[#B53737]' : 'text-[#172D28]'
                    }`}
                  >
                    {formatPen(available)}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="h-[8px] w-full rounded-[8px] bg-white overflow-hidden">
                  <div
                    className="h-full rounded-[8px] bg-[#145C46] transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, budgetPct))}%` }}
                  />
                </div>
                <p className="text-[12px] font-medium text-[#145C46] tabular-nums">
                  {budgetPct}% del presupuesto planificado
                </p>
              </div>
            </section>

            {/* Servicios y presupuesto + side-by-side table & checklist */}
            <section className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[24px] font-bold text-[#172D28] leading-tight">
                  Servicios y presupuesto
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddServiceForm((v) => !v)}
                  className="h-[48px] px-6 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/60 text-[#145C46] text-[14px] font-bold inline-flex items-center justify-center transition-colors cursor-pointer whitespace-nowrap"
                >
                  {showAddServiceForm ? 'Cerrar formulario' : 'Añadir servicio'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Tabla de servicios */}
                <div className="lg:col-span-7 bg-white rounded-[16px] p-6 flex flex-col justify-between gap-6">
                  <div className="space-y-4">
                    {formMsg && <InlineNotice tone="danger">{formMsg}</InlineNotice>}

                    {showAddServiceForm && (
                      <form
                        onSubmit={handleAddBudget}
                        className="p-4 rounded-[12px] bg-[#F6F8F7] border border-[#DCE4DF] grid grid-cols-1 sm:grid-cols-12 gap-2.5"
                      >
                        <input
                          type="text"
                          value={itemTitle}
                          onChange={(e) => setItemTitle(e.target.value)}
                          placeholder="Servicio (ej. Fotografía)"
                          aria-label="Descripción de servicio"
                          className="sm:col-span-5 min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-white text-sm"
                        />
                        <select
                          value={itemCategory}
                          onChange={(e) => setItemCategory(e.target.value)}
                          aria-label="Categoría de servicio"
                          className="sm:col-span-3 min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-white text-sm"
                        >
                          <option value="Decoración">Decoración</option>
                          <option value="Catering">Catering</option>
                          <option value="Música">Música</option>
                          <option value="Local">Local</option>
                          <option value="General">General</option>
                        </select>
                        <input
                          type="number"
                          min={0}
                          value={itemEstimated}
                          onChange={(e) => setItemEstimated(e.target.value)}
                          placeholder="S/ 0"
                          aria-label="Monto estimado en soles"
                          className="sm:col-span-2 min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-white text-sm tabular-nums"
                        />
                        <button
                          type="submit"
                          className="sm:col-span-2 min-h-[44px] px-3 rounded-[12px] bg-[#145C46] text-white text-sm font-bold cursor-pointer"
                        >
                          Añadir
                        </button>
                      </form>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#DCE4DF] text-[12px] font-bold text-[#566A63]">
                            <th className="pb-3.5 pr-4">Servicio</th>
                            <th className="pb-3.5 pr-4">Estimado</th>
                            <th className="pb-3.5">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DCE4DF]">
                          {eventBudget.map((item) => {
                            const status = getRowStatus(item.paid, item.estimatedPen);
                            return (
                              <tr key={item.id}>
                                <td className="py-5 pr-4 text-[16px] font-semibold text-[#172D28]">
                                  {item.title}
                                </td>
                                <td className="py-5 pr-4 text-[15px] tabular-nums">
                                  {item.estimatedPen > 0 ? (
                                    <span className="font-semibold text-[#172D28]">
                                      {formatPen(item.estimatedPen)}
                                    </span>
                                  ) : (
                                    <span className="text-[14px] text-[#566A63]">
                                      Sin definir
                                    </span>
                                  )}
                                </td>
                                <td className="py-4">
                                  <button
                                    type="button"
                                    onClick={() => toggleBudgetItemPaid(item.id)}
                                    title="Cambiar estado"
                                    className="px-3 py-1 rounded-[8px] bg-[#E7F3ED] hover:bg-[#D7EF98]/70 text-[#145C46] text-[12px] font-semibold cursor-pointer transition-colors"
                                  >
                                    {status.label}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Link
                    to="/proveedores"
                    className="w-full h-[48px] px-5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-[14px] font-bold flex items-center justify-center transition-colors no-underline"
                  >
                    Buscar proveedores
                  </Link>
                </div>

                {/* Right: Próximos pasos */}
                <div className="lg:col-span-5 bg-white rounded-[16px] p-6 flex flex-col justify-between gap-6">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[20px] font-bold text-[#172D28]">
                        Próximos pasos
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddTaskForm((v) => !v)}
                        className="text-xs font-bold text-[#145C46] hover:underline cursor-pointer"
                      >
                        {showAddTaskForm ? 'Cerrar' : '+ Nueva tarea'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {eventTasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="w-full flex items-center gap-3.5 text-left cursor-pointer group"
                        >
                          {task.done ? (
                            <Check
                              className="w-5 h-5 text-[#145C46] shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <Plus
                              className="w-5 h-5 text-[#145C46] shrink-0"
                              aria-hidden="true"
                            />
                          )}
                          <span
                            className={`text-[14px] leading-[20px] transition-colors ${
                              task.done
                                ? 'font-medium text-[#172D28]'
                                : 'font-semibold text-[#145C46] group-hover:underline'
                            }`}
                          >
                            {task.title}
                          </span>
                        </button>
                      ))}
                    </div>

                    {showAddTaskForm && (
                      <form
                        onSubmit={handleAddTask}
                        className="pt-3 border-t border-[#DCE4DF] space-y-2.5"
                      >
                        <input
                          type="text"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          placeholder="Nueva tarea para el equipo..."
                          aria-label="Nueva tarea"
                          className="w-full min-h-[42px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
                        />
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={taskDue}
                            onChange={(e) => setTaskDue(e.target.value)}
                            aria-label="Fecha límite"
                            className="flex-1 min-h-[42px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
                          />
                          <button
                            type="submit"
                            className="min-h-[42px] px-4 rounded-[12px] bg-[#145C46] text-white text-xs font-bold cursor-pointer"
                          >
                            Agregar
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-[12px] text-[#566A63] tabular-nums">
                      {doneCount} de {eventTasks.length} tareas completadas
                    </p>
                    <Link
                      to={`/mis-eventos/${event.id}/cotizaciones`}
                      className="w-full h-[48px] px-5 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/60 text-[#145C46] text-[14px] font-bold flex items-center justify-center transition-colors no-underline"
                    >
                      Ver cotizaciones
                    </Link>
                  </div>
                </div>
              </div>

              <p className="text-[13px] text-[#566A63]">
                Los importes son ilustrativos. Un servicio cotizado todavía requiere acuerdo con el proveedor.
              </p>
            </section>

            {/* Proveedores propuestos para este evento (debajo del espacio principal, preserva flujo demo) */}
            {proposedBusinesses.length > 0 && (
              <section className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-[#172D28]">
                      Proveedores propuestos para este evento
                    </h2>
                    <p className="text-xs text-[#566A63]">
                      Lista privada del equipo, independiente de tus favoritos personales.
                    </p>
                  </div>
                  <Link
                    to={`/mis-eventos/${event.id}/solicitudes/nueva`}
                    className="min-h-[40px] px-4 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-xs font-bold inline-flex items-center no-underline"
                  >
                    Solicitar cotización
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {proposedBusinesses.map((biz) => (
                    <div
                      key={biz.id}
                      className="p-4 rounded-[12px] border border-[#DCE4DF] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#172D28] truncate">
                          {biz.name}
                        </p>
                        <p className="text-xs text-[#566A63]">{biz.category}</p>
                      </div>
                      <Link
                        to={`/mis-eventos/${event.id}/solicitudes/nueva?proveedor=${biz.id}`}
                        className="min-h-[38px] px-3 rounded-[10px] border border-[#DCE4DF] text-xs font-bold text-[#145C46] inline-flex items-center no-underline shrink-0"
                      >
                        Cotizar
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivateTeamPage: React.FC = () => {
  const { privateEventId } = useParams();
  const {
    currentUser,
    privateEvents,
    memberships,
    invitations,
    createInvitation,
    revokeInvitation,
  } = useDemoStore();

  const [recipientEmail, setRecipientEmail] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteErr, setInviteErr] = useState('');

  const event = privateEvents.find((e) => e.id === privateEventId);
  if (!event) return <NotFound404 />;
  if (!canAccessPrivateEvent(event.id, currentUser?.id ?? null, memberships)) {
    return <GuardDenied403 />;
  }

  const isOwner = isPrivateEventOwner(event.id, currentUser?.id ?? null, memberships);
  const eventMembers = memberships.filter((m) => m.privateEventId === event.id);
  const eventInvites = invitations.filter((i) => i.privateEventId === event.id);

  const handlePrepareInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteErr('');
    setInviteMsg('');
    const derivedName =
      recipientEmail.split('@')[0]?.replace(/[._-]/g, ' ') || 'Coorganizador';
    const res = await createInvitation({
      privateEventId: event.id,
      recipientName: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
      recipientEmail,
    });
    if (!res.ok || !res.data) {
      setInviteErr(res.error || 'No se pudo preparar la invitación.');
      return;
    }
    setGeneratedToken(res.data.token);
    setRecipientEmail('');
    setInviteMsg(
      `Invitación preparada para ${res.data.recipientEmail}. Comparte el enlace privado para que acepte con su cuenta.`
    );
  };

  const handleCopyPrivateLink = async () => {
    const tokenToCopy =
      generatedToken ||
      eventInvites.find((i) => i.status === 'pending')?.token ||
      'inv-cumple-ana-2026';
    const url = `${window.location.origin}/invitaciones/${tokenToCopy}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(true);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-8 lg:py-12 space-y-8">
      <div>
        <BackButton
          fallbackTo={`/mis-eventos/${event.id}`}
          label={`Volver a ${event.title}`}
        />
        <h1 className="text-[28px] sm:text-[36px] leading-tight font-bold text-[#172D28] mt-3 tracking-[-0.02em]">
          Las mejores ideas se planean juntos.
        </h1>
        <p className="text-base text-[#566A63] mt-2">
          {event.title} · Evento privado
        </p>
      </div>

      {/* 2-Column Figma Layout (34:353 & 34:367) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white rounded-[16px] p-6 space-y-4">
            <h2 className="text-[23px] font-bold text-[#172D28]">
              Personas con acceso
            </h2>
            <div className="divide-y divide-[#DCE4DF]">
              {eventMembers.map((mem) => (
                <div
                  key={mem.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-[#E7F3ED] text-[#145C46] font-bold text-base flex items-center justify-center shrink-0">
                      {getInitials(mem.userName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-[#172D28] truncate">
                        {mem.userName}
                      </p>
                      <p className="text-xs text-[#566A63]">
                        {mem.role === 'owner'
                          ? 'Propietario · Administra los accesos'
                          : 'Coorganizador · Puede editar'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-3">
            <h2 className="text-[24px] font-bold text-[#172D28]">
              Un evento compartido sigue siendo privado.
            </h2>
            <p className="text-base text-[#566A63] leading-relaxed">
              Cada cambio debe guardar quién lo hizo. El propietario puede revocar el acceso.
              <br />
              Solo se comparten los datos de este evento, sin dar acceso al resto de tu cuenta.
            </p>
          </div>
        </div>

        {/* Right: Invitación privada (#E7F3ED) */}
        <aside className="lg:col-span-5 bg-[#E7F3ED] rounded-[16px] p-6 space-y-5">
          <h2 className="text-[24px] font-bold text-[#172D28]">
            Invitar a una amistad
          </h2>

          {inviteErr && <InlineNotice tone="danger">{inviteErr}</InlineNotice>}
          {inviteMsg && <InlineNotice tone="success">{inviteMsg}</InlineNotice>}

          {isOwner ? (
            <form onSubmit={handlePrepareInvite} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="team-invite-email"
                  className="block text-sm font-semibold text-[#172D28]"
                >
                  Correo electrónico
                </label>
                <input
                  id="team-invite-email"
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="nombre@correo.com"
                  className="w-full h-[52px] px-4 rounded-[12px] bg-white border border-[#DCE4DF] text-sm text-[#172D28]"
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-base font-bold text-[#145C46]">
                  Permiso: coorganizador
                </p>
                <p className="text-[15px] text-[#566A63] leading-relaxed">
                  Podrá editar presupuesto y tareas, proponer proveedores y revisar cotizaciones.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  className="w-full h-[48px] px-5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
                >
                  Preparar invitación
                </button>
                <button
                  type="button"
                  onClick={handleCopyPrivateLink}
                  className="w-full h-[48px] px-5 rounded-[12px] bg-white hover:bg-[#F6F8F7] text-[#145C46] text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>{copied ? 'Enlace privado copiado' : 'Copiar enlace privado'}</span>
                </button>
              </div>

              <p className="text-xs text-[#566A63]">
                Requiere una cuenta y aceptar la invitación.
              </p>
            </form>
          ) : (
            <InlineNotice tone="info">
              Solo el propietario del evento puede emitir o revocar invitaciones nuevas.
            </InlineNotice>
          )}
        </aside>
      </div>

      {/* Invitaciones enviadas (control del propietario + prueba de enlaces) */}
      <section className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#172D28]">
              Invitaciones enviadas ({eventInvites.length})
            </h2>
            <p className="text-xs text-[#566A63]">
              Una invitación pendiente no otorga acceso hasta que el destinatario la acepte explícitamente.
            </p>
          </div>
          {isOwner && (
            <Link
              to={`/mis-eventos/${event.id}/invitaciones/nueva`}
              className="min-h-[40px] px-4 py-2 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-xs font-bold inline-flex items-center gap-1.5 no-underline"
            >
              <UserPlus className="w-4 h-4" aria-hidden="true" />
              <span>Formulario completo</span>
            </Link>
          )}
        </div>

        {eventInvites.length === 0 ? (
          <p className="text-sm text-[#566A63]">
            No hay invitaciones registradas para este evento.
          </p>
        ) : (
          <div className="divide-y divide-[#DCE4DF]">
            {eventInvites.map((inv) => (
              <div
                key={inv.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-[#172D28]">
                    {inv.recipientName} ({inv.recipientEmail})
                  </p>
                  <p className="text-xs text-[#566A63] tabular-nums">
                    Expira: {formatShortDate(inv.expiresAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    tone={
                      inv.status === 'accepted'
                        ? 'success'
                        : inv.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    }
                    label={
                      inv.status === 'accepted'
                        ? 'Aceptada'
                        : inv.status === 'pending'
                        ? 'Pendiente'
                        : inv.status === 'revoked'
                        ? 'Revocada'
                        : 'Expirada'
                    }
                  />
                  <Link
                    to={`/invitaciones/${inv.token}`}
                    className="min-h-[36px] px-3 rounded-[10px] border border-[#DCE4DF] text-xs font-semibold text-[#172D28] inline-flex items-center no-underline"
                  >
                    Probar enlace
                  </Link>
                  {isOwner && inv.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => revokeInvitation(inv.id)}
                      className="min-h-[36px] px-3 rounded-[10px] bg-[#FDECEC] text-[#B53737] text-xs font-semibold cursor-pointer"
                    >
                      Revocar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export const PrivateInvitePage: React.FC = () => {
  const { privateEventId } = useParams();
  const { currentUser, privateEvents, memberships, createInvitation } =
    useDemoStore();
  const navigate = useNavigate();

  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const event = privateEvents.find((e) => e.id === privateEventId);
  if (!event) return <NotFound404 />;
  if (!isPrivateEventOwner(event.id, currentUser?.id ?? null, memberships)) {
    return (
      <GuardDenied403
        title="Solo el propietario puede invitar"
        description="Los coorganizadores no pueden administrar accesos ni emitir invitaciones nuevas."
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createInvitation({
      privateEventId: event.id,
      recipientName,
      recipientEmail,
    });
    if (!res.ok || !res.data) {
      setError(res.error || 'No se pudo crear la invitación.');
      return;
    }
    setGeneratedToken(res.data.token);
    navigate(`/mis-eventos/${event.id}/equipo`, { replace: true });
  };

  const handleCopyPreviewLink = async () => {
    const tokenToCopy = generatedToken || 'inv-cumple-ana-2026';
    const url = `${window.location.origin}/invitaciones/${tokenToCopy}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(true);
    }
  };

  return (
    <PlannerLayout
      privateEventId={event.id}
      title="Invitar a una amistad"
      subtitle="Crea un enlace temporal y compártelo con la persona invitada. Solo podrá aceptarlo con el correo indicado."
    >
      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 sm:p-8 max-w-xl space-y-5">
        {error && <InlineNotice tone="danger">{error}</InlineNotice>}

        <InlineNotice tone="info">
          La invitación no concede acceso al evento hasta que el destinatario inicie sesión con su cuenta y pulse «Aceptar».
        </InlineNotice>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#172D28]" htmlFor="inv-name">
              Nombre de la persona invitada
            </label>
            <input
              id="inv-name"
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Ej. Carlos Vega"
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-[#172D28]" htmlFor="inv-email">
              Correo electrónico de su cuenta
            </label>
            <input
              id="inv-email"
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="amistad@ejemplo.com"
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 min-h-[44px] px-4 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
            >
              Crear enlace de invitación
            </button>
            <button
              type="button"
              onClick={handleCopyPreviewLink}
              className="min-h-[44px] px-4 rounded-[12px] border border-[#DCE4DF] bg-white text-[#172D28] text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-4 h-4" aria-hidden="true" />
              <span>{copied ? 'Enlace copiado' : 'Copiar enlace'}</span>
            </button>
          </div>
        </form>
      </div>
    </PlannerLayout>
  );
};

export const InviteAcceptPage: React.FC = () => {
  const { inviteToken } = useParams();
  const { currentUser, invitations, acceptInvitation, switchDemoUser, users } =
    useDemoStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const invitation = invitations.find((i) => i.token === inviteToken);
  const evaluation = useMemo(
    () => evaluateInvitation(invitation, currentUser),
    [invitation, currentUser]
  );

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-4 mt-8">
        <h1 className="text-xl font-extrabold text-[#172D28]">
          Inicia sesión para revisar esta invitación
        </h1>
        <p className="text-sm text-[#566A63]">
          Por seguridad, validar el enlace requiere sesión autenticada. No concedemos acceso solo por visitar la URL.
        </p>
        <Link
          to={`/acceder?returnTo=${encodeURIComponent(`/invitaciones/${inviteToken}`)}`}
          className="min-h-[44px] w-full rounded-[12px] bg-[#145C46] text-white text-sm font-bold flex items-center justify-center no-underline"
        >
          Ir a acceder
        </Link>
      </div>
    );
  }

  const handleAccept = async () => {
    if (!inviteToken) return;
    const res = await acceptInvitation(inviteToken);
    if (!res.ok || !res.data) {
      setError(res.error || 'No se pudo aceptar la invitación.');
      return;
    }
    navigate(`/mis-eventos/${res.data.privateEventId}`, { replace: true });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 sm:p-8 space-y-5">
        <h1 className="text-2xl font-extrabold text-[#172D28]">
          Invitación a coorganizar
        </h1>

        {error && <InlineNotice tone="danger">{error}</InlineNotice>}

        {evaluation === 'not_found' && (
          <InlineNotice tone="danger" title="Invitación inexistente (G03)">
            La invitación no está disponible para esta cuenta, expiró o fue eliminada.
          </InlineNotice>
        )}

        {evaluation === 'expired' && (
          <InlineNotice tone="warning" title="Invitación vencida (G03)">
            El plazo de esta invitación expiró el{' '}
            {invitation ? formatShortDate(invitation.expiresAt) : ''}. Solicita al propietario un nuevo enlace.
          </InlineNotice>
        )}

        {evaluation === 'revoked' && (
          <InlineNotice tone="danger" title="Invitación revocada (G03)">
            El propietario canceló este acceso antes de ser aceptado.
          </InlineNotice>
        )}

        {evaluation === 'wrong_account' && invitation && (
          <div className="space-y-3">
            <InlineNotice tone="warning" title="Cuenta distinta al destinatario (G03)">
              Esta invitación fue emitida para <strong>{invitation.recipientEmail}</strong>, pero estás conectado como <strong>{currentUser.email}</strong>.
            </InlineNotice>
            <Link to="/cuenta" className="text-[#145C46] font-semibold">Ir a mi cuenta para cerrar sesión</Link>
          </div>
        )}

        {invitation &&
          (evaluation === 'valid' || evaluation === 'already_accepted') && (
            <div className="space-y-4">
              <div className="p-4 rounded-[12px] bg-[#F6F8F7] border border-[#DCE4DF] space-y-1">
                <p className="text-xs text-[#566A63]">
                  {invitation.invitedByName} te invitó como coorganizador de:
                </p>
                <p className="text-lg font-extrabold text-[#172D28]">
                  {invitation.privateEventTitle}
                </p>
                <p className="text-xs text-[#566A63]">
                  Podrás colaborar en presupuesto, tareas y cotizaciones. El evento sigue siendo privado.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="flex-1 min-h-[44px] rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
                >
                  {evaluation === 'already_accepted'
                    ? 'Abrir evento privado'
                    : 'Aceptar invitación'}
                </button>
                <Link
                  to="/notificaciones"
                  className="min-h-[44px] px-4 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold flex items-center justify-center no-underline"
                >
                  Ahora no
                </Link>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
