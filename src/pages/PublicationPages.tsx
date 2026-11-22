import React, { useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  CreditCard,
  Edit3,
  Eye,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
  Upload,
} from 'lucide-react';
import { EVENT_CATEGORIES, LIMA_ZONES } from '../data/seed';
import {
  PUBLIC_EVENT_MONTHLY_PEN,
  formatDateTime,
  formatPen,
  formatShortDate,
  isEventEnded,
  isPublicEventVisible,
} from '../domain/predicates';
import { useDemoStore } from '../repositories/demoStore';
import { ResourceCoverUpload } from '../components/ui/ResourceCoverUpload';
import { SafeImage } from '../components/ui/SafeImage';
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

export const PublicationListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, publicEvents } = useDemoStore();
  const filter = searchParams.get('estado') || 'todos';

  if (!currentUser) {
    return (
      <GuardDenied403
        title="Inicia sesión para gestionar tus eventos públicos"
        description="Aquí podrás crear borradores, revisar observaciones, pagar el plan de S/ 100/mes y seguir cada publicación."
      />
    );
  }

  const owned = publicEvents.filter((e) => e.ownerId === currentUser.id);
  const filtered = owned.filter((e) => {
    if (filter === 'publicados') return isPublicEventVisible(e);
    if (filter === 'borradores') return e.contentStatus === 'draft';
    if (filter === 'revision')
      return e.contentStatus === 'pending' || e.contentStatus === 'observed';
    return true;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <BackButton fallbackTo="/cuenta" label="Mi cuenta" />
          <h1 className="text-[28px] sm:text-[36px] font-bold text-[#172D28] mt-1 tracking-[-0.02em]">
            Mis eventos publicados
          </h1>
          <p className="text-[15px] text-[#566A63] mt-1">
            Todos tus eventos públicos creados: borradores, pendientes y publicados.
          </p>
        </div>

        <Link
          to="/cuenta/publicaciones/nueva"
          className="min-h-[48px] px-6 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center justify-center gap-2 no-underline shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Crear evento</span>
        </Link>
      </div>

      {/* Filter Chips matching Figma desktop & mobile */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'todos', label: `Todos (${owned.length})` },
          {
            key: 'borradores',
            label: `Borradores (${owned.filter((e) => e.contentStatus === 'draft').length})`,
          },
          {
            key: 'revision',
            label: `En revisión (${
              owned.filter(
                (e) => e.contentStatus === 'pending' || e.contentStatus === 'observed'
              ).length
            })`,
          },
          {
            key: 'publicados',
            label: `Publicados (${owned.filter((e) => isPublicEventVisible(e)).length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() =>
              setSearchParams(tab.key === 'todos' ? {} : { estado: tab.key })
            }
            className={`min-h-[40px] px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${
              filter === tab.key
                ? 'bg-[#145C46] text-white'
                : 'bg-[#E7F3ED] text-[#145C46]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No hay eventos en este estado"
          description="Crea una publicación para eventos culturales, ferias, conciertos o talleres abiertos."
          actionLabel="Crear evento público"
          actionTo="/cuenta/publicaciones/nueva"
        />
      ) : (
        <>
          {/* DESKTOP TABLE matching desktop/business.tsx.reference */}
          <div className="hidden md:block bg-white rounded-[16px] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE4DF] text-xs font-bold text-[#566A63]">
                  <th className="py-5 px-6">Evento</th>
                  <th className="py-5 px-4">Fecha</th>
                  <th className="py-5 px-4">Publicación</th>
                  <th className="py-5 px-4">Pago</th>
                  <th className="py-5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE4DF]">
                {filtered.map((evt) => {
                  const mod = mapModerationStatus(evt.contentStatus);
                  const pay = mapPaymentStatus(evt.paymentStatus);
                  const visible = isPublicEventVisible(evt);
                  return (
                    <tr key={evt.id} className="hover:bg-[#F6F8F7]/60 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-5">
                          <div className="w-[132px] h-[88px] rounded-[12px] overflow-hidden shrink-0 bg-[#E7F3ED]">
                            <SafeImage src={evt.imageUrl} alt={evt.title} />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <Link
                              to={`/cuenta/publicaciones/${evt.id}`}
                              className="text-[18px] font-bold text-[#172D28] hover:text-[#145C46] no-underline block leading-snug"
                            >
                              {evt.title}
                            </Link>
                            <p className="text-[13px] text-[#566A63]">
                              {evt.zone} · {evt.isFree ? 'Entrada libre' : formatPen(evt.entryPricePen)} · Ejemplo
                            </p>
                            {evt.contentStatus === 'draft' && (
                              <Link
                                to={`/cuenta/publicaciones/${evt.id}/editar`}
                                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#145C46] hover:underline no-underline pt-1"
                              >
                                <span>Continuar edición</span>
                                <ArrowRight className="w-4 h-4" aria-hidden="true" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-sm font-medium text-[#172D28] whitespace-nowrap tabular-nums">
                        {formatShortDate(evt.startsAt)}
                      </td>
                      <td className="py-5 px-4 whitespace-nowrap">
                        <StatusBadge
                          tone={visible ? 'brand' : mod.tone}
                          label={visible ? 'Publicado' : mod.label}
                        />
                      </td>
                      <td className="py-5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[13px] font-semibold ${
                            evt.paymentStatus === 'proof_received'
                              ? 'text-[#785715]'
                              : evt.paymentStatus === 'verified'
                              ? 'text-[#145C46]'
                              : 'text-[#566A63]'
                          }`}
                        >
                          {pay.label}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            to={`/cuenta/publicaciones/${evt.id}`}
                            className="min-h-[40px] px-4 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-xs font-bold inline-flex items-center no-underline"
                          >
                            Gestionar
                          </Link>
                          <Link
                            to={`/cuenta/publicaciones/${evt.id}/plan`}
                            className="min-h-[40px] px-3 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-xs font-semibold inline-flex items-center no-underline"
                          >
                            Plan S/ 100
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS matching mobile/publications.tsx.reference */}
          <div className="md:hidden space-y-4">
            {filtered.map((evt) => {
              const mod = mapModerationStatus(evt.contentStatus);
              const visible = isPublicEventVisible(evt);
              return (
                <article
                  key={evt.id}
                  className="bg-white rounded-[16px] p-4 space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-[88px] h-[76px] rounded-[12px] overflow-hidden shrink-0 bg-[#E7F3ED]">
                      <SafeImage src={evt.imageUrl} alt={evt.title} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h2 className="text-[17px] font-bold text-[#172D28] leading-snug">
                        {evt.title}
                      </h2>
                      <p className="text-xs font-semibold text-[#145C46]">
                        {visible ? 'Publicado' : mod.label}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#566A63]">
                    S/ {PUBLIC_EVENT_MONTHLY_PEN} al mes · Evento público · {formatShortDate(evt.startsAt)}
                  </p>
                  <Link
                    to={`/cuenta/publicaciones/${evt.id}`}
                    className="w-full min-h-[48px] px-4 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-sm font-bold flex items-center justify-center no-underline"
                  >
                    Gestionar
                  </Link>
                </article>
              );
            })}
          </div>
        </>
      )}

      {/* Editorial info block matching desktop/business.tsx.reference */}
      <div className="bg-[#E7F3ED] rounded-[16px] p-5 sm:p-6 flex items-start gap-4">
        <MessageSquare className="w-6 h-6 text-[#145C46] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-[17px] font-bold text-[#172D28]">
            Tu evento se publica después de la revisión.
          </p>
          <p className="text-[13px] text-[#566A63]">
            S/ {PUBLIC_EVENT_MONTHLY_PEN} por evento al mes. La aprobación y la verificación del pago se gestionan por separado.
          </p>
        </div>
      </div>
    </div>
  );
};

export const PublicationFormPage: React.FC<{ mode?: 'create' | 'edit' }> = ({
  mode,
}) => {
  const { publicEventId } = useParams();
  const navigate = useNavigate();
  const { currentUser, publicEvents, savePublicEventDraft } = useDemoStore();

  const isEdit = mode === 'edit' || Boolean(publicEventId);
  const existing = publicEventId
    ? publicEvents.find((e) => e.id === publicEventId)
    : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [zone, setZone] = useState<string>(existing?.zone ?? LIMA_ZONES[0]);
  const [address, setAddress] = useState(existing?.address ?? '');
  const [organizerName, setOrganizerName] = useState(
    existing?.organizerName ?? currentUser?.name ?? ''
  );
  const [whatsappPhone, setWhatsappPhone] = useState(
    existing?.whatsappPhone ?? currentUser?.phone ?? ''
  );
  const [summary, setSummary] = useState(existing?.summary ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return <GuardDenied403 />;
  if (isEdit && !existing) return <NotFound404 title="Evento no encontrado" />;
  if (existing && existing.ownerId !== currentUser.id) return <GuardDenied403 />;

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await savePublicEventDraft({
      publicEventId: existing?.id,
      title,
      category: existing?.category ?? EVENT_CATEGORIES[0],
      zone,
      address,
      startsAt: existing?.startsAt ?? '2026-12-26T18:00:00-05:00',
      endsAt: existing?.endsAt ?? '2026-12-26T22:00:00-05:00',
      entryPricePen: existing?.entryPricePen ?? 0,
      isFree: existing?.isFree ?? true,
      whatsappPhone,
      organizerName,
      summary,
      description,
      submitForReview: false,
    });
    if (!res.ok || !res.data) {
      setError(res.error || 'No se pudo guardar el evento.');
      return;
    }
    navigate(`/cuenta/publicaciones/${res.data.id}/editar/detalles`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={
            existing ? `/cuenta/publicaciones/${existing.id}` : '/cuenta/publicaciones'
          }
          label="Mis eventos públicos"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          {isEdit ? `Editar evento: ${existing?.title}` : 'Crear evento público · Paso 1 de 2'}
        </h1>
        <p className="text-sm text-[#566A63]">
          Define título, ubicación exacta y descripción para los asistentes.
        </p>
      </div>

      {error && <InlineNotice tone="danger">{error}</InlineNotice>}

      <form
        onSubmit={handleNext}
        className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 sm:p-6 space-y-4"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Título del evento</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Festival de Café y Diseño en Patio Barranco"
            className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
            required
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Distrito</span>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm bg-white"
            >
              {LIMA_ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Dirección</span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej. Av. Sáenz Peña 214, Barranco"
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Organizador visible</span>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">WhatsApp para consultas</span>
            <input
              type="tel"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Resumen corto</span>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Qué hará especial este encuentro"
            className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Descripción detallada</span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
          />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/cuenta/publicaciones"
            className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
          >
            Continuar a categoría, precio y horario
          </button>
        </div>
      </form>
    </div>
  );
};

export const PublicationDetailsPage: React.FC = () => {
  const { publicEventId } = useParams();
  const navigate = useNavigate();
  const { currentUser, publicEvents, savePublicEventDraft } = useDemoStore();

  const existing = publicEvents.find((e) => e.id === publicEventId);

  const [category, setCategory] = useState<string>(
    existing?.category ?? EVENT_CATEGORIES[0]
  );
  const [isFree, setIsFree] = useState(existing?.isFree ?? false);
  const [entryPricePen, setEntryPricePen] = useState(
    existing ? String(existing.entryPricePen) : '35'
  );
  const [startsAt, setStartsAt] = useState(
    existing ? existing.startsAt.slice(0, 16) : '2026-12-26T18:00'
  );
  const [endsAt, setEndsAt] = useState(
    existing ? existing.endsAt.slice(0, 16) : '2026-12-26T22:30'
  );
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return <GuardDenied403 />;
  if (!existing) return <NotFound404 title="Evento no encontrado" />;
  if (existing.ownerId !== currentUser.id) return <GuardDenied403 />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await savePublicEventDraft({
      publicEventId: existing.id,
      title: existing.title,
      category,
      zone: existing.zone,
      address: existing.address,
      startsAt: `${startsAt}:00-05:00`,
      endsAt: `${endsAt}:00-05:00`,
      entryPricePen: isFree ? 0 : Number(entryPricePen) || 0,
      isFree,
      whatsappPhone: existing.whatsappPhone,
      organizerName: existing.organizerName,
      summary: existing.summary,
      description: existing.description,
      submitForReview: false,
    });
    if (!res.ok) {
      setError(res.error || 'Verifica el horario y los precios.');
      return;
    }
    navigate(`/cuenta/publicaciones/${existing.id}/revisar`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/publicaciones/${existing.id}/editar`}
          label="Datos generales"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          Categoría, precio y fecha final
        </h1>
        <p className="text-sm text-[#566A63]">
          Paso 2 de 2 para {existing.title}. El horario final determina cuándo deja de mostrarse el evento en cartelera.
        </p>
      </div>

      {error && <InlineNotice tone="danger">{error}</InlineNotice>}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 sm:p-6 space-y-4"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Categoría</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm bg-white"
          >
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <label className="flex items-center gap-2.5 min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] cursor-pointer">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="w-4 h-4 accent-[#145C46]"
            />
            <span className="text-sm font-semibold text-[#172D28]">Ingreso gratuito</span>
          </label>
          {!isFree && (
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">
                Precio de entrada (PEN S/)
              </span>
              <input
                type="number"
                min={1}
                value={entryPricePen}
                onChange={(e) => setEntryPricePen(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm tabular-nums"
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Inicio</span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Fin (endsAt)</span>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
              required
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
          >
            Guardar y ver vista previa
          </button>
        </div>
      </form>
    </div>
  );
};

export const PublicationReviewPage: React.FC = () => {
  const { publicEventId } = useParams();
  const navigate = useNavigate();
  const { currentUser, publicEvents, savePublicEventDraft } = useDemoStore();
  const [notice, setNotice] = useState<string | null>(null);

  const event = publicEvents.find((e) => e.id === publicEventId);

  if (!currentUser) return <GuardDenied403 />;
  if (!event) return <NotFound404 title="Evento no encontrado" />;
  if (event.ownerId !== currentUser.id) return <GuardDenied403 />;

  const handleSendForReview = async () => {
    const res = await savePublicEventDraft({
      publicEventId: event.id,
      title: event.title,
      category: event.category,
      zone: event.zone,
      address: event.address,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      entryPricePen: event.entryPricePen,
      isFree: event.isFree,
      whatsappPhone: event.whatsappPhone,
      organizerName: event.organizerName,
      summary: event.summary,
      description: event.description,
      submitForReview: true,
    });
    if (res.ok) {
      setNotice(
        'Publicación enviada a moderación. Recuerda activar el plan mensual de S/ 100.'
      );
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/publicaciones/${event.id}/editar/detalles`}
          label="Ajustar detalles"
        />
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#172D28] mt-2 tracking-[-0.02em]">
          Mis eventos públicos
        </h1>
        <p className="text-sm text-[#566A63] mt-1">
          Vista previa antes de enviar a moderación y continuar con el pago.
        </p>
      </div>

      {notice && (
        <InlineNotice tone="success" title="Enviado a revisión">
          {notice}{' '}
          <Link to={`/cuenta/publicaciones/${event.id}/plan`} className="font-bold text-[#145C46]">
            Continuar al plan S/ 100 →
          </Link>
        </InlineNotice>
      )}

      {/* 2-col Figma Layout matching desktop/eventReview.tsx.reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-[16px] p-6 space-y-5">
          <div className="h-[210px] rounded-[12px] overflow-hidden bg-[#E7F3ED]">
            <SafeImage src={event.imageUrl} alt={event.title} />
          </div>
          <ResourceCoverUpload kind="public_event" resourceId={event.id} />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge {...mapModerationStatus(event.contentStatus)} />
            </div>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#172D28] leading-tight">
              {event.title}
            </h2>
            <p className="text-[17px] font-semibold text-[#145C46]">
              {event.category} · {formatShortDate(event.startsAt)} · {event.zone}
            </p>
          </div>
          <p className="text-[16px] text-[#566A63] leading-relaxed">
            {event.description ||
              'La ficha mostrará fotos, descripción, ubicación o cobertura y el contacto público que proporcionaste.'}
          </p>
          <div className="flex flex-wrap gap-4 pt-3 border-t border-[#DCE4DF] text-xs text-[#566A63]">
            <span>Inicio: {formatDateTime(event.startsAt)}</span>
            <span>Fin: {formatDateTime(event.endsAt)}</span>
            <span className="font-bold text-[#145C46]">
              Entrada: {event.isFree ? 'Gratis' : formatPen(event.entryPricePen)}
            </span>
          </div>
        </div>

        <aside className="lg:col-span-4 bg-[#E7F3ED] rounded-[16px] p-6 space-y-5">
          <div>
            <p className="text-[44px] leading-none font-bold text-[#145C46] tabular-nums">
              S/ {PUBLIC_EVENT_MONTHLY_PEN}
            </p>
            <p className="text-[18px] font-semibold text-[#172D28] mt-2">
              por evento / mes
            </p>
            <p className="text-sm text-[#566A63] mt-3">
              Renovación mensual manual
            </p>
          </div>

          <p className="text-[16px] text-[#566A63] leading-relaxed">
            Publicamos cuando el contenido está aprobado y el pago está verificado para el periodo.
          </p>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(`/cuenta/publicaciones/${event.id}/pagos/nuevo`)}
              className="w-full min-h-[48px] px-5 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
            >
              Continuar al pago
            </button>
            <button
              type="button"
              onClick={handleSendForReview}
              className="w-full min-h-[48px] px-5 py-3 rounded-[12px] bg-white hover:bg-[#F6F8F7] text-[#145C46] text-sm font-bold cursor-pointer"
            >
              Enviar a revisión
            </button>
          </div>

          <p className="text-xs text-[#566A63]">
            No hay cargos reales en el prototipo.
          </p>
        </aside>
      </div>

      <div>
        <Link
          to={`/cuenta/publicaciones/${event.id}/editar`}
          className="min-h-[48px] px-6 py-3 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/70 text-[#145C46] text-sm font-bold inline-flex items-center justify-center no-underline"
        >
          Volver a editar evento
        </Link>
      </div>
    </div>
  );
};

export const PublicationDetailPage: React.FC = () => {
  const { publicEventId } = useParams();
  const { currentUser, publicEvents, payments } = useDemoStore();
  const event = publicEvents.find((e) => e.id === publicEventId);

  if (!currentUser) return <GuardDenied403 />;
  if (!event) return <NotFound404 title="Publicación no encontrada" />;
  if (event.ownerId !== currentUser.id) return <GuardDenied403 />;

  const mod = mapModerationStatus(event.contentStatus);
  const pay = mapPaymentStatus(event.paymentStatus);
  const visible = isPublicEventVisible(event);
  const ended = isEventEnded(event);
  const evtPayments = payments.filter(
    (p) => p.resourceKind === 'public_event' && p.resourceId === event.id
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <BackButton fallbackTo="/cuenta/publicaciones" label="Mis eventos públicos" />
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusBadge tone={mod.tone} label={mod.label} />
            <StatusBadge tone={pay.tone} label={pay.label} />
            {visible ? (
              <StatusBadge tone="brand" label="Visible en cartelera" />
            ) : (
              <StatusBadge tone="neutral" label="No visible al público" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
            {event.title}
          </h1>
          <p className="text-sm text-[#566A63]">
            {event.category} · {event.zone} · Versión {event.version}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/cuenta/publicaciones/${event.id}/editar`}
            className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#DCE4DF] bg-white text-[#172D28] text-sm font-semibold inline-flex items-center gap-2 no-underline"
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
            <span>Editar</span>
          </Link>
          <Link
            to={`/cuenta/publicaciones/${event.id}/revisar`}
            className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#DCE4DF] bg-white text-[#172D28] text-sm font-semibold inline-flex items-center gap-2 no-underline"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>Vista previa</span>
          </Link>
          {visible && (
            <Link
              to={`/eventos/${event.id}`}
              className="min-h-[44px] px-4 py-2 rounded-[12px] bg-[#145C46] text-white text-sm font-semibold inline-flex items-center no-underline"
            >
              Ver ficha pública
            </Link>
          )}
        </div>
      </div>

      {!visible && (
        <InlineNotice tone={event.observationNote ? 'warning' : 'info'} title="Regla de visibilidad pública">
          El evento aparece en Explorar y Mapa solo cuando cumple las 4 condiciones:
          contenido aprobado ({event.contentStatus === 'approved' ? 'sí' : 'no'}), pago verificado ({event.paymentStatus === 'verified' ? 'sí' : 'no'}), periodo activo ({event.subscriptionActive ? 'sí' : 'no'}) y fecha vigente ({ended ? 'finalizado' : 'vigente'}).
          {event.observationNote && (
            <p className="mt-2 font-semibold">Observación actual: {event.observationNote}</p>
          )}
        </InlineNotice>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 space-y-3">
          <h2 className="text-base font-bold text-[#172D28]">Datos del evento</h2>
          <p className="text-sm text-[#172D28]">{event.description}</p>
          <div className="text-xs text-[#566A63] space-y-1">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#145C46]" aria-hidden="true" />
              <span>{event.address}</span>
            </p>
            <p>
              Horario: {formatDateTime(event.startsAt)} — {formatDateTime(event.endsAt)}
            </p>
            <p className="font-bold text-[#145C46]">
              Entrada: {event.isFree ? 'Gratis' : formatPen(event.entryPricePen)}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#172D28]">Plan mensual S/ 100</h2>
            <CreditCard className="w-5 h-5 text-[#145C46]" aria-hidden="true" />
          </div>
          <p className="text-sm text-[#566A63]">
            Comprobantes registrados: <strong>{evtPayments.length}</strong> · Vigencia hasta{' '}
            {formatShortDate(event.subscriptionPeriodEnd)}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to={`/cuenta/publicaciones/${event.id}/plan`}
              className="min-h-[44px] px-4 py-2 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center no-underline"
            >
              Plan y comprobante
            </Link>
            <Link
              to={`/cuenta/publicaciones/${event.id}/facturacion`}
              className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
            >
              Historial de cobros
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PublicationPlanPage: React.FC = () => {
  const { publicEventId } = useParams();
  const { currentUser, publicEvents, settings } = useDemoStore();
  const event = publicEvents.find((e) => e.id === publicEventId);

  if (!currentUser) return <GuardDenied403 />;
  if (!event) return <NotFound404 title="Evento no encontrado" />;
  if (event.ownerId !== currentUser.id) return <GuardDenied403 />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton fallbackTo={`/cuenta/publicaciones/${event.id}`} label={event.title} />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          Plan mensual de evento público
        </h1>
      </div>

      <div className="bg-[#E7F3ED] border border-[#C7DFD3] rounded-[16px] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#D7EF98] text-[#172D28] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Publicación Destacada en Cartelera</span>
            </span>
            <h2 className="text-2xl font-extrabold text-[#172D28]">
              {formatPen(settings.publicEventMonthlyPen)} / mes
            </h2>
          </div>
          <StatusBadge {...mapPaymentStatus(event.paymentStatus)} />
        </div>

        <ul className="space-y-2 text-sm text-[#172D28]">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#145C46] shrink-0" aria-hidden="true" />
            <span>Presencia en Inicio, Explorar y Mapa interactivo de Lima</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#145C46] shrink-0" aria-hidden="true" />
            <span>Ficha con fecha, hora final, dirección y botón directo de contacto</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#145C46] shrink-0" aria-hidden="true" />
            <span>Verificación administrativa manual con comprobante (pagos deshabilitados)</span>
          </li>
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to={`/cuenta/publicaciones/${event.id}/pagos/nuevo`}
            className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center no-underline"
          >
            Subir comprobante (S/ {settings.publicEventMonthlyPen})
          </Link>
          <Link
            to={`/cuenta/publicaciones/${event.id}/pagos/instrucciones`}
            className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#145C46]/30 bg-white text-[#145C46] text-sm font-semibold inline-flex items-center no-underline"
          >
            Ver datos de cobro
          </Link>
        </div>
      </div>
    </div>
  );
};

export const PublicationCheckoutPage: React.FC = () => {
  const { publicEventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, publicEvents, settings, submitPaymentProof } = useDemoStore();
  const correctionPaymentId = searchParams.get('corregir') || undefined;

  const [proofReference, setProofReference] = useState(
    correctionPaymentId ? 'OP-EVT-CORREGIDA' : ''
  );
  const [proofFileName, setProofFileName] = useState('comprobante-evento-demo.jpg');
  const [proofNote, setProofNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const event = publicEvents.find((e) => e.id === publicEventId);

  if (!currentUser) return <GuardDenied403 />;
  if (!event) return <NotFound404 title="Evento no encontrado" />;
  if (event.ownerId !== currentUser.id) return <GuardDenied403 />;

  if (!settings.beneficiaryConfigured) return <EmptyState title="Pagos temporalmente deshabilitados" description="Podrás gestionar tus borradores y enviarlos a revisión. La activación de publicaciones estará disponible cuando se habiliten los pagos." actionLabel="Volver a mi cuenta" actionTo="/cuenta" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await submitPaymentProof({
      resourceKind: 'public_event',
      resourceId: event.id,
      proofReference,
      proofFileName,
      proofNote,
      correctionPaymentId,
    });
    if (!res.ok || !res.data) {
      setError(res.error || 'No se pudo registrar el comprobante.');
      return;
    }
    navigate(`/cuenta/publicaciones/${event.id}/pagos/${res.data.id}`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/publicaciones/${event.id}/plan`}
          label="Plan S/ 100"
        />
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#172D28] mt-2 tracking-[-0.02em]">
          {correctionPaymentId
            ? 'Corregir comprobante de publicación'
            : 'Mis eventos públicos'}
        </h1>
      </div>

      {error && <InlineNotice tone="danger">{error}</InlineNotice>}

      {/* 2-col Figma Layout matching desktop/eventPayment.tsx.reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-8 bg-white rounded-[16px] p-6 space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <span className="block text-sm font-semibold text-[#172D28]">
                Forma de pago
              </span>
              <div className="min-h-[52px] px-4 rounded-[12px] border border-[#DCE4DF] flex items-center text-sm text-[#566A63]">
                Pago manual con comprobante
              </div>
            </div>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">
                Referencia del pago
              </span>
              <input
                type="text"
                value={proofReference}
                onChange={(e) => setProofReference(e.target.value)}
                placeholder="Código de la operación"
                className="w-full min-h-[52px] px-4 rounded-[12px] border border-[#DCE4DF] text-sm"
              />
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-lg font-bold text-[#172D28]">Adjunta tu comprobante</p>
            <label className="bg-[#E7F3ED] hover:bg-[#D7EF98]/50 transition-colors rounded-[12px] p-6 flex flex-col items-center justify-center gap-3 cursor-pointer text-center">
              <Upload className="w-10 h-10 text-[#145C46]" aria-hidden="true" />
              <span className="text-[17px] font-semibold text-[#145C46]">
                Subir imagen o PDF del comprobante
              </span>
              <span className="text-xs text-[#566A63]">
                Archivo actual: <strong className="text-[#172D28]">{proofFileName}</strong>
              </span>
              <input
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setProofFileName(f.name);
                }}
              />
            </label>

            <input
              type="text"
              value={proofFileName}
              onChange={(e) => setProofFileName(e.target.value)}
              aria-label="Nombre de archivo del comprobante"
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-xs text-[#566A63]"
            />
          </div>

          <div className="bg-[#E7F3ED] rounded-[12px] p-4 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[15px] font-bold text-[#145C46]">
                Instrucciones del cobro
              </p>
              <Link
                to={`/cuenta/publicaciones/${event.id}/pagos/instrucciones`}
                className="text-xs font-bold text-[#145C46] hover:underline no-underline"
              >
                Ver detalle
              </Link>
            </div>
            <p className="text-xs text-[#566A63] leading-relaxed">
              {settings.beneficiaryConfigured
                ? 'Verifica siempre importe, destinatario y referencia antes de adjuntar.'
                : 'Los datos del beneficiario se configurarán antes de habilitar cobros. Verifica siempre importe, destinatario y referencia (simulación local demo).'}
            </p>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Observación opcional</span>
            <textarea
              rows={2}
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
            />
          </label>

          <div>
            <button
              type="submit"
              className="min-h-[48px] px-8 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
            >
              Enviar comprobante
            </button>
          </div>
        </form>

        <aside className="lg:col-span-4 bg-white rounded-[16px] p-6 space-y-5">
          <h2 className="text-[23px] font-bold text-[#172D28] leading-snug">
            {event.title}
          </h2>
          <p className="text-[36px] font-bold text-[#145C46] tabular-nums leading-tight">
            S/ {settings.publicEventMonthlyPen} / mes
          </p>
          <div className="space-y-2 text-[16px] text-[#566A63] leading-relaxed">
            <p>Un periodo por publicación.</p>
            <p>Renovación mensual manual.</p>
          </div>
          <p className="text-[16px] text-[#566A63] leading-relaxed pt-2 border-t border-[#DCE4DF]">
            Enviar el comprobante no confirma el cobro ni la publicación.
          </p>
        </aside>
      </div>
    </div>
  );
};

export const PublicationPaymentPage: React.FC = () => {
  const { publicEventId, paymentId } = useParams();
  const { currentUser, publicEvents, payments } = useDemoStore();
  const event = publicEvents.find((e) => e.id === publicEventId);
  const payment = payments.find(
    (p) =>
      p.id === paymentId &&
      p.resourceKind === 'public_event' &&
      p.resourceId === publicEventId
  );

  if (!currentUser) return <GuardDenied403 />;
  if (!event || !payment) return <NotFound404 title="Comprobante no encontrado" />;
  if (event.ownerId !== currentUser.id) return <GuardDenied403 />;

  const st = mapPaymentStatus(payment.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/publicaciones/${event.id}/facturacion`}
          label="Facturación del evento"
        />
        <div className="mt-2">
          <StatusBadge tone={st.tone} label={st.label} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          Orden {payment.orderId}
        </h1>
      </div>

      {payment.observationReason && (
        <InlineNotice tone="danger" title="Comprobante observado">
          {payment.observationReason}
        </InlineNotice>
      )}

      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-[#566A63]">Evento</span>
          <span className="font-bold text-[#172D28]">{event.title}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#566A63]">Importe</span>
          <span className="font-extrabold text-[#145C46] tabular-nums">
            {formatPen(payment.amountPen)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#566A63]">Referencia</span>
          <span className="font-semibold text-[#172D28]">{payment.proofReference}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#566A63]">Archivo</span>
          <span className="font-semibold text-[#172D28]">{payment.proofFileName}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#566A63]">Registrado</span>
          <span className="font-semibold text-[#172D28]">
            {formatDateTime(payment.submittedAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {payment.status === 'observed' && (
          <Link
            to={`/cuenta/publicaciones/${event.id}/pagos/nuevo?corregir=${payment.id}`}
            className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center no-underline"
          >
            Subir nuevo comprobante
          </Link>
        )}
        <Link
          to={`/cuenta/publicaciones/${event.id}`}
          className="min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#DCE4DF] bg-white text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
        >
          Volver a la publicación
        </Link>
      </div>
    </div>
  );
};

export const PublicationBillingPage: React.FC = () => {
  const { publicEventId } = useParams();
  const { currentUser, publicEvents, payments, subscriptions } = useDemoStore();
  const event = publicEvents.find((e) => e.id === publicEventId);

  if (!currentUser) return <GuardDenied403 />;
  if (!event) return <NotFound404 title="Evento no encontrado" />;
  if (event.ownerId !== currentUser.id) return <GuardDenied403 />;

  const evtPayments = payments.filter(
    (p) => p.resourceKind === 'public_event' && p.resourceId === event.id
  );
  const sub = subscriptions.find(
    (s) => s.resourceKind === 'public_event' && s.resourceId === event.id
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <BackButton fallbackTo={`/cuenta/publicaciones/${event.id}`} label={event.title} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
            Periodo, vigencia y renovaciones
          </h1>
        </div>
        <Link
          to={`/cuenta/publicaciones/${event.id}/pagos/nuevo`}
          className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center no-underline"
        >
          Registrar comprobante
        </Link>
      </div>

      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#566A63]">Plan Evento Público</p>
          <p className="text-lg font-extrabold text-[#172D28]">
            S/ {PUBLIC_EVENT_MONTHLY_PEN} / mes
          </p>
          <p className="text-xs text-[#566A63]">
            Vigencia: {sub ? `${formatShortDate(sub.periodStart)} – ${formatShortDate(sub.periodEnd)}` : 'Pendiente'}
          </p>
        </div>
        <StatusBadge
          tone={event.subscriptionActive ? 'success' : 'warning'}
          label={event.subscriptionActive ? 'Periodo activo' : 'Pendiente de pago'}
        />
      </div>

      {evtPayments.length === 0 ? (
        <EmptyState
          title="Sin comprobantes enviados"
          description="Envía el comprobante del plan S/ 100/mes para activar la publicación."
          actionLabel="Subir comprobante"
          actionTo={`/cuenta/publicaciones/${event.id}/pagos/nuevo`}
        />
      ) : (
        <div className="space-y-3">
          {evtPayments.map((p) => {
            const st = mapPaymentStatus(p.status);
            return (
              <Link
                key={p.id}
                to={`/cuenta/publicaciones/${event.id}/pagos/${p.id}`}
                className="block bg-white border border-[#DCE4DF] hover:border-[#145C46] rounded-[16px] p-4 no-underline"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#172D28]">
                      {p.orderId} · Ref. {p.proofReference}
                    </p>
                    <p className="text-xs text-[#566A63]">
                      {p.periodLabel} · {formatShortDate(p.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-[#145C46] tabular-nums">
                      {formatPen(p.amountPen)}
                    </span>
                    <StatusBadge tone={st.tone} label={st.label} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const PublicationPaymentInfoPage: React.FC = () => {
  const { publicEventId } = useParams();
  const { currentUser, publicEvents, settings } = useDemoStore();
  const event = publicEvents.find((e) => e.id === publicEventId);

  if (!currentUser) return <GuardDenied403 />;
  if (!event) return <NotFound404 title="Evento no encontrado" />;
  if (event.ownerId !== currentUser.id) return <GuardDenied403 />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/publicaciones/${event.id}/pagos/nuevo`}
          label="Comprobante de publicación"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          Datos habilitados para el cobro
        </h1>
      </div>

      {!settings.beneficiaryConfigured ? (
        <InlineNotice tone="warning" title="Beneficiario oficial no configurado">
          {settings.beneficiaryNote} Puedes activar valores de ejemplo desde{' '}
          <Link to="/admin/configuracion/publicaciones" className="font-bold text-[#145C46]">
            Configuración administrativa
          </Link>{' '}
          Los pagos están deshabilitados temporalmente.
        </InlineNotice>
      ) : (
        <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[#566A63]">Beneficiario</span>
            <span className="font-bold text-[#172D28]">{settings.beneficiaryName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#566A63]">Canal</span>
            <span className="font-bold text-[#172D28]">{settings.beneficiaryChannel}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#566A63]">Cuenta / referencia</span>
            <span className="font-bold text-[#145C46]">{settings.beneficiaryAccount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#566A63]">Tarifa evento público</span>
            <span className="font-extrabold text-[#172D28] tabular-nums">
              {formatPen(settings.publicEventMonthlyPen)} / mes
            </span>
          </div>
        </div>
      )}

      <Link
        to={`/cuenta/publicaciones/${event.id}/pagos/nuevo`}
        className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center no-underline"
      >
        Volver a registrar comprobante
      </Link>
    </div>
  );
};
