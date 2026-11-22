import React, { useMemo, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  CreditCard,
  Edit3,
  Eye,
  FileText,
  Plus,
  Send,
  ShieldAlert,
  Sparkles,
  Store,
  Upload,
} from 'lucide-react';
import { BUSINESS_CATEGORIES, LIMA_ZONES } from '../data/seed';
import {
  BUSINESS_MONTHLY_PEN,
  formatDateTime,
  formatPen,
  formatShortDate,
  isBusinessVisible,
} from '../domain/predicates';
import { useDemoStore } from '../repositories/demoStore';
import { ResourceCoverUpload } from '../components/ui/ResourceCoverUpload';
import { ConfirmModal } from '../components/ui/ConfirmModal';
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
  mapQuoteStatus,
} from '../components/ui/StatusBadge';

export const BusinessListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, businesses, services, quoteRequests } = useDemoStore();
  const [selectedBizId, setSelectedBizId] = useState<string>('');
  const statusFilter = searchParams.get('estado') || 'todos';

  if (!currentUser) {
    return (
      <GuardDenied403
        title="Inicia sesión para gestionar tus negocios"
        description="Con tu cuenta puedes crear fichas de proveedor, administrar servicios y activar el plan mensual de S/ 30."
      />
    );
  }

  const myBusinesses = businesses.filter((b) => b.ownerId === currentUser.id);
  const filteredBusinesses = myBusinesses.filter((b) => {
    if (statusFilter === 'publicados') return isBusinessVisible(b);
    if (statusFilter === 'revision')
      return b.contentStatus === 'pending' || b.contentStatus === 'observed';
    if (statusFilter === 'borradores') return b.contentStatus === 'draft';
    return true;
  });

  const activeBusiness =
    filteredBusinesses.find((b) => b.id === selectedBizId) ??
    filteredBusinesses[0] ??
    myBusinesses[0];
  const activePendingQuotes = activeBusiness
    ? quoteRequests.filter(
        (r) => r.businessId === activeBusiness.id && r.status === 'pending'
      ).length
    : 0;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <BackButton fallbackTo="/cuenta" label="Mi cuenta" />
          <h1 className="text-[28px] sm:text-[34px] font-bold text-[#172D28] mt-1 tracking-[-0.02em]">
            Panel de negocios
          </h1>
          <p className="text-[15px] text-[#566A63] mt-1">
            Todos los negocios que administras, con su estado y vigencia (plan S/ 30/mes).
          </p>
        </div>

        <Link
          to="/cuenta/negocios/nuevo"
          className="min-h-[48px] px-6 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center justify-center gap-2 no-underline shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Crear negocio</span>
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'todos', label: `Todos (${myBusinesses.length})` },
          {
            key: 'publicados',
            label: `Publicados (${myBusinesses.filter((b) => isBusinessVisible(b)).length})`,
          },
          {
            key: 'revision',
            label: `En revisión (${
              myBusinesses.filter(
                (b) => b.contentStatus === 'pending' || b.contentStatus === 'observed'
              ).length
            })`,
          },
          {
            key: 'borradores',
            label: `Borradores (${myBusinesses.filter((b) => b.contentStatus === 'draft').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() =>
              setSearchParams(tab.key === 'todos' ? {} : { estado: tab.key })
            }
            className={`min-h-[40px] px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-[#145C46] text-white'
                : 'bg-[#E7F3ED] text-[#145C46]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {myBusinesses.length === 0 ? (
        <EmptyState
          title="Todavía no registras un negocio"
          description="Crea tu ficha de proveedor con servicios, zonas de cobertura en Lima y precios de referencia."
          actionLabel="Crear mi primer negocio"
          actionTo="/cuenta/negocios/nuevo"
        />
      ) : filteredBusinesses.length === 0 ? (
        <EmptyState
          title="No hay negocios en este filtro"
          description="Cambia de filtro o registra una nueva ficha de proveedor."
          actionLabel="Ver todos los negocios"
          actionTo="/cuenta/negocios"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Business Cards Grid */}
          <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredBusinesses.map((biz) => {
              const mod = mapModerationStatus(biz.contentStatus);
              const visible = isBusinessVisible(biz);
              const isSelected = activeBusiness?.id === biz.id;
              const srvCount = services.filter((s) => s.businessId === biz.id).length;
              const pendingQuotes = quoteRequests.filter(
                (r) => r.businessId === biz.id && r.status === 'pending'
              ).length;

              return (
                <article
                  key={biz.id}
                  onClick={() => setSelectedBizId(biz.id)}
                  className={`bg-white rounded-[16px] p-4 flex flex-col justify-between gap-4 border transition-colors cursor-pointer ${
                    isSelected ? 'border-[#145C46]' : 'border-transparent hover:border-[#DCE4DF]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-[88px] h-[76px] rounded-[12px] overflow-hidden shrink-0 bg-[#E7F3ED]">
                        <SafeImage src={biz.imageUrl} alt={biz.name} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h2 className="text-[17px] font-bold text-[#172D28] leading-snug line-clamp-2">
                          {biz.name}
                        </h2>
                        <p className="text-xs font-semibold text-[#145C46]">
                          {visible ? 'Publicado' : mod.label}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[#566A63]">
                      S/ {BUSINESS_MONTHLY_PEN} al mes ·{' '}
                      {biz.subscriptionActive ? 'Vigente' : 'Sin activar'} · {srvCount} servicios
                      {pendingQuotes > 0 ? ` · ${pendingQuotes} por responder` : ''}
                    </p>

                    {biz.observationNote && (
                      <InlineNotice tone="warning" title="Observación de revisión">
                        {biz.observationNote}
                      </InlineNotice>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/cuenta/negocios/${biz.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-h-[48px] px-4 py-2.5 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/70 text-[#145C46] text-sm font-bold inline-flex items-center justify-center no-underline"
                    >
                      Gestionar
                    </Link>
                    <Link
                      to={`/cuenta/negocios/${biz.id}/solicitudes`}
                      onClick={(e) => e.stopPropagation()}
                      className="lg:hidden min-h-[48px] px-4 py-2.5 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold inline-flex items-center justify-center no-underline"
                    >
                      Solicitudes ({pendingQuotes})
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop Right Summary Panel matching desktop/businesses.tsx.reference */}
          {activeBusiness && (
            <aside className="hidden lg:block lg:col-span-5 xl:col-span-4 bg-white rounded-[16px] p-6 space-y-5 sticky top-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#145C46]">
                  Negocio seleccionado
                </span>
                <h2 className="text-[26px] leading-tight font-bold text-[#172D28]">
                  {activeBusiness.name}
                </h2>
                <p className="text-[16px] text-[#566A63] leading-relaxed">
                  Recibe solicitudes, responde con una propuesta y gestiona los servicios que se muestran en tu perfil.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  to={`/cuenta/negocios/${activeBusiness.id}/solicitudes`}
                  className="w-full min-h-[48px] px-5 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold flex items-center justify-center no-underline"
                >
                  Ver solicitudes recibidas ({activePendingQuotes} pendientes)
                </Link>
                <Link
                  to={`/cuenta/negocios/${activeBusiness.id}/plan`}
                  className="w-full min-h-[48px] px-5 py-3 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/70 text-[#145C46] text-sm font-bold flex items-center justify-center no-underline"
                >
                  Mi plan de S/ {BUSINESS_MONTHLY_PEN}
                </Link>
              </div>

              <div className="pt-3 border-t border-[#DCE4DF] flex items-center justify-between text-xs font-semibold">
                <Link
                  to={`/cuenta/negocios/${activeBusiness.id}/servicios`}
                  className="text-[#145C46] hover:underline no-underline"
                >
                  Administrar servicios →
                </Link>
                <Link
                  to={`/cuenta/negocios/${activeBusiness.id}/facturacion`}
                  className="text-[#566A63] hover:text-[#145C46] no-underline"
                >
                  Facturación
                </Link>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
};

export const BusinessFormPage: React.FC<{ mode?: 'create' | 'edit' }> = ({
  mode,
}) => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { currentUser, businesses, saveBusinessDraft } = useDemoStore();

  const isEdit = mode === 'edit' || Boolean(businessId);
  const existing = businessId
    ? businesses.find((b) => b.id === businessId)
    : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState<string>(
    existing?.category ?? BUSINESS_CATEGORIES[0]
  );
  const [zone, setZone] = useState<string>(existing?.zone ?? LIMA_ZONES[0]);
  const [coverageZones, setCoverageZones] = useState<string[]>(
    existing?.coverageZones ?? [LIMA_ZONES[0], LIMA_ZONES[1]]
  );
  const [summary, setSummary] = useState(existing?.summary ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [quoteOnly, setQuoteOnly] = useState(existing?.quoteOnly ?? false);
  const [startingPrice, setStartingPrice] = useState(
    existing?.startingPricePen ? String(existing.startingPricePen) : '450'
  );
  const [whatsappPhone, setWhatsappPhone] = useState(
    existing?.whatsappPhone ?? currentUser?.phone ?? ''
  );
  const [email, setEmail] = useState(existing?.email ?? currentUser?.email ?? '');
  const [availabilityNote, setAvailabilityNote] = useState(
    existing?.availabilityNote ?? 'Disponible fines de semana y feriados en Lima.'
  );
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) {
    return <GuardDenied403 title="Inicia sesión para editar negocios" />;
  }
  if (isEdit && !existing) {
    return <NotFound404 title="Negocio no encontrado" />;
  }
  if (existing && existing.ownerId !== currentUser.id) {
    return <GuardDenied403 title="Solo el dueño del negocio puede editar esta ficha" />;
  }

  const toggleCoverage = (z: string) => {
    setDirty(true);
    setCoverageZones((prev) =>
      prev.includes(z) ? prev.filter((item) => item !== z) : [...prev, z]
    );
  };

  const handleSave = async (nextAction: 'stay' | 'review') => {
    setError(null);
    const res = await saveBusinessDraft({
      businessId: existing?.id,
      name,
      category,
      zone,
      coverageZones: coverageZones.length > 0 ? coverageZones : [zone],
      summary,
      description,
      startingPricePen: quoteOnly ? null : Number(startingPrice) || 0,
      quoteOnly,
      whatsappPhone,
      email,
      availabilityNote,
      submitForReview: false,
    });
    if (!res.ok || !res.data) {
      setError(res.error || 'No se pudo guardar el borrador.');
      return;
    }
    setDirty(false);
    if (nextAction === 'review') {
      navigate(`/cuenta/negocios/${res.data.id}/revisar`);
    } else {
      navigate(`/cuenta/negocios/${res.data.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={existing ? `/cuenta/negocios/${existing.id}` : '/cuenta/negocios'}
          label={existing ? 'Volver al negocio' : 'Mis negocios'}
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          {isEdit ? `Editar ficha: ${existing?.name}` : 'Registrar nuevo negocio'}
        </h1>
        <p className="text-sm text-[#566A63] mt-1">
          {isEdit
            ? 'Al guardar actualizas la ficha existente sin crear duplicados.'
            : 'Completa los datos comerciales antes de revisar y enviar a aprobación.'}
        </p>
      </div>

      {dirty && (
        <InlineNotice tone="warning" title="Cambios sin guardar">
          Recuerda guardar como borrador o continuar hacia la vista previa antes de salir.
        </InlineNotice>
      )}
      {error && <InlineNotice tone="danger">{error}</InlineNotice>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave('review');
        }}
        className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 sm:p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-semibold text-[#172D28]">Nombre comercial</span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setDirty(true);
                setName(e.target.value);
              }}
              placeholder="Ej. Luz & Patio Decoraciones"
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
              required
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Categoría</span>
            <select
              value={category}
              onChange={(e) => {
                setDirty(true);
                setCategory(e.target.value);
              }}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm bg-white"
            >
              {BUSINESS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Distrito base</span>
            <select
              value={zone}
              onChange={(e) => {
                setDirty(true);
                setZone(e.target.value);
              }}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm bg-white"
            >
              {LIMA_ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-[#172D28] block">
            Zonas de cobertura en Lima
          </span>
          <div className="flex flex-wrap gap-2">
            {LIMA_ZONES.map((z) => {
              const selected = coverageZones.includes(z);
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => toggleCoverage(z)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-[12px] border text-xs font-semibold cursor-pointer ${
                    selected
                      ? 'bg-[#E7F3ED] border-[#145C46] text-[#145C46]'
                      : 'bg-white border-[#DCE4DF] text-[#566A63]'
                  }`}
                >
                  {z}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Resumen breve</span>
          <input
            type="text"
            value={summary}
            onChange={(e) => {
              setDirty(true);
              setSummary(e.target.value);
            }}
            placeholder="Propuesta principal en una línea clara"
            className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Descripción completa</span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => {
              setDirty(true);
              setDescription(e.target.value);
            }}
            placeholder="Describe experiencia, montaje, tiempos de entrega y qué diferencia a tu negocio."
            className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <label className="flex items-center gap-2.5 min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] cursor-pointer">
            <input
              type="checkbox"
              checked={quoteOnly}
              onChange={(e) => {
                setDirty(true);
                setQuoteOnly(e.target.checked);
              }}
              className="w-4 h-4 accent-[#145C46]"
            />
            <span className="text-sm font-semibold text-[#172D28]">
              Solo por cotización personalizada
            </span>
          </label>

          {!quoteOnly && (
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">
                Precio referencial desde (PEN S/)
              </span>
              <input
                type="number"
                min={1}
                value={startingPrice}
                onChange={(e) => {
                  setDirty(true);
                  setStartingPrice(e.target.value);
                }}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm tabular-nums"
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">WhatsApp de contacto</span>
            <input
              type="tel"
              value={whatsappPhone}
              onChange={(e) => {
                setDirty(true);
                setWhatsappPhone(e.target.value);
              }}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Correo comercial</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setDirty(true);
                setEmail(e.target.value);
              }}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
            />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Disponibilidad habitual</span>
          <input
            type="text"
            value={availabilityNote}
            onChange={(e) => {
              setDirty(true);
              setAvailabilityNote(e.target.value);
            }}
            className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
          />
        </label>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSave('stay')}
            className="min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#DCE4DF] bg-white hover:bg-[#F6F8F7] text-[#172D28] text-sm font-semibold cursor-pointer"
          >
            Guardar borrador
          </button>
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
          >
            Guardar y revisar ficha
          </button>
        </div>
      </form>
    </div>
  );
};

export const BusinessDetailPage: React.FC = () => {
  const { businessId } = useParams();
  const { currentUser, businesses, services, quoteRequests, payments } = useDemoStore();

  const business = businesses.find((b) => b.id === businessId);

  if (!currentUser) {
    return <GuardDenied403 title="Inicia sesión para gestionar este negocio" />;
  }
  if (!business) {
    return <NotFound404 title="Negocio no encontrado" />;
  }
  if (business.ownerId !== currentUser.id) {
    return <GuardDenied403 title="No tienes permisos sobre este negocio" />;
  }

  const mod = mapModerationStatus(business.contentStatus);
  const pay = mapPaymentStatus(business.paymentStatus);
  const visible = isBusinessVisible(business);
  const bizServices = services.filter((s) => s.businessId === business.id);
  const bizRequests = quoteRequests.filter((r) => r.businessId === business.id);
  const bizPayments = payments.filter(
    (p) => p.resourceKind === 'business' && p.resourceId === business.id
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <BackButton fallbackTo="/cuenta/negocios" label="Mis negocios" />
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusBadge tone={mod.tone} label={mod.label} />
            <StatusBadge tone={pay.tone} label={pay.label} />
            {visible ? (
              <StatusBadge tone="brand" label="Visible en catálogo y mapa" />
            ) : (
              <StatusBadge tone="neutral" label="Aún no visible al público" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
            {business.name}
          </h1>
          <p className="text-sm text-[#566A63]">
            {business.category} · {business.zone} · Versión {business.version}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/cuenta/negocios/${business.id}/editar`}
            className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#DCE4DF] bg-white hover:bg-[#F6F8F7] text-[#172D28] text-sm font-semibold inline-flex items-center gap-2 no-underline"
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
            <span>Editar datos</span>
          </Link>
          <Link
            to={`/cuenta/negocios/${business.id}/revisar`}
            className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#DCE4DF] bg-white hover:bg-[#F6F8F7] text-[#172D28] text-sm font-semibold inline-flex items-center gap-2 no-underline"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>Vista previa</span>
          </Link>
          {visible && (
            <Link
              to={`/proveedores/${business.id}`}
              className="min-h-[44px] px-4 py-2 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-semibold inline-flex items-center gap-2 no-underline"
            >
              <span>Ver ficha pública</span>
            </Link>
          )}
        </div>
      </div>

      {!visible && (
        <InlineNotice
          tone={business.contentStatus === 'observed' || business.contentStatus === 'rejected' ? 'warning' : 'info'}
          title="Condiciones para visibilidad pública"
        >
          Para aparecer en Explorar proveedores y Mapa necesitas dos requisitos activos:
          (1) contenido aprobado por moderación y (2) comprobante verificado del plan de S/ 30/mes.
          {business.observationNote && (
            <p className="mt-2 font-semibold">Observación actual: {business.observationNote}</p>
          )}
        </InlineNotice>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#172D28]">Servicios del negocio</h2>
            <Briefcase className="w-5 h-5 text-[#145C46]" aria-hidden="true" />
          </div>
          <p className="text-2xl font-extrabold text-[#172D28] tabular-nums">
            {bizServices.length}
          </p>
          <p className="text-xs text-[#566A63]">
            Define paquetes con precio fijo en soles o modalidad por cotizar.
          </p>
          <Link
            to={`/cuenta/negocios/${business.id}/servicios`}
            className="inline-flex min-h-[44px] items-center justify-center w-full rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-sm font-bold hover:bg-[#D7EF98]/50 no-underline"
          >
            Administrar servicios
          </Link>
        </div>

        <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#172D28]">Solicitudes recibidas</h2>
            <Send className="w-5 h-5 text-[#145C46]" aria-hidden="true" />
          </div>
          <p className="text-2xl font-extrabold text-[#172D28] tabular-nums">
            {bizRequests.length}
          </p>
          <p className="text-xs text-[#566A63]">
            Revisa pedidos de organizadores, envía propuestas o informa indisponibilidad.
          </p>
          <Link
            to={`/cuenta/negocios/${business.id}/solicitudes`}
            className="inline-flex min-h-[44px] items-center justify-center w-full rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-sm font-bold hover:bg-[#D7EF98]/50 no-underline"
          >
            Abrir bandeja de solicitudes
          </Link>
        </div>

        <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#172D28]">Plan mensual S/ 30</h2>
            <CreditCard className="w-5 h-5 text-[#145C46]" aria-hidden="true" />
          </div>
          <p className="text-2xl font-extrabold text-[#172D28] tabular-nums">
            {business.subscriptionActive ? 'Activo' : 'Pendiente'}
          </p>
          <p className="text-xs text-[#566A63]">
            {bizPayments.length} comprobante(s) registrados · Vigencia hasta{' '}
            {formatShortDate(business.subscriptionPeriodEnd)}
          </p>
          <div className="flex gap-2">
            <Link
              to={`/cuenta/negocios/${business.id}/plan`}
              className="flex-1 inline-flex min-h-[44px] items-center justify-center rounded-[12px] bg-[#145C46] text-white text-sm font-bold hover:bg-[#0D4535] no-underline"
            >
              Plan y pago
            </Link>
            <Link
              to={`/cuenta/negocios/${business.id}/facturacion`}
              className="inline-flex min-h-[44px] px-3 items-center justify-center rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold hover:bg-[#F6F8F7] no-underline"
            >
              Historial
            </Link>
          </div>
        </div>
      </div>

      <section className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 sm:p-6 space-y-3">
        <h2 className="text-lg font-bold text-[#172D28]">Resumen de ficha</h2>
        <p className="text-sm text-[#172D28] leading-relaxed">{business.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-[#566A63] pt-2">
          <span>Cobertura: {business.coverageZones.join(', ')}</span>
          <span>·</span>
          <span>WhatsApp: {business.whatsappPhone}</span>
          <span>·</span>
          <span>{business.availabilityNote}</span>
        </div>
      </section>
    </div>
  );
};

export const BusinessReviewPage: React.FC = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { currentUser, businesses, services, saveBusinessDraft } = useDemoStore();
  const [notice, setNotice] = useState<string | null>(null);

  const business = businesses.find((b) => b.id === businessId);

  if (!currentUser) return <GuardDenied403 />;
  if (!business) return <NotFound404 title="Negocio no encontrado" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  const bizServices = services.filter((s) => s.businessId === business.id);

  const handleSubmitReview = async () => {
    const res = await saveBusinessDraft({
      businessId: business.id,
      name: business.name,
      category: business.category,
      zone: business.zone,
      coverageZones: business.coverageZones,
      summary: business.summary,
      description: business.description,
      startingPricePen: business.startingPricePen,
      quoteOnly: business.quoteOnly,
      whatsappPhone: business.whatsappPhone,
      email: business.email,
      availabilityNote: business.availabilityNote,
      submitForReview: true,
    });
    if (res.ok) {
      setNotice('Ficha enviada a revisión. También puedes activar el plan mensual de S/ 30.');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton fallbackTo={`/cuenta/negocios/${business.id}`} label="Volver a gestión" />
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#172D28] mt-2 tracking-[-0.02em]">
          Panel de negocios
        </h1>
        <p className="text-sm text-[#566A63] mt-1">
          Vista previa de la ficha pública antes de enviar a revisión o continuar con el plan.
        </p>
      </div>

      {notice && (
        <InlineNotice tone="success" title="Enviado a revisión">
          {notice}{' '}
          <Link to={`/cuenta/negocios/${business.id}/plan`} className="font-bold text-[#145C46]">
            Continuar al plan S/ 30 →
          </Link>
        </InlineNotice>
      )}

      {/* 2-col Figma Layout matching desktop/businessReview.tsx.reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 bg-white rounded-[16px] p-6 space-y-5">
          <div className="h-[210px] rounded-[12px] overflow-hidden bg-[#E7F3ED]">
            <SafeImage src={business.imageUrl} alt={business.name} />
          </div>
          <ResourceCoverUpload kind="business" resourceId={business.id} />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge {...mapModerationStatus(business.contentStatus)} />
            </div>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#172D28] leading-tight">
              {business.name}
            </h2>
            <p className="text-[17px] font-semibold text-[#145C46]">
              {business.category} · Zona de atención: {business.coverageZones.join(', ')}
            </p>
          </div>

          <p className="text-[16px] text-[#566A63] leading-relaxed">
            {business.description ||
              'La ficha mostrará fotos, descripción, ubicación o cobertura y el contacto público que proporcionaste.'}
          </p>

          <div className="border-t border-[#DCE4DF] pt-4">
            <h3 className="text-sm font-bold text-[#172D28] mb-2">
              Servicios incluidos ({bizServices.length})
            </h3>
            {bizServices.length === 0 ? (
              <p className="text-xs text-[#566A63]">
                Aún no registras servicios específicos. Puedes añadirlos desde «Servicios».
              </p>
            ) : (
              <ul className="space-y-2">
                {bizServices.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-3 bg-[#F6F8F7] rounded-[12px] px-3.5 py-2.5 text-sm"
                  >
                    <span className="font-semibold text-[#172D28]">{s.name}</span>
                    <span className="font-bold text-[#145C46] tabular-nums">
                      {s.pricingMode === 'quote' ? 'Por cotizar' : formatPen(s.pricePen)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4 bg-[#E7F3ED] rounded-[16px] p-6 space-y-5">
          <div>
            <p className="text-[44px] leading-none font-bold text-[#145C46] tabular-nums">
              S/ {BUSINESS_MONTHLY_PEN}
            </p>
            <p className="text-[18px] font-semibold text-[#172D28] mt-2">
              por negocio / mes
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
              onClick={() => navigate(`/cuenta/negocios/${business.id}/pagos/nuevo`)}
              className="w-full min-h-[48px] px-5 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
            >
              Continuar al pago
            </button>
            <button
              type="button"
              onClick={handleSubmitReview}
              className="w-full min-h-[48px] px-5 py-3 rounded-[12px] bg-white hover:bg-[#F6F8F7] text-[#145C46] text-sm font-bold cursor-pointer"
            >
              Enviar ficha a revisión
            </button>
          </div>

          <p className="text-xs text-[#566A63]">
            No hay cargos reales en el prototipo.
          </p>
        </aside>
      </div>

      <div>
        <Link
          to={`/cuenta/negocios/${business.id}/editar`}
          className="min-h-[48px] px-6 py-3 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/70 text-[#145C46] text-sm font-bold inline-flex items-center justify-center no-underline"
        >
          Volver a editar negocio
        </Link>
      </div>
    </div>
  );
};

export const BusinessServicesPage: React.FC = () => {
  const { businessId } = useParams();
  const { currentUser, businesses, services } = useDemoStore();
  const business = businesses.find((b) => b.id === businessId);

  if (!currentUser) return <GuardDenied403 />;
  if (!business) return <NotFound404 title="Negocio no encontrado" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  const bizServices = services.filter((s) => s.businessId === business.id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <BackButton fallbackTo={`/cuenta/negocios/${business.id}`} label={business.name} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
            Servicios del negocio
          </h1>
          <p className="text-sm text-[#566A63]">
            Los clientes podrán seleccionar estos paquetes al enviarte solicitudes de cotización.
          </p>
        </div>

        <Link
          to={`/cuenta/negocios/${business.id}/servicios/nuevo`}
          className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center gap-2 no-underline shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Añadir servicio</span>
        </Link>
      </div>

      {bizServices.length === 0 ? (
        <EmptyState
          title="Aún no agregas servicios"
          description="Crea tu primer servicio con tarifa referencial en soles o modalidad por cotizar."
          actionLabel="Añadir primer servicio"
          actionTo={`/cuenta/negocios/${business.id}/servicios/nuevo`}
        />
      ) : (
        <div className="space-y-3">
          {bizServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-[#172D28]">{srv.name}</h2>
                  <StatusBadge
                    tone={srv.active ? 'success' : 'neutral'}
                    label={srv.active ? 'Activo' : 'Oculto'}
                  />
                </div>
                <p className="text-sm text-[#566A63]">{srv.description}</p>
                <p className="text-xs font-bold text-[#145C46] tabular-nums">
                  {srv.pricingMode === 'quote'
                    ? 'Modalidad por cotizar'
                    : `${formatPen(srv.pricePen)} · ${srv.unitLabel}`}
                </p>
              </div>
              <Link
                to={`/cuenta/negocios/${business.id}/servicios/${srv.id}/editar`}
                className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#DCE4DF] bg-white hover:bg-[#F6F8F7] text-[#172D28] text-sm font-semibold inline-flex items-center justify-center no-underline shrink-0"
              >
                Editar servicio
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const BusinessServiceFormPage: React.FC = () => {
  const { businessId, serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser, businesses, services, saveService } = useDemoStore();

  const business = businesses.find((b) => b.id === businessId);
  const existing = serviceId
    ? services.find((s) => s.id === serviceId && s.businessId === businessId)
    : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [pricingMode, setPricingMode] = useState<'fixed' | 'quote'>(
    existing?.pricingMode ?? 'fixed'
  );
  const [pricePen, setPricePen] = useState(
    existing?.pricePen ? String(existing.pricePen) : '650'
  );
  const [unitLabel, setUnitLabel] = useState(existing?.unitLabel ?? 'Por evento');
  const [active, setActive] = useState(existing?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return <GuardDenied403 />;
  if (!business) return <NotFound404 title="Negocio no encontrado" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;
  if (serviceId && !existing) return <NotFound404 title="Servicio no encontrado" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await saveService({
      businessId: business.id,
      serviceId: existing?.id,
      name,
      description,
      pricingMode,
      pricePen: pricingMode === 'quote' ? null : Number(pricePen) || 0,
      unitLabel,
      active,
    });
    if (!res.ok) {
      setError(res.error || 'No se pudo guardar el servicio.');
      return;
    }
    navigate(`/cuenta/negocios/${business.id}/servicios`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/negocios/${business.id}/servicios`}
          label="Servicios del negocio"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          {existing ? 'Editar servicio' : 'Añadir servicio'}
        </h1>
      </div>

      {error && <InlineNotice tone="danger">{error}</InlineNotice>}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 sm:p-6 space-y-4"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Nombre del servicio</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Mesa dulce y estación de café para 30 personas"
            className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
            required
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Qué incluye</span>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">Modalidad de precio</span>
            <select
              value={pricingMode}
              onChange={(e) => setPricingMode(e.target.value as 'fixed' | 'quote')}
              className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm bg-white"
            >
              <option value="fixed">Precio base referencial (S/)</option>
              <option value="quote">Solo por cotizar</option>
            </select>
          </label>

          {pricingMode === 'fixed' && (
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">Importe base (PEN)</span>
              <input
                type="number"
                min={1}
                value={pricePen}
                onChange={(e) => setPricePen(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm tabular-nums"
              />
            </label>
          )}
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-[#172D28]">Unidad o alcance</span>
          <input
            type="text"
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
            placeholder="Ej. Hasta 30 personas / 4 horas"
            className="w-full min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] text-sm"
          />
        </label>

        <label className="flex items-center gap-2.5 min-h-[44px] cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 accent-[#145C46]"
          />
          <span className="text-sm font-semibold text-[#172D28]">
            Servicio visible para nuevas cotizaciones
          </span>
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to={`/cuenta/negocios/${business.id}/servicios`}
            className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
          >
            Guardar servicio
          </button>
        </div>
      </form>
    </div>
  );
};

export const BusinessRequestsPage: React.FC = () => {
  const { businessId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, businesses, quoteRequests } = useDemoStore();
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const statusFilter = searchParams.get('estado') || 'todas';

  const business = businesses.find((b) => b.id === businessId);

  if (!currentUser) return <GuardDenied403 />;
  if (!business) return <NotFound404 title="Negocio no encontrado" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  const allReqs = quoteRequests.filter((r) => r.businessId === business.id);
  const filtered = allReqs.filter((r) => {
    if (statusFilter === 'respondidas') return r.status === 'responded' || r.status === 'closed';
    if (statusFilter === 'pendientes') return r.status === 'pending';
    return true;
  });

  const activeReq =
    filtered.find((r) => r.id === selectedReqId) ?? filtered[0] ?? allReqs[0];

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton fallbackTo={`/cuenta/negocios/${business.id}`} label={business.name} />
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#172D28] mt-2 tracking-[-0.02em]">
          Panel de negocios
        </h1>
        <p className="text-[15px] text-[#566A63] mt-1">
          Solicitudes recibidas para {business.name}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'todas', label: `Todas (${allReqs.length})` },
          {
            key: 'pendientes',
            label: `Pendientes (${allReqs.filter((r) => r.status === 'pending').length})`,
          },
          {
            key: 'respondidas',
            label: `Respondidas (${
              allReqs.filter((r) => r.status === 'responded' || r.status === 'closed').length
            })`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() =>
              setSearchParams(tab.key === 'todas' ? {} : { estado: tab.key })
            }
            className={`min-h-[40px] px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${
              statusFilter === tab.key
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
          title="No hay solicitudes en este filtro"
          description="Cuando un organizador solicite cotización a tu negocio aparecerá aquí."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Request Rows */}
          <div className="lg:col-span-4 space-y-4">
            {filtered.map((req) => {
              const st = mapQuoteStatus(req.status);
              const isSelected = activeReq?.id === req.id;
              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={`bg-white rounded-[16px] p-4 space-y-3 border transition-colors cursor-pointer ${
                    isSelected ? 'border-[#145C46]' : 'border-transparent hover:border-[#DCE4DF]'
                  }`}
                >
                  <div className="space-y-1">
                    <h2 className="text-[18px] font-bold text-[#172D28] leading-snug">
                      {req.privateEventTitle}
                    </h2>
                    <p className="text-[13px] text-[#566A63]">
                      {req.serviceName} · {formatShortDate(req.eventDate)} · {req.zone}
                    </p>
                    <p className="text-xs font-semibold text-[#145C46] pt-1">
                      {st.label}
                    </p>
                  </div>

                  <Link
                    to={`/cuenta/negocios/${business.id}/solicitudes/${req.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/70 text-[#145C46] text-sm font-bold flex items-center justify-center no-underline"
                  >
                    Ver solicitud
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Request Preview matching desktop/requests.tsx.reference */}
          {activeReq && (
            <div className="hidden lg:block lg:col-span-8 bg-white rounded-[16px] p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-[28px] font-bold text-[#172D28] leading-tight">
                  {activeReq.privateEventTitle}
                </h2>
                <p className="text-[17px] font-semibold text-[#145C46]">
                  {activeReq.serviceName} · {formatShortDate(activeReq.eventDate)} ·{' '}
                  {activeReq.guestCount} invitados · {activeReq.zone}
                </p>
              </div>

              <div className="space-y-4 text-[17px] text-[#566A63] leading-relaxed">
                <p className="tabular-nums">
                  Presupuesto estimado del cliente:{' '}
                  <strong className="text-[#172D28]">
                    {formatPen(activeReq.estimatedBudgetPen)}
                  </strong>
                </p>
                <p>
                  Mensaje de {activeReq.requesterName}: {activeReq.message}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {activeReq.status !== 'declined' && activeReq.status !== 'closed' && (
                  <Link
                    to={`/cuenta/negocios/${business.id}/solicitudes/${activeReq.id}/respuesta`}
                    className="min-h-[48px] px-8 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center justify-center no-underline"
                  >
                    Preparar propuesta
                  </Link>
                )}
                <Link
                  to={`/cuenta/negocios/${business.id}/solicitudes/${activeReq.id}`}
                  className="min-h-[48px] px-5 py-3 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-sm font-bold inline-flex items-center justify-center no-underline"
                >
                  Abrir historial y acciones
                </Link>
              </div>

              <p className="text-xs text-[#566A63]">
                Datos e importes de ejemplo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const BusinessRequestDetailPage: React.FC = () => {
  const { businessId, requestId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentUser,
    businesses,
    quoteRequests,
    proposals,
    declineQuoteRequest,
  } = useDemoStore();
  const [reason, setReason] = useState('Fecha completa en agenda para ese distrito.');
  const [error, setError] = useState<string | null>(null);

  const showDeclineModal = searchParams.get('modal') === 'decline';

  const business = businesses.find((b) => b.id === businessId);
  const req = quoteRequests.find(
    (r) => r.id === requestId && r.businessId === businessId
  );

  if (!currentUser) return <GuardDenied403 />;
  if (!business || !req) return <NotFound404 title="Solicitud no encontrada" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  const relatedProposals = proposals.filter((p) => p.requestId === req.id);
  const st = mapQuoteStatus(req.status);

  const handleDecline = async () => {
    setError(null);
    const res = await declineQuoteRequest(req.id, reason);
    if (!res.ok) {
      setError(res.error || 'No se pudo declinar.');
      return;
    }
    setSearchParams({});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/negocios/${business.id}/solicitudes`}
          label="Solicitudes recibidas"
        />
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <StatusBadge tone={st.tone} label={st.label} />
          <span className="text-xs text-[#566A63]">
            Recibida el {formatShortDate(req.createdAt)}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          {req.serviceName}
        </h1>
      </div>

      {error && <InlineNotice tone="danger">{error}</InlineNotice>}

      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 sm:p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-[#F6F8F7] rounded-[12px] p-3">
            <p className="text-xs text-[#566A63]">Fecha del evento</p>
            <p className="font-bold text-[#172D28]">{formatShortDate(req.eventDate)}</p>
          </div>
          <div className="bg-[#F6F8F7] rounded-[12px] p-3">
            <p className="text-xs text-[#566A63]">Invitados</p>
            <p className="font-bold text-[#172D28] tabular-nums">{req.guestCount}</p>
          </div>
          <div className="bg-[#F6F8F7] rounded-[12px] p-3">
            <p className="text-xs text-[#566A63]">Zona</p>
            <p className="font-bold text-[#172D28]">{req.zone}</p>
          </div>
          <div className="bg-[#F6F8F7] rounded-[12px] p-3">
            <p className="text-xs text-[#566A63]">Presupuesto ref.</p>
            <p className="font-bold text-[#145C46] tabular-nums">
              {formatPen(req.estimatedBudgetPen)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[#566A63] mb-1">
            Mensaje de {req.requesterName} ({req.privateEventTitle})
          </p>
          <p className="text-sm text-[#172D28] leading-relaxed bg-[#F6F8F7] rounded-[12px] p-4">
            {req.message}
          </p>
        </div>

        {req.declineReason && (
          <InlineNotice tone="danger" title="Solicitud marcada como no disponible">
            Motivo enviado: {req.declineReason}
          </InlineNotice>
        )}

        {req.status !== 'declined' && req.status !== 'closed' && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/cuenta/negocios/${business.id}/solicitudes/${req.id}/respuesta`}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center justify-center gap-2 no-underline"
            >
              <FileText className="w-4 h-4" aria-hidden="true" />
              <span>Redactar propuesta</span>
            </Link>
            <button
              type="button"
              onClick={() => setSearchParams({ modal: 'decline' })}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#F5C6C6] bg-[#FDECEC] text-[#B53737] text-sm font-semibold cursor-pointer"
            >
              No tengo disponibilidad
            </button>
          </div>
        )}
      </div>

      {relatedProposals.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#172D28]">
            Propuestas vinculadas ({relatedProposals.length})
          </h2>
          {relatedProposals.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg font-extrabold text-[#145C46] tabular-nums">
                  {formatPen(p.amountPen)}
                </span>
                <StatusBadge
                  tone={
                    p.status === 'selected'
                      ? 'brand'
                      : p.status === 'sent'
                      ? 'success'
                      : 'neutral'
                  }
                  label={
                    p.status === 'selected'
                      ? 'Elegida por el cliente'
                      : p.status === 'sent'
                      ? 'Enviada al organizador'
                      : 'Borrador'
                  }
                />
              </div>
              <p className="text-sm text-[#172D28]">{p.conditions}</p>
              <p className="text-xs text-[#566A63]">
                Válida hasta {formatShortDate(p.expiresAt)}
              </p>
            </div>
          ))}
        </section>
      )}

      <ConfirmModal
        open={showDeclineModal}
        title="Marcar sin disponibilidad"
        description="Se informará al organizador y la solicitud quedará cerrada sin opción a responder."
        confirmLabel="Confirmar indisponibilidad"
        tone="danger"
        onConfirm={handleDecline}
        onCancel={() => setSearchParams({})}
      >
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-[#172D28]">Motivo breve</span>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-3 rounded-[12px] border border-[#DCE4DF] text-sm"
          />
        </label>
      </ConfirmModal>
    </div>
  );
};

export const BusinessReplyPage: React.FC = () => {
  const { businessId, requestId } = useParams();
  const navigate = useNavigate();
  const { currentUser, businesses, quoteRequests, proposals, saveProposalDraft } =
    useDemoStore();

  const business = businesses.find((b) => b.id === businessId);
  const req = quoteRequests.find(
    (r) => r.id === requestId && r.businessId === businessId
  );
  const existingDraft = proposals.find(
    (p) => p.requestId === requestId && p.status === 'draft'
  );

  const [amountPen, setAmountPen] = useState(
    existingDraft
      ? String(existingDraft.amountPen)
      : req
      ? String(req.estimatedBudgetPen || 1200)
      : '1200'
  );
  const [inclusionsText, setInclusionsText] = useState(
    existingDraft?.inclusions.join('\n') ||
      'Montaje completo 2 horas antes\nPersonal uniformado y menaje\nRecojo al cierre del evento'
  );
  const [exclusionsText, setExclusionsText] = useState(
    existingDraft?.exclusions.join('\n') || 'Estacionamiento privado o permisos municipales'
  );
  const [conditions, setConditions] = useState(
    existingDraft?.conditions || 'Reserva con 50% de adelanto y saldo el día del evento.'
  );
  const [expiresAt, setExpiresAt] = useState(
    existingDraft?.expiresAt.slice(0, 10) || '2026-12-18'
  );
  const [error, setError] = useState<string | null>(null);

  if (!currentUser) return <GuardDenied403 />;
  if (!business || !req) return <NotFound404 title="Solicitud no encontrada" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await saveProposalDraft({
      requestId: req.id,
      amountPen: Number(amountPen),
      inclusions: inclusionsText.split('\n').map((l) => l.trim()).filter(Boolean),
      exclusions: exclusionsText.split('\n').map((l) => l.trim()).filter(Boolean),
      conditions,
      expiresAt: `${expiresAt}T23:59:00-05:00`,
    });
    if (!res.ok) {
      setError(res.error || 'No se pudo guardar el borrador de propuesta.');
      return;
    }
    navigate(
      `/cuenta/negocios/${business.id}/solicitudes/${req.id}/respuesta/revisar`
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/negocios/${business.id}/solicitudes/${req.id}`}
          label="Detalle de solicitud"
        />
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#172D28] mt-2 tracking-[-0.02em]">
          Panel de negocios
        </h1>
        <p className="text-[15px] text-[#566A63] mt-1">
          {req.privateEventTitle} · {req.guestCount} personas en {req.zone} · Datos de ejemplo
        </p>
      </div>

      {error && <InlineNotice tone="danger">{error}</InlineNotice>}

      {/* 2-col Figma Layout matching desktop/reply.tsx.reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleContinue}
          className="lg:col-span-8 bg-white rounded-[16px] p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">
                Precio total (PEN)
              </span>
              <input
                type="number"
                min={1}
                value={amountPen}
                onChange={(e) => setAmountPen(e.target.value)}
                className="w-full min-h-[52px] px-4 rounded-[12px] border border-[#DCE4DF] text-sm tabular-nums"
                required
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold text-[#172D28]">
                Válida hasta
              </span>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full min-h-[52px] px-4 rounded-[12px] border border-[#DCE4DF] text-sm"
                required
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-base font-bold text-[#172D28]">
              Servicios incluidos (uno por línea)
            </span>
            <textarea
              rows={4}
              value={inclusionsText}
              onChange={(e) => setInclusionsText(e.target.value)}
              className="w-full p-4 rounded-[12px] bg-[#F6F8F7] text-sm text-[#172D28]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#172D28]">
              No incluye (uno por línea)
            </span>
            <textarea
              rows={2}
              value={exclusionsText}
              onChange={(e) => setExclusionsText(e.target.value)}
              className="w-full p-4 rounded-[12px] bg-[#F6F8F7] text-sm text-[#172D28]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-base font-bold text-[#172D28]">
              Condiciones y costos adicionales
            </span>
            <textarea
              rows={3}
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="w-full p-4 rounded-[12px] bg-[#F6F8F7] text-sm text-[#172D28]"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="min-h-[48px] px-8 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
            >
              Revisar y enviar propuesta
            </button>
            <Link
              to={`/cuenta/negocios/${business.id}/solicitudes/${req.id}`}
              className="min-h-[48px] px-5 py-3 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-sm font-bold inline-flex items-center no-underline"
            >
              Cancelar
            </Link>
          </div>
        </form>

        <aside className="lg:col-span-4 bg-[#E7F3ED] rounded-[16px] p-6 space-y-4">
          <h2 className="text-[24px] font-bold text-[#172D28] leading-tight">
            Una propuesta clara
          </h2>
          <p className="text-[16px] text-[#566A63] leading-relaxed">
            Incluye precio total, alcance, vigencia y condiciones. El cliente podrá comparar la propuesta.
          </p>
          <p className="text-[16px] text-[#566A63] leading-relaxed">
            Enviar una respuesta no confirma un pago ni una contratación.
          </p>
        </aside>
      </div>
    </div>
  );
};

export const BusinessReplyReviewPage: React.FC = () => {
  const { businessId, requestId } = useParams();
  const navigate = useNavigate();
  const { currentUser, businesses, quoteRequests, proposals, sendProposal } =
    useDemoStore();
  const [error, setError] = useState<string | null>(null);

  const business = businesses.find((b) => b.id === businessId);
  const req = quoteRequests.find(
    (r) => r.id === requestId && r.businessId === businessId
  );
  const draft = proposals.find(
    (p) => p.requestId === requestId && p.status === 'draft'
  );

  if (!currentUser) return <GuardDenied403 />;
  if (!business || !req) return <NotFound404 title="Solicitud no encontrada" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;
  if (!draft) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <EmptyState
          title="No hay borrador listo para revisar"
          description="Primero redacta los montos y condiciones de tu propuesta."
          actionLabel="Redactar propuesta"
          actionTo={`/cuenta/negocios/${business.id}/solicitudes/${req.id}/respuesta`}
        />
      </div>
    );
  }

  const handleSend = async () => {
    setError(null);
    const res = await sendProposal(draft.id);
    if (!res.ok) {
      setError(res.error || 'No se pudo enviar la propuesta.');
      return;
    }
    navigate(
      `/cuenta/negocios/${business.id}/solicitudes/${req.id}`
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/negocios/${business.id}/solicitudes/${req.id}/respuesta`}
          label="Editar borrador"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          Confirmar envío de propuesta
        </h1>
      </div>

      {error && <InlineNotice tone="danger">{error}</InlineNotice>}

      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#DCE4DF]">
          <div>
            <p className="text-xs text-[#566A63]">Evento destino</p>
            <p className="text-base font-bold text-[#172D28]">{req.privateEventTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#566A63]">Importe propuesto</p>
            <p className="text-2xl font-extrabold text-[#145C46] tabular-nums">
              {formatPen(draft.amountPen)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold text-[#145C46] mb-1.5">Incluye</p>
          <ul className="space-y-1 text-sm text-[#172D28] list-disc pl-5">
            {draft.inclusions.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {draft.exclusions.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#566A63] mb-1.5">No incluye</p>
            <ul className="space-y-1 text-sm text-[#566A63] list-disc pl-5">
              {draft.exclusions.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm text-[#172D28] bg-[#F6F8F7] rounded-[12px] p-3.5">
          {draft.conditions}
        </p>
        <p className="text-xs text-[#566A63]">
          Válida hasta: {formatShortDate(draft.expiresAt)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <Link
          to={`/cuenta/negocios/${business.id}/solicitudes/${req.id}/respuesta`}
          className="min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#DCE4DF] bg-white text-[#172D28] text-sm font-semibold inline-flex items-center justify-center no-underline"
        >
          Volver a editar
        </Link>
        <button
          type="button"
          onClick={handleSend}
          className="min-h-[44px] px-6 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
        >
          Enviar propuesta al organizador
        </button>
      </div>
    </div>
  );
};

export const BusinessPlanPage: React.FC = () => {
  const { businessId } = useParams();
  const { currentUser, businesses, settings } = useDemoStore();
  const business = businesses.find((b) => b.id === businessId);

  if (!currentUser) return <GuardDenied403 />;
  if (!business) return <NotFound404 title="Negocio no encontrado" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton fallbackTo={`/cuenta/negocios/${business.id}`} label={business.name} />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          Plan mensual de negocio
        </h1>
      </div>

      <div className="bg-[#E7F3ED] border border-[#C7DFD3] rounded-[16px] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#D7EF98] text-[#172D28] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Plan Proveedor Eventin</span>
            </span>
            <h2 className="text-2xl font-extrabold text-[#172D28]">
              {formatPen(settings.businessMonthlyPen)} / mes
            </h2>
          </div>
          <StatusBadge {...mapPaymentStatus(business.paymentStatus)} />
        </div>

        <ul className="space-y-2 text-sm text-[#172D28]">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#145C46] shrink-0" aria-hidden="true" />
            <span>Presencia pública en catálogo de proveedores y mapa de Lima</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#145C46] shrink-0" aria-hidden="true" />
            <span>Recepción ilimitada de solicitudes y envío de cotizaciones</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#145C46] shrink-0" aria-hidden="true" />
            <span>Validación manual con comprobante (pagos deshabilitados)</span>
          </li>
        </ul>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to={`/cuenta/negocios/${business.id}/pagos/nuevo`}
            className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center no-underline"
          >
            Registrar comprobante (S/ {settings.businessMonthlyPen})
          </Link>
          <Link
            to={`/cuenta/negocios/${business.id}/pagos/instrucciones`}
            className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#145C46]/30 bg-white text-[#145C46] text-sm font-semibold inline-flex items-center no-underline"
          >
            Ver datos e instrucciones de cobro
          </Link>
        </div>
      </div>
    </div>
  );
};

export const BusinessCheckoutPage: React.FC = () => {
  const { businessId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, businesses, settings, submitPaymentProof } = useDemoStore();
  const correctionPaymentId = searchParams.get('corregir') || undefined;

  const [proofReference, setProofReference] = useState(
    correctionPaymentId ? 'OP-991420-CORREGIDA' : ''
  );
  const [proofFileName, setProofFileName] = useState('constancia-yape-demo.jpg');
  const [proofNote, setProofNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const business = businesses.find((b) => b.id === businessId);

  if (!currentUser) return <GuardDenied403 />;
  if (!business) return <NotFound404 title="Negocio no encontrado" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  if (!settings.beneficiaryConfigured) return <EmptyState title="Pagos temporalmente deshabilitados" description="Podrás gestionar tus borradores y enviarlos a revisión. La activación de publicaciones estará disponible cuando se habiliten los pagos." actionLabel="Volver a mi cuenta" actionTo="/cuenta" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await submitPaymentProof({
      resourceKind: 'business',
      resourceId: business.id,
      proofReference,
      proofFileName,
      proofNote,
      correctionPaymentId,
    });
    if (!res.ok || !res.data) {
      setError(res.error || 'No se pudo registrar el comprobante.');
      return;
    }
    navigate(`/cuenta/negocios/${business.id}/pagos/${res.data.id}`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton fallbackTo={`/cuenta/negocios/${business.id}/plan`} label="Plan S/ 30" />
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#172D28] mt-2 tracking-[-0.02em]">
          {correctionPaymentId
            ? 'Corregir comprobante observado'
            : 'Panel de negocios'}
        </h1>
      </div>

      {error && <InlineNotice tone="danger">{error}</InlineNotice>}

      {/* 2-col Figma Layout matching desktop/businessPayment.tsx.reference */}
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
                  const file = e.target.files?.[0];
                  if (file) setProofFileName(file.name);
                }}
              />
            </label>

            <input
              type="text"
              value={proofFileName}
              onChange={(e) => setProofFileName(e.target.value)}
              placeholder="nombre-del-archivo.jpg"
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
                to={`/cuenta/negocios/${business.id}/pagos/instrucciones`}
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
            <span className="text-sm font-semibold text-[#172D28]">Nota adicional (opcional)</span>
            <textarea
              rows={2}
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="Banco o titular que realizó el abono"
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
            {business.name}
          </h2>
          <p className="text-[36px] font-bold text-[#145C46] tabular-nums leading-tight">
            S/ {settings.businessMonthlyPen} / mes
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

export const BusinessPaymentPage: React.FC = () => {
  const { businessId, paymentId } = useParams();
  const { currentUser, businesses, payments } = useDemoStore();
  const business = businesses.find((b) => b.id === businessId);
  const payment = payments.find(
    (p) =>
      p.id === paymentId &&
      p.resourceKind === 'business' &&
      p.resourceId === businessId
  );

  if (!currentUser) return <GuardDenied403 />;
  if (!business || !payment) return <NotFound404 title="Comprobante no encontrado" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  const st = mapPaymentStatus(payment.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton fallbackTo={`/cuenta/negocios/${business.id}/facturacion`} label="Facturación" />
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
          <span className="text-[#566A63]">Negocio</span>
          <span className="font-bold text-[#172D28]">{business.name}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#566A63]">Importe</span>
          <span className="font-extrabold text-[#145C46] tabular-nums">
            {formatPen(payment.amountPen)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#566A63]">Periodo</span>
          <span className="font-semibold text-[#172D28]">{payment.periodLabel}</span>
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
            to={`/cuenta/negocios/${business.id}/pagos/nuevo?corregir=${payment.id}`}
            className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center no-underline"
          >
            Subir comprobante corregido
          </Link>
        )}
        <Link
          to={`/cuenta/negocios/${business.id}`}
          className="min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#DCE4DF] bg-white text-[#172D28] text-sm font-semibold inline-flex items-center no-underline"
        >
          Volver al negocio
        </Link>
      </div>
    </div>
  );
};

export const BusinessBillingPage: React.FC = () => {
  const { businessId } = useParams();
  const { currentUser, businesses, payments, subscriptions } = useDemoStore();
  const business = businesses.find((b) => b.id === businessId);

  if (!currentUser) return <GuardDenied403 />;
  if (!business) return <NotFound404 title="Negocio no encontrado" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  const bizPayments = payments.filter(
    (p) => p.resourceKind === 'business' && p.resourceId === business.id
  );
  const sub = subscriptions.find(
    (s) => s.resourceKind === 'business' && s.resourceId === business.id
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <BackButton fallbackTo={`/cuenta/negocios/${business.id}`} label={business.name} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
            Vigencia e historial de pagos
          </h1>
        </div>
        <Link
          to={`/cuenta/negocios/${business.id}/pagos/nuevo`}
          className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center no-underline"
        >
          Registrar comprobante
        </Link>
      </div>

      <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#566A63]">Suscripción actual</p>
          <p className="text-lg font-extrabold text-[#172D28]">
            Plan Negocio S/ {BUSINESS_MONTHLY_PEN}/mes
          </p>
          <p className="text-xs text-[#566A63]">
            Vigencia: {sub ? `${formatShortDate(sub.periodStart)} – ${formatShortDate(sub.periodEnd)}` : 'Pendiente de activación'}
          </p>
        </div>
        <StatusBadge
          tone={business.subscriptionActive ? 'success' : 'warning'}
          label={business.subscriptionActive ? 'Suscripción activa' : 'Pendiente de pago'}
        />
      </div>

      {bizPayments.length === 0 ? (
        <EmptyState
          title="Sin comprobantes registrados"
          description="Sube un comprobante demo para activar tu periodo mensual de S/ 30."
          actionLabel="Registrar comprobante"
          actionTo={`/cuenta/negocios/${business.id}/pagos/nuevo`}
        />
      ) : (
        <div className="space-y-3">
          {bizPayments.map((p) => {
            const st = mapPaymentStatus(p.status);
            return (
              <Link
                key={p.id}
                to={`/cuenta/negocios/${business.id}/pagos/${p.id}`}
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

export const BusinessPaymentInfoPage: React.FC = () => {
  const { businessId } = useParams();
  const { currentUser, businesses, settings } = useDemoStore();
  const business = businesses.find((b) => b.id === businessId);

  if (!currentUser) return <GuardDenied403 />;
  if (!business) return <NotFound404 title="Negocio no encontrado" />;
  if (business.ownerId !== currentUser.id) return <GuardDenied403 />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div>
        <BackButton
          fallbackTo={`/cuenta/negocios/${business.id}/pagos/nuevo`}
          label="Registrar comprobante"
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28] mt-2">
          Instrucciones de cobro configuradas
        </h1>
      </div>

      {!settings.beneficiaryConfigured ? (
        <InlineNotice tone="warning" title="Datos reales aún no configurados">
          {settings.beneficiaryNote} Por seguridad no se muestran cuentas bancarias o números ficticios como si fueran oficiales. Puedes activar datos demo en{' '}
          <Link to="/admin/configuracion/publicaciones" className="font-bold text-[#145C46]">
            Configuración administrativa
          </Link>{' '}
          o continuar con la subida de comprobante demo.
        </InlineNotice>
      ) : (
        <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-[#566A63]">Beneficiario</span>
            <span className="font-bold text-[#172D28]">{settings.beneficiaryName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#566A63]">Canal habilitado</span>
            <span className="font-bold text-[#172D28]">{settings.beneficiaryChannel}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#566A63]">Cuenta / código</span>
            <span className="font-bold text-[#145C46]">{settings.beneficiaryAccount}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#566A63]">Tarifa negocio</span>
            <span className="font-extrabold text-[#172D28] tabular-nums">
              {formatPen(settings.businessMonthlyPen)} / mes
            </span>
          </div>
        </div>
      )}

      <Link
        to={`/cuenta/negocios/${business.id}/pagos/nuevo`}
        className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-bold inline-flex items-center no-underline"
      >
        Ir a subir comprobante
      </Link>
    </div>
  );
};
