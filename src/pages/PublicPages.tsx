import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  ExternalLink,
  Filter,
  Heart,
  LocateFixed,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  SlidersHorizontal,
  Store,
  Ticket,
  X,
} from 'lucide-react';
import { EVENTIN_MEDIA } from '../data/media';
import {
  BUSINESS_CATEGORIES,
  EVENT_CATEGORIES,
  LIMA_ZONES,
} from '../data/seed';
import {
  formatPen,
  formatShortDate,
  isBusinessVisible,
  isEventEnded,
  isPublicEventVisible,
} from '../domain/predicates';
import { useDemoStore } from '../repositories/demoStore';
import { SafeImage } from '../components/ui/SafeImage';
import { InlineNotice } from '../components/ui/StatusBadge';
import { BackButton, EmptyState, NotFound404 } from '../components/ui/StateBlocks';

export const HomePage: React.FC = () => {
  const { publicEvents, businesses, isFavorite, toggleFavorite } = useDemoStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [zone, setZone] = useState('');
  const [dateFrom, setDateFrom] = useState('');

  const visibleEvents = useMemo(
    () => publicEvents.filter((ev) => isPublicEventVisible(ev)),
    [publicEvents]
  );

  const visibleBusinesses = useMemo(
    () => businesses.filter((b) => isBusinessVisible(b)),
    [businesses]
  );

  const handleDesktopSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (zone) params.set('zona', zone);
    if (dateFrom) params.set('desde', dateFrom);
    const qs = params.toString();
    navigate(`/explorar${qs ? `?${qs}` : ''}`);
  };

  const getDateParts = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { day: '12', month: 'DIC' };
    const day = String(d.getDate()).padStart(2, '0');
    const month = d
      .toLocaleDateString('es-PE', { month: 'short' })
      .replace('.', '')
      .toUpperCase();
    return { day, month };
  };

  return (
    <div>
      {/* MOBILE HOME (320px - 767px) */}
      <section className="md:hidden px-6 pt-5 pb-8 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/mapa?panel=location"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#566A63] no-underline min-h-[44px]"
          >
            <MapPin className="w-[18px] h-[18px] text-[#145C46] shrink-0" aria-hidden="true" />
            <span>Lima, Perú</span>
          </Link>
          <span className="text-[11px] font-semibold text-[#566A63]">Tu celebración empieza aquí</span>
        </div>

        <h1 className="text-[34px] leading-[1.2] tracking-[-0.02em] font-bold text-[#172D28] max-w-[320px]">
          Tu próximo buen momento.
        </h1>

        {/* Bloque verde mobile */}
        <div className="bg-[#145C46] text-white rounded-[16px] p-5 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <h2 className="text-[17px] font-bold leading-[1.35]">
                Tú imaginas.
                <br />
                Nosotros conectamos.
              </h2>
              <p className="text-xs text-[#E7F3ED] leading-relaxed">
                Encuentra a tu equipo ideal.
              </p>
            </div>
            <div className="w-[91px] h-[100px] rounded-[12px] overflow-hidden shrink-0">
              <SafeImage
                src={EVENTIN_MEDIA.heroCelebrationTable}
                alt="Mesa celebrativa privada"
              />
            </div>
          </div>

          <Link
            to="/mis-eventos"
            className="min-h-[48px] px-5 py-3 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-sm font-bold flex items-center justify-center no-underline"
          >
            Organizar mi evento
          </Link>
        </div>

        {/* Planes cerca de ti */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[23px] leading-tight font-bold text-[#172D28]">
              Planes cerca de ti
            </h2>
            <Link
              to="/explorar"
              className="text-xs font-bold text-[#145C46] no-underline min-h-[44px] inline-flex items-center"
            >
              Ver todos
            </Link>
          </div>

          <div className="space-y-4">
            {visibleEvents.length === 0 && <p className="col-span-full rounded-[12px] border border-[#DCE4DF] bg-white p-5 text-sm text-[#566A63]">Aún no hay eventos publicados. Puedes empezar organizando tu propia celebración.</p>}
            {visibleEvents.slice(0, 1).map((ev) => {
              const fav = isFavorite('event', ev.id);
              const { day, month } = getDateParts(ev.startsAt);
              return (
                <article
                  key={ev.id}
                  className="bg-white rounded-[16px] overflow-hidden"
                >
                  <div className="relative h-[172px]">
                    <Link to={`/eventos/${ev.id}`} className="block w-full h-full">
                      <SafeImage src={ev.imageUrl} alt={ev.title} />
                    </Link>
                    <div className="absolute top-3 left-3 w-[52px] h-[58px] rounded-[8px] bg-white flex flex-col items-center justify-center text-[#145C46] font-bold pointer-events-none">
                      <span className="text-[22px] leading-none tabular-nums">{day}</span>
                      <span className="text-[11px] leading-tight mt-0.5">{month}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite('event', ev.id)}
                      aria-label={
                        fav ? 'Quitar evento de favoritos' : 'Guardar evento en favoritos'
                      }
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white text-[#172D28] flex items-center justify-center cursor-pointer"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          fav ? 'fill-[#145C46] text-[#145C46]' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-xs font-semibold text-[#145C46]">{ev.category}</p>
                    <h3 className="text-lg font-bold text-[#172D28] leading-snug">
                      <Link
                        to={`/eventos/${ev.id}`}
                        className="text-[#172D28] hover:text-[#145C46] no-underline"
                      >
                        {ev.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-[#566A63] tabular-nums">
                      {formatShortDate(ev.startsAt)} · {ev.zone}
                    </p>
                    <p className="text-sm font-semibold text-[#172D28] tabular-nums">
                      {ev.isFree ? 'Entrada libre' : `Desde ${formatPen(ev.entryPricePen)}`}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <Link
          to="/proveedores"
          className="block pt-1 no-underline"
        >
          <p className="text-lg font-bold text-[#172D28]">Diseña tu próxima celebración</p>
          <p className="text-[13px] text-[#566A63] mt-0.5">
            Decoración, catering, música y más.
          </p>
        </Link>
      </section>

      {/* DESKTOP HOME (>= 768px) */}
      <div className="hidden md:block max-w-[1440px] mx-auto px-6 lg:px-20 pt-10 pb-14 space-y-12">
        {/* Hero de dos columnas */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col justify-center py-2">
            <h1 className="text-[44px] xl:text-[58px] leading-[1.2] tracking-[-0.02em] font-bold text-[#172D28] max-w-[580px] text-balance">
              Haz espacio para un buen plan.
            </h1>
            <p className="text-lg text-[#566A63] leading-[1.55] max-w-[520px] mt-5 mb-8">
              Organiza una celebración con el equipo ideal o descubre qué está pasando cerca de ti.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/mis-eventos"
                className="min-h-[48px] px-6 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center justify-center transition-colors no-underline"
              >
                Organizar mi evento
              </Link>
              <Link
                to="/explorar"
                className="min-h-[48px] px-6 py-3 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/60 text-[#145C46] text-sm font-bold inline-flex items-center justify-center transition-colors no-underline"
              >
                Explorar eventos
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-[360px] lg:h-[418px] rounded-[24px] overflow-hidden bg-white">
              <SafeImage
                src={EVENTIN_MEDIA.heroCelebrationTable}
                alt="Mesa celebrativa compartida al atardecer en Lima"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Buscador horizontal */}
        <section aria-label="Buscador rápido de planes">
          <form
            onSubmit={handleDesktopSearch}
            className="bg-white rounded-[16px] p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
          >
            <div className="md:col-span-4 flex items-center gap-3 md:border-r md:border-[#DCE4DF] md:pr-4">
              <Search className="w-5 h-5 text-[#145C46] shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="home-search-q"
                  className="block text-sm font-semibold text-[#172D28]"
                >
                  ¿Qué te gustaría hacer?
                </label>
                <input
                  id="home-search-q"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Evento, artista o categoría"
                  className="w-full bg-transparent text-[13px] text-[#172D28] placeholder:text-[#566A63] focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3 flex items-center gap-3 md:border-r md:border-[#DCE4DF] md:pr-4">
              <MapPin className="w-5 h-5 text-[#145C46] shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="home-search-zone"
                  className="block text-sm font-semibold text-[#172D28]"
                >
                  Lima, Perú
                </label>
                <select
                  id="home-search-zone"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-transparent text-[12px] text-[#566A63] focus:outline-none cursor-pointer"
                >
                  <option value="">Cambiar ubicación</option>
                  {LIMA_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-3 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#145C46] shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="home-search-date"
                  className="block text-sm font-semibold text-[#172D28]"
                >
                  Cualquier fecha
                </label>
                <input
                  id="home-search-date"
                  type="date"
                  aria-label="Elegir fecha"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-transparent text-[12px] text-[#566A63] focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                Buscar planes
              </button>
            </div>
          </form>
        </section>

        {/* Tres tarjetas de eventos */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[30px] leading-tight font-bold text-[#172D28]">
              Planes para encontrarse
            </h2>
            <div className="flex items-center gap-4">
              <Link
                to="/mapa"
                className="text-[13px] font-bold text-[#145C46] hover:underline no-underline whitespace-nowrap"
              >
                Ver en mapa
              </Link>
              <Link
                to="/explorar"
                className="text-[13px] font-bold text-[#145C46] hover:underline no-underline whitespace-nowrap"
              >
                Ver todos los eventos
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleEvents.length === 0 && <p className="col-span-full rounded-[12px] border border-[#DCE4DF] bg-white p-5 text-sm text-[#566A63]">Aún no hay eventos publicados. Puedes empezar organizando tu propia celebración.</p>}
            {visibleEvents.slice(0, 3).map((ev) => {
              const fav = isFavorite('event', ev.id);
              const { day, month } = getDateParts(ev.startsAt);
              return (
                <article
                  key={ev.id}
                  className="bg-white rounded-[16px] overflow-hidden flex flex-col"
                >
                  <div className="relative h-[172px]">
                    <Link to={`/eventos/${ev.id}`} className="block w-full h-full">
                      <SafeImage src={ev.imageUrl} alt={ev.title} />
                    </Link>
                    <div className="absolute top-3 left-3 w-[52px] h-[58px] rounded-[8px] bg-white flex flex-col items-center justify-center text-[#145C46] font-bold pointer-events-none">
                      <span className="text-[22px] leading-none tabular-nums">{day}</span>
                      <span className="text-[11px] leading-tight mt-0.5">{month}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFavorite('event', ev.id)}
                      aria-label={
                        fav ? 'Quitar evento de favoritos' : 'Guardar evento en favoritos'
                      }
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white text-[#172D28] hover:bg-[#F6F8F7] flex items-center justify-center cursor-pointer"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          fav ? 'fill-[#145C46] text-[#145C46]' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#145C46]">
                        {ev.category}
                      </p>
                      <h3 className="text-lg font-bold text-[#172D28] leading-snug">
                        <Link
                          to={`/eventos/${ev.id}`}
                          className="text-[#172D28] hover:text-[#145C46] no-underline"
                        >
                          {ev.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-[#566A63] tabular-nums">
                        {formatShortDate(ev.startsAt)} · {ev.zone}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#172D28] tabular-nums pt-1">
                      {ev.isFree ? 'Entrada libre' : `Desde ${formatPen(ev.entryPricePen)}`}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="text-xs text-[#566A63]">
            Consulta disponibilidad, precios y ubicación con cada organizador.
          </p>
        </section>

        {/* Proveedores para tu celebración */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em] text-[#172D28]">
                Proveedores para tu celebración
              </h2>
              <p className="text-sm text-[#566A63] mt-1">
                Catering, terrazas y ambientación en Lima. Disponibilidad confirmada por cotización.
              </p>
            </div>
            <Link
              to="/proveedores"
              className="text-sm font-semibold text-[#145C46] hover:underline no-underline whitespace-nowrap"
            >
              Ver catálogo de proveedores →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleBusinesses.length === 0 && <p className="col-span-full rounded-[12px] border border-[#DCE4DF] bg-white p-5 text-sm text-[#566A63]">Los proveedores aparecerán aquí cuando sus perfiles estén publicados.</p>}
            {visibleBusinesses.slice(0, 3).map((biz) => {
              const fav = isFavorite('provider', biz.id);
              return (
                <article
                  key={biz.id}
                  className="bg-white border border-[#DCE4DF] rounded-[16px] overflow-hidden flex flex-col"
                >
                  <div className="relative h-44">
                    <Link to={`/proveedores/${biz.id}`} className="block w-full h-full">
                      <SafeImage src={biz.imageUrl} alt={biz.name} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleFavorite('provider', biz.id)}
                      aria-label={
                        fav
                          ? 'Quitar proveedor de favoritos'
                          : 'Guardar proveedor en favoritos'
                      }
                      className="absolute top-3 right-3 w-10 h-10 rounded-[12px] bg-white/95 text-[#172D28] hover:bg-white flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          fav ? 'fill-[#145C46] text-[#145C46]' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-[#566A63] mb-1">
                        {biz.category} · {biz.zone}
                      </p>
                      <h3 className="text-lg font-bold text-[#172D28] leading-snug mb-1.5">
                        <Link
                          to={`/proveedores/${biz.id}`}
                          className="text-[#172D28] hover:text-[#145C46] no-underline"
                        >
                          {biz.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-[#566A63] line-clamp-2">
                        {biz.summary}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#DCE4DF] flex items-center justify-between text-sm">
                      <span className="text-[#566A63]">Referencia</span>
                      <span className="font-bold text-[#145C46] tabular-nums">
                        {biz.quoteOnly
                          ? 'Por cotizar'
                          : `Desde ${formatPen(biz.startingPricePen)}`}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export const ExplorePage: React.FC = () => {
  const { publicEvents, isFavorite, toggleFavorite } = useDemoStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const categoria = searchParams.get('categoria') ?? '';
  const zona = searchParams.get('zona') ?? '';
  const desde = searchParams.get('desde') ?? '';
  const hasta = searchParams.get('hasta') ?? '';
  const precio = searchParams.get('precio') ?? '';

  const [draftQ, setDraftQ] = useState(q);
  const [draftCat, setDraftCat] = useState(categoria);
  const [draftZone, setDraftZone] = useState(zona);
  const [draftDesde, setDraftDesde] = useState(desde);
  const [draftHasta, setDraftHasta] = useState(hasta);
  const [draftPrecio, setDraftPrecio] = useState(precio);

  const visibleEvents = useMemo(
    () => publicEvents.filter((ev) => isPublicEventVisible(ev)),
    [publicEvents]
  );

  const filtered = useMemo(() => {
    return visibleEvents.filter((ev) => {
      if (
        q &&
        !`${ev.title} ${ev.summary} ${ev.zone} ${ev.category}`
          .toLowerCase()
          .includes(q.toLowerCase())
      ) {
        return false;
      }
      if (categoria && ev.category !== categoria) return false;
      if (zona && ev.zone !== zona) return false;
      if (precio === 'gratis' && !ev.isFree) return false;
      if (precio === 'pagado' && ev.isFree) return false;
      if (desde && ev.startsAt.slice(0, 10) < desde) return false;
      if (hasta && ev.startsAt.slice(0, 10) > hasta) return false;
      return true;
    });
  }, [visibleEvents, q, categoria, zona, precio, desde, hasta]);

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (draftQ.trim()) next.set('q', draftQ.trim());
    if (draftCat) next.set('categoria', draftCat);
    if (draftZone) next.set('zona', draftZone);
    if (draftDesde) next.set('desde', draftDesde);
    if (draftHasta) next.set('hasta', draftHasta);
    if (draftPrecio) next.set('precio', draftPrecio);
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setDraftQ('');
    setDraftCat('');
    setDraftZone('');
    setDraftDesde('');
    setDraftHasta('');
    setDraftPrecio('');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#172D28]">
            Explorar planes y cartelera
          </h1>
          <p className="text-sm text-[#566A63] mt-1">
            Eventos públicos vigentes en Lima. Los filtros se conservan al entrar a cada ficha.
          </p>
        </div>

        <div className="inline-flex p-1 bg-white border border-[#DCE4DF] rounded-[12px] self-start">
          <span className="px-4 py-2 rounded-[8px] bg-[#145C46] text-white text-sm font-semibold">
            Eventos
          </span>
          <Link
            to={`/proveedores${q || zona ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(zona ? { zona } : {}) }).toString()}` : ''}`}
            className="px-4 py-2 rounded-[8px] text-[#566A63] hover:text-[#172D28] text-sm font-semibold no-underline"
          >
            Proveedores
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <form
        onSubmit={applyFilters}
        className="bg-white border border-[#DCE4DF] rounded-[16px] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3"
      >
        <input
          type="text"
          value={draftQ}
          onChange={(e) => setDraftQ(e.target.value)}
          placeholder="Buscar por nombre..."
          aria-label="Buscar evento"
          className="min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
        />
        <select
          value={draftCat}
          onChange={(e) => setDraftCat(e.target.value)}
          aria-label="Categoría"
          className="min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
        >
          <option value="">Categoría: todas</option>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={draftZone}
          onChange={(e) => setDraftZone(e.target.value)}
          aria-label="Zona"
          className="min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
        >
          <option value="">Zona: todas</option>
          {LIMA_ZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <select
          value={draftPrecio}
          onChange={(e) => setDraftPrecio(e.target.value)}
          aria-label="Precio de entrada"
          className="min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
        >
          <option value="">Precio: todos</option>
          <option value="gratis">Entrada libre</option>
          <option value="pagado">Con entrada (PEN)</option>
        </select>
        <input
          type="date"
          value={draftDesde}
          onChange={(e) => setDraftDesde(e.target.value)}
          aria-label="Desde fecha"
          className="min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 min-h-[44px] px-4 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
          >
            Aplicar filtros
          </button>
          {(q || categoria || zona || precio || desde || hasta) && (
            <button
              type="button"
              onClick={clearFilters}
              aria-label="Limpiar filtros"
              className="min-w-[44px] min-h-[44px] rounded-[12px] border border-[#DCE4DF] flex items-center justify-center text-[#566A63] hover:bg-[#F6F8F7] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      <div className="flex items-center justify-between text-sm text-[#566A63]">
        <span>
          <strong className="text-[#172D28] tabular-nums">{filtered.length}</strong> eventos disponibles
        </span>
        <Link
          to={`/mapa?tipo=eventos${zona ? `&zona=${encodeURIComponent(zona)}` : ''}`}
          className="inline-flex items-center gap-1.5 font-semibold text-[#145C46] no-underline"
        >
          <MapPin className="w-4 h-4" aria-hidden="true" />
          <span>Ver en mapa</span>
        </Link>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No encontramos eventos con esos filtros"
          description="Prueba ampliando la zona o limpiando los criterios de búsqueda."
          actionLabel="Limpiar filtros"
          onAction={clearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ev) => {
            const fav = isFavorite('event', ev.id);
            return (
              <article
                key={ev.id}
                className="bg-white border border-[#DCE4DF] rounded-[16px] overflow-hidden flex flex-col"
              >
                <div className="relative h-48">
                  <Link to={`/eventos/${ev.id}`} className="block w-full h-full">
                    <SafeImage src={ev.imageUrl} alt={ev.title} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavorite('event', ev.id)}
                    aria-label={
                      fav ? 'Quitar de favoritos' : 'Guardar en favoritos'
                    }
                    className="absolute top-3 right-3 w-11 h-11 rounded-[12px] bg-white/95 flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        fav ? 'fill-[#145C46] text-[#145C46]' : 'text-[#172D28]'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#566A63] mb-1">
                      {ev.category} · {ev.zone}
                    </p>
                    <h2 className="text-lg font-bold text-[#172D28] mb-1.5">
                      <Link
                        to={`/eventos/${ev.id}`}
                        className="text-[#172D28] hover:text-[#145C46] no-underline"
                      >
                        {ev.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-[#566A63] line-clamp-2">
                      {ev.summary}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DCE4DF] flex items-center justify-between text-sm">
                    <span className="text-[#566A63] tabular-nums">
                      {formatShortDate(ev.startsAt)}
                    </span>
                    <span className="font-bold text-[#145C46] tabular-nums">
                      {ev.isFree ? 'Gratis' : formatPen(ev.entryPricePen)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ProviderListPage: React.FC = () => {
  const { businesses, isFavorite, toggleFavorite } = useDemoStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get('q') ?? '';
  const categoria = searchParams.get('categoria') ?? '';
  const zona = searchParams.get('zona') ?? '';
  const presupuesto = searchParams.get('presupuesto') ?? '';

  const [draftQ, setDraftQ] = useState(q);
  const [draftCat, setDraftCat] = useState(categoria);
  const [draftZone, setDraftZone] = useState(zona);
  const [draftBudget, setDraftBudget] = useState(presupuesto);

  const visible = useMemo(
    () => businesses.filter((b) => isBusinessVisible(b)),
    [businesses]
  );

  const filtered = useMemo(() => {
    return visible.filter((b) => {
      if (
        q &&
        !`${b.name} ${b.summary} ${b.category} ${b.zone}`
          .toLowerCase()
          .includes(q.toLowerCase())
      ) {
        return false;
      }
      if (categoria && b.category !== categoria) return false;
      if (zona && !b.coverageZones.includes(zona) && b.zone !== zona) return false;
      if (presupuesto === 'por_cotizar' && !b.quoteOnly) return false;
      if (
        presupuesto === 'hasta_1500' &&
        (b.quoteOnly || (b.startingPricePen ?? 0) > 1500)
      ) {
        return false;
      }
      if (
        presupuesto === 'hasta_2500' &&
        (b.quoteOnly || (b.startingPricePen ?? 0) > 2500)
      ) {
        return false;
      }
      return true;
    });
  }, [visible, q, categoria, zona, presupuesto]);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (draftQ.trim()) next.set('q', draftQ.trim());
    if (draftCat) next.set('categoria', draftCat);
    if (draftZone) next.set('zona', draftZone);
    if (draftBudget) next.set('presupuesto', draftBudget);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#172D28]">
            Proveedores para eventos
          </h1>
          <p className="text-sm text-[#566A63] mt-1">
            Catering, locales, decoración y música. Cobertura y fechas se confirman por cotización.
          </p>
        </div>
        <div className="inline-flex p-1 bg-white border border-[#DCE4DF] rounded-[12px] self-start">
          <Link
            to="/explorar"
            className="px-4 py-2 rounded-[8px] text-[#566A63] hover:text-[#172D28] text-sm font-semibold no-underline"
          >
            Eventos
          </Link>
          <span className="px-4 py-2 rounded-[8px] bg-[#145C46] text-white text-sm font-semibold">
            Proveedores
          </span>
        </div>
      </div>

      <form
        onSubmit={apply}
        className="bg-white border border-[#DCE4DF] rounded-[16px] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <input
          type="text"
          value={draftQ}
          onChange={(e) => setDraftQ(e.target.value)}
          placeholder="Buscar proveedor o servicio..."
          aria-label="Buscar proveedor"
          className="min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
        />
        <select
          value={draftCat}
          onChange={(e) => setDraftCat(e.target.value)}
          aria-label="Categoría de proveedor"
          className="min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
        >
          <option value="">Categoría: todas</option>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={draftZone}
          onChange={(e) => setDraftZone(e.target.value)}
          aria-label="Zona de cobertura"
          className="min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
        >
          <option value="">Cobertura: todas</option>
          {LIMA_ZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
        <select
          value={draftBudget}
          onChange={(e) => setDraftBudget(e.target.value)}
          aria-label="Presupuesto referencial"
          className="min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
        >
          <option value="">Presupuesto: todos</option>
          <option value="hasta_1500">Hasta S/ 1,500</option>
          <option value="hasta_2500">Hasta S/ 2,500</option>
          <option value="por_cotizar">Solo por cotizar</option>
        </select>
        <button
          type="submit"
          className="min-h-[44px] px-4 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
        >
          Filtrar proveedores
        </button>
      </form>

      {filtered.length === 0 ? (
        <EmptyState
          title="Sin proveedores para estos criterios"
          description="Ajusta el presupuesto o cambia la zona de cobertura."
          actionLabel="Ver todos"
          onAction={() => {
            setDraftQ('');
            setDraftCat('');
            setDraftZone('');
            setDraftBudget('');
            setSearchParams({}, { replace: true });
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((biz) => {
            const fav = isFavorite('provider', biz.id);
            return (
              <article
                key={biz.id}
                className="bg-white border border-[#DCE4DF] rounded-[16px] overflow-hidden flex flex-col"
              >
                <div className="relative h-48">
                  <Link to={`/proveedores/${biz.id}`} className="block w-full h-full">
                    <SafeImage src={biz.imageUrl} alt={biz.name} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleFavorite('provider', biz.id)}
                    aria-label={
                      fav ? 'Quitar proveedor de favoritos' : 'Guardar en favoritos'
                    }
                    className="absolute top-3 right-3 w-11 h-11 rounded-[12px] bg-white/95 flex items-center justify-center shadow-sm cursor-pointer"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        fav ? 'fill-[#145C46] text-[#145C46]' : 'text-[#172D28]'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-[#566A63] mb-1">
                      {biz.category} · {biz.zone}
                    </p>
                    <h2 className="text-lg font-bold text-[#172D28] mb-1.5">
                      <Link
                        to={`/proveedores/${biz.id}`}
                        className="text-[#172D28] hover:text-[#145C46] no-underline"
                      >
                        {biz.name}
                      </Link>
                    </h2>
                    <p className="text-sm text-[#566A63] line-clamp-2">
                      {biz.summary}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DCE4DF] flex items-center justify-between text-sm">
                    <span className="text-xs text-[#566A63]">
                      {biz.coverageZones.slice(0, 2).join(', ')}
                    </span>
                    <span className="font-bold text-[#145C46] tabular-nums">
                      {biz.quoteOnly
                        ? 'Por cotizar'
                        : `Desde ${formatPen(biz.startingPricePen)}`}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const ProviderDetailPage: React.FC = () => {
  const { businessId } = useParams();
  const { businesses, services, privateEvents, memberships, currentUser, isFavorite, toggleFavorite } =
    useDemoStore();
  const navigate = useNavigate();

  const business = businesses.find((b) => b.id === businessId);

  if (!business || !isBusinessVisible(business)) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <NotFound404
          title="Proveedor no disponible"
          description="Este negocio no se encuentra publicado o su periodo activo no está vigente."
        />
      </div>
    );
  }

  const bizServices = services.filter(
    (s) => s.businessId === business.id && s.active
  );
  const fav = isFavorite('provider', business.id);
  const myEvents = currentUser
    ? privateEvents.filter((ev) =>
        memberships.some(
          (m) => m.privateEventId === ev.id && m.userId === currentUser.id
        )
      )
    : [];

  const handleRequestQuote = async () => {
    if (!currentUser) {
      navigate(
        `/acceder?returnTo=${encodeURIComponent(
          `/mis-eventos?intent=quote&proveedor=${business.id}`
        )}`
      );
      return;
    }
    navigate(`/mis-eventos?intent=quote&proveedor=${business.id}`);
  };

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <BackButton fallbackTo="/proveedores" label="Volver a proveedores" />
        <button
          type="button"
          onClick={() => toggleFavorite('provider', business.id)}
          className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#DCE4DF] bg-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              fav ? 'fill-[#145C46] text-[#145C46]' : 'text-[#172D28]'
            }`}
            aria-hidden="true"
          />
          <span>{fav ? 'Guardado' : 'Guardar'}</span>
        </button>
      </div>

      <div className="bg-white border border-[#DCE4DF] rounded-[16px] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 min-h-[240px]">
          <SafeImage src={business.imageUrl} alt={business.name} />
        </div>
        <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#145C46]">
              {business.category} · Base en {business.zone}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28]">
              {business.name}
            </h1>
            <p className="text-sm text-[#566A63] leading-relaxed">
              {business.description}
            </p>
            <div className="pt-2 text-sm text-[#172D28]">
              <span className="font-semibold">Cobertura declarada: </span>
              <span className="text-[#566A63]">
                {business.coverageZones.join(', ')}
              </span>
            </div>
            <p className="text-xs text-[#566A63]">
              {business.availabilityNote} · Disponibilidad confirmada al cotizar.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#DCE4DF]">
            <div>
              <p className="text-xs text-[#566A63]">Referencia mensual publicada</p>
              <p className="text-lg font-extrabold text-[#145C46] tabular-nums">
                {business.quoteOnly
                  ? 'Solo por cotizar'
                  : `Desde ${formatPen(business.startingPricePen)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRequestQuote}
              className="min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
            >
              Solicitar cotización
            </button>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-[#172D28]">
          Servicios y paquetes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bizServices.map((srv) => (
            <div
              key={srv.id}
              className="bg-white border border-[#DCE4DF] rounded-[16px] p-5 flex flex-col justify-between gap-3"
            >
              <div>
                <h3 className="text-base font-bold text-[#172D28]">{srv.name}</h3>
                <p className="text-sm text-[#566A63] mt-1">{srv.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#DCE4DF] text-sm">
                <span className="text-[#566A63]">{srv.unitLabel}</span>
                <span className="font-bold text-[#145C46] tabular-nums">
                  {srv.pricingMode === 'quote'
                    ? 'Por cotizar'
                    : formatPen(srv.pricePen)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {myEvents.length > 0 && (
        <div className="bg-[#E7F3ED] border border-[#C7DFD3] rounded-[16px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#172D28]">
              ¿Cotizando para uno de tus eventos privados?
            </p>
            <p className="text-xs text-[#566A63] mt-0.5">
              Elige directamente el evento para preparar la solicitud sin publicarlo.
            </p>
          </div>
          <Link
            to={`/mis-eventos/${myEvents[0].id}/solicitudes/nueva?proveedor=${business.id}`}
            className="min-h-[44px] px-4 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-semibold inline-flex items-center justify-center no-underline whitespace-nowrap"
          >
            Cotizar para {myEvents[0].title}
          </Link>
        </div>
      )}
    </div>
  );
};

export const PublicEventDetailPage: React.FC = () => {
  const { publicEventId } = useParams();
  const { publicEvents, isFavorite, toggleFavorite } = useDemoStore();
  const [waNotice, setWaNotice] = useState(false);

  const event = publicEvents.find((e) => e.id === publicEventId);

  if (
    !event ||
    event.contentStatus !== 'approved' ||
    event.paymentStatus !== 'verified' ||
    !event.subscriptionActive
  ) {
    return (
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <NotFound404
          title="Evento público no disponible"
          description="Este evento aún está en revisión o ya no forma parte de la cartelera pública."
        />
      </div>
    );
  }

  const ended = isEventEnded(event);
  const fav = isFavorite('event', event.id);
  const waMessage = encodeURIComponent(
    `Hola, vi "${event.title}" en Eventin y quisiera consultar sobre entradas.`
  );
  const waHref = `https://wa.me/${event.whatsappPhone.replace(/\D/g, '')}?text=${waMessage}`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    event.address
  )}`;

  return (
    <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <BackButton fallbackTo="/explorar" label="Volver a explorar" />
        <button
          type="button"
          onClick={() => toggleFavorite('event', event.id)}
          className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#DCE4DF] bg-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              fav ? 'fill-[#145C46] text-[#145C46]' : 'text-[#172D28]'
            }`}
            aria-hidden="true"
          />
          <span>{fav ? 'Guardado' : 'Guardar'}</span>
        </button>
      </div>

      {ended && (
        <InlineNotice tone="warning" title="Evento finalizado (G07)">
          Este evento culminó el {formatShortDate(event.endsAt)} y ya no figura en la cartelera activa. Las consultas de entradas están deshabilitadas.
        </InlineNotice>
      )}

      <div className="bg-white border border-[#DCE4DF] rounded-[16px] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-6 min-h-[260px]">
          <SafeImage src={event.imageUrl} alt={event.title} />
        </div>
        <div className="lg:col-span-6 p-6 lg:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#145C46]">
              {event.category} · {event.zone}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28]">
              {event.title}
            </h1>
            <p className="text-sm text-[#566A63] leading-relaxed">
              {event.description}
            </p>

            <div className="pt-2 space-y-2 text-sm text-[#172D28]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#145C46] shrink-0" aria-hidden="true" />
                <span className="tabular-nums">
                  {formatShortDate(event.startsAt)} ·{' '}
                  {new Date(event.startsAt).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  a{' '}
                  {new Date(event.endsAt).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#145C46] shrink-0" aria-hidden="true" />
                <span>{event.address}</span>
              </div>
              <p className="text-xs text-[#566A63]">
                Organizado por <strong className="text-[#172D28]">{event.organizerName}</strong>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DCE4DF] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#566A63]">Entrada referencial</span>
              <span className="text-xl font-extrabold text-[#145C46] tabular-nums">
                {event.isFree ? 'Entrada libre' : formatPen(event.entryPricePen)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {ended ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-[12px] bg-[#DCE4DF] text-[#566A63] text-sm font-semibold cursor-not-allowed"
                >
                  Evento finalizado
                </button>
              ) : (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWaNotice(true)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold inline-flex items-center justify-center gap-2 no-underline"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Consultar entradas por WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#DCE4DF] bg-white hover:bg-[#F6F8F7] text-[#172D28] text-sm font-semibold inline-flex items-center justify-center gap-2 no-underline"
              >
                <Navigation className="w-4 h-4" aria-hidden="true" />
                <span>Cómo llegar</span>
              </a>
            </div>
            {waNotice && (
              <p className="text-xs text-[#566A63]">
                El enlace abre WhatsApp con el organizador. Eventin no procesa cobros de entradas ni confirma cupos automáticamente.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MapPage: React.FC = () => {
  const { publicEvents, businesses } = useDemoStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const tipo = searchParams.get('tipo') ?? 'todos';
  const zona = searchParams.get('zona') ?? '';
  const categoria = searchParams.get('categoria') ?? '';
  const radioKm = searchParams.get('radioKm') ?? '5';
  const desde = searchParams.get('desde') ?? '';
  const precio = searchParams.get('precio') ?? '';
  const presupuesto = searchParams.get('presupuesto') ?? '';
  const incluirPorCotizar = searchParams.get('incluirPorCotizar') !== 'false';
  const seleccion = searchParams.get('seleccion') ?? '';
  const panel = searchParams.get('panel') ?? '';
  const qParam = searchParams.get('q') ?? '';

  const [geoStatus, setGeoStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [manualSearch, setManualSearch] = useState(zona);
  const [searchText, setSearchText] = useState(qParam);
  const [hideDefaultPin, setHideDefaultPin] = useState(false);

  const visibleEvents = useMemo(
    () =>
      publicEvents.filter((ev) => {
        if (!isPublicEventVisible(ev)) return false;
        if (tipo === 'proveedores') return false;
        if (zona && ev.zone !== zona) return false;
        if (categoria && ev.category !== categoria) return false;
        if (desde && ev.startsAt.slice(0, 10) < desde) return false;
        if (precio === 'gratis' && !ev.isFree) return false;
        if (precio === 'hasta_50' && !ev.isFree && ev.entryPricePen > 50) return false;
        if (
          searchText.trim() &&
          !`${ev.title} ${ev.category} ${ev.zone}`
            .toLowerCase()
            .includes(searchText.trim().toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [publicEvents, tipo, zona, categoria, desde, precio, searchText]
  );

  const visibleBusinesses = useMemo(
    () =>
      businesses.filter((b) => {
        if (!isBusinessVisible(b)) return false;
        if (tipo === 'eventos') return false;
        if (zona && b.zone !== zona && !b.coverageZones.includes(zona)) return false;
        if (categoria && b.category !== categoria) return false;
        if (!incluirPorCotizar && b.quoteOnly) return false;
        if (
          presupuesto === 'hasta_1500' &&
          !b.quoteOnly &&
          (b.startingPricePen ?? 0) > 1500
        ) {
          return false;
        }
        if (
          searchText.trim() &&
          !`${b.name} ${b.category} ${b.zone}`
            .toLowerCase()
            .includes(searchText.trim().toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [businesses, tipo, zona, categoria, incluirPorCotizar, presupuesto, searchText]
  );

  const updateQuery = (patch: Record<string, string | null>, replace = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next, { replace });
  };

  const selectedBusiness =
    visibleBusinesses.find((b) => b.id === seleccion) ??
    (!seleccion && !hideDefaultPin && visibleEvents.length === 0 && visibleBusinesses.length > 0
      ? visibleBusinesses[0]
      : undefined);
  const selectedEvent =
    visibleEvents.find((e) => e.id === seleccion) ??
    (!seleccion && !hideDefaultPin && !selectedBusiness && visibleEvents.length > 0
      ? visibleEvents[0]
      : undefined);

  const handleRequestLocation = async () => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setGeoStatus('granted');
        updateQuery({ zona: 'Miraflores', panel: null });
      },
      () => {
        setGeoStatus('denied');
      },
      { timeout: 3500 }
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-8 space-y-6">
      {/* Header matching desktop/map.tsx.reference */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[36px] leading-tight font-bold text-[#172D28] tracking-[-0.02em]">
            Encuentra un buen plan cerca.
          </h1>
          <p className="text-[15px] sm:text-base text-[#566A63] mt-1">
            Eventos y proveedores en una sola vista. Tú eliges qué buscar.
          </p>
        </div>

        {/* Mobile quick controls */}
        <div className="flex flex-wrap items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => updateQuery({ tipo: 'todos' })}
            className={`min-h-[40px] px-4 rounded-full text-xs font-bold cursor-pointer ${
              tipo === 'todos' ? 'bg-[#145C46] text-white' : 'bg-[#E7F3ED] text-[#145C46]'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => updateQuery({ tipo: 'eventos' })}
            className={`min-h-[40px] px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
              tipo === 'eventos' ? 'bg-[#145C46] text-white' : 'bg-[#E7F3ED] text-[#145C46]'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Eventos</span>
          </button>
          <button
            type="button"
            onClick={() => updateQuery({ tipo: 'proveedores' })}
            className={`min-h-[40px] px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer ${
              tipo === 'proveedores'
                ? 'bg-[#D7EF98] text-[#172D28] border border-[#145C46]'
                : 'bg-[#E7F3ED] text-[#145C46]'
            }`}
          >
            <Store className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Proveedores</span>
          </button>
          <button
            type="button"
            onClick={() => updateQuery({ panel: panel === 'filters' ? null : 'filters' }, false)}
            className="min-h-[40px] px-3.5 rounded-[12px] bg-white border border-[#DCE4DF] text-xs font-semibold text-[#172D28] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Main Split matching desktop/map.tsx.reference: Left 304px Filter Panel + Right Map Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <aside
          className={`lg:col-span-4 xl:col-span-3 space-y-4 ${
            panel === 'filters' || panel === 'provider_filters' || panel === 'location'
              ? 'block'
              : 'hidden lg:block'
          }`}
        >
          {panel === 'location' ? (
            <div className="bg-white rounded-[16px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#172D28]">Zona de búsqueda</h2>
                <button
                  type="button"
                  onClick={() => updateQuery({ panel: null })}
                  className="text-xs font-semibold text-[#566A63] cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
              <button
                type="button"
                onClick={handleRequestLocation}
                className="w-full min-h-[44px] px-4 rounded-[12px] bg-[#E7F3ED] text-[#145C46] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LocateFixed className="w-4 h-4" aria-hidden="true" />
                <span>Usar mi ubicación</span>
              </button>
              {geoStatus === 'denied' && (
                <InlineNotice tone="warning">
                  Permiso de ubicación no disponible o denegado. Elige un distrito manualmente sin perder tus filtros.
                </InlineNotice>
              )}
              {geoStatus === 'granted' && (
                <InlineNotice tone="success">
                  Ubicación referencial aplicada en memoria (no se registra en URL).
                </InlineNotice>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#566A63]">
                  Distrito o zona manual
                </label>
                <select
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-[#F6F8F7] text-sm"
                >
                  <option value="">Toda Lima Metropolitana</option>
                  {LIMA_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#566A63]">
                  Radio aproximado: {radioKm} km
                </label>
                <input
                  type="range"
                  min={2}
                  max={20}
                  value={Number(radioKm)}
                  onChange={(e) => updateQuery({ radioKm: e.target.value })}
                  className="w-full accent-[#145C46]"
                />
              </div>
              <button
                type="button"
                onClick={() => updateQuery({ zona: manualSearch || null, panel: null })}
                className="w-full min-h-[48px] rounded-[12px] bg-[#145C46] text-white text-sm font-bold cursor-pointer"
              >
                Buscar en esta zona
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[16px] p-6 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[20px] font-bold text-[#172D28]">¿Qué buscas?</h2>
                {(tipo !== 'todos' || categoria || zona || desde || precio || presupuesto || !incluirPorCotizar) && (
                  <button
                    type="button"
                    onClick={async () => {
                      setSearchText('');
                      setHideDefaultPin(false);
                      setSearchParams({}, { replace: true });
                    }}
                    className="text-xs font-bold text-[#145C46] cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateQuery({ tipo: 'todos' })}
                  className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${
                    tipo === 'todos'
                      ? 'bg-[#145C46] text-white'
                      : 'bg-[#E7F3ED] text-[#145C46]'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => updateQuery({ tipo: 'eventos' })}
                  className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${
                    tipo === 'eventos'
                      ? 'bg-[#145C46] text-white'
                      : 'bg-[#E7F3ED] text-[#145C46]'
                  }`}
                >
                  Eventos
                </button>
                <button
                  type="button"
                  onClick={() => updateQuery({ tipo: 'proveedores' })}
                  className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${
                    tipo === 'proveedores'
                      ? 'bg-[#145C46] text-white'
                      : 'bg-[#E7F3ED] text-[#145C46]'
                  }`}
                >
                  Proveedores
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-[#172D28]">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => updateQuery({ categoria: e.target.value || null })}
                  className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-white text-sm text-[#566A63]"
                >
                  <option value="">Todas las categorías</option>
                  {Array.from(new Set([...EVENT_CATEGORIES, ...BUSINESS_CATEGORIES])).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-bold text-[#172D28]">Distancia</span>
                <div className="flex flex-wrap gap-2">
                  {['5', '10', '20'].map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => updateQuery({ radioKm: km })}
                      className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer ${
                        radioKm === km
                          ? 'bg-[#145C46] text-white'
                          : 'bg-[#E7F3ED] text-[#145C46]'
                      }`}
                    >
                      Hasta {km} km
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-[#172D28]">
                  Fecha del evento
                </label>
                <input
                  type="date"
                  aria-label="Fecha del evento"
                  value={desde}
                  onChange={(e) => updateQuery({ desde: e.target.value || null })}
                  className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-white text-sm text-[#566A63]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-[#172D28]">
                  Precio de entrada
                </label>
                <select
                  value={precio}
                  onChange={(e) => updateQuery({ precio: e.target.value || null })}
                  className="w-full min-h-[44px] px-3 rounded-[12px] border border-[#DCE4DF] bg-white text-sm text-[#566A63]"
                >
                  <option value="">Cualquier precio</option>
                  <option value="gratis">Entrada libre</option>
                  <option value="hasta_50">Hasta S/ 50</option>
                </select>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-[#566A63] cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirPorCotizar}
                  onChange={(e) =>
                    updateQuery({
                      incluirPorCotizar: e.target.checked ? null : 'false',
                    })
                  }
                  className="w-4 h-4 accent-[#145C46]"
                />
                <span>Incluir proveedores «Por cotizar»</span>
              </label>

              <button
                type="button"
                onClick={() => updateQuery({ panel: null })}
                className="w-full min-h-[48px] rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-bold cursor-pointer"
              >
                Aplicar filtros
              </button>
            </div>
          )}
        </aside>

        {/* Right Map Canvas matching desktop/map.tsx.reference */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
          <div className="bg-[#E7F3ED] rounded-[16px] overflow-hidden relative min-h-[460px] sm:min-h-[620px]">
            {/* Figma Map/Base ilustrativa local SVG */}
            <div className="absolute inset-0 bg-[#E8EDE7]">
              <img
                src="/figma-assets/378b7e254c83a484f6d9a1f976bf485cfd17ca9831efd5d483750d3e14179a38.svg"
                alt="Mapa ilustrativo de zonas de Lima"
                className="w-full h-full object-cover pointer-events-none select-none"
              />
              <div className="absolute inset-0 pointer-events-none text-[11px] sm:text-xs font-semibold text-[#566A63]/80">
                <span className="absolute left-[26%] top-[22%]">Centro de Lima</span>
                <span className="absolute left-[48%] top-[36%]">San Isidro</span>
                <span className="absolute left-[31%] top-[53%]">Miraflores</span>
                <span className="absolute left-[42%] top-[70%]">Barranco</span>
                <span className="absolute left-[66%] top-[61%]">Surco</span>
              </div>

              {/* Event Markers (Circles with Ticket) */}
              {visibleEvents.map((ev) => {
                const active = selectedEvent?.id === ev.id;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={async () => {
                      setHideDefaultPin(false);
                      updateQuery({ seleccion: ev.id });
                    }}
                    style={{ left: `${ev.mapX}%`, top: `${ev.mapY}%` }}
                    aria-label={`Evento: ${ev.title}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2 transition-transform cursor-pointer ${
                      active
                        ? 'bg-[#145C46] text-white border-[#D7EF98] scale-110 z-20'
                        : 'bg-white text-[#145C46] border-[#145C46] z-10 hover:scale-105'
                    }`}
                  >
                    <Ticket className="w-5 h-5" aria-hidden="true" />
                  </button>
                );
              })}

              {/* Provider Markers (Squares in Lime with Store icon) */}
              {visibleBusinesses.map((biz) => {
                const active = selectedBusiness?.id === biz.id;
                return (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={async () => {
                      setHideDefaultPin(false);
                      updateQuery({ seleccion: biz.id });
                    }}
                    style={{ left: `${biz.mapX}%`, top: `${biz.mapY}%` }}
                    aria-label={`Proveedor: ${biz.name}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-[12px] flex items-center justify-center shadow-md border-2 transition-transform cursor-pointer ${
                      active
                        ? 'bg-[#145C46] text-[#D7EF98] border-[#172D28] scale-110 z-20'
                        : 'bg-[#D7EF98] text-[#172D28] border-[#145C46]/30 z-10 hover:scale-105'
                    }`}
                  >
                    <Store className="w-5 h-5" aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            {/* Top Search Bar + Locate Button Overlay */}
            <div className="relative z-20 p-4 sm:p-6 flex items-center justify-between gap-3 pointer-events-none">
              <div className="bg-white h-[52px] rounded-[12px] px-4 flex items-center gap-3 w-full max-w-[555px] shadow-sm pointer-events-auto">
                <Search className="w-5 h-5 text-[#145C46] shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar evento, proveedor o zona"
                  aria-label="Buscar evento, proveedor o zona"
                  className="w-full bg-transparent text-sm text-[#172D28] placeholder:text-[#566A63] focus:outline-none"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => setSearchText('')}
                    aria-label="Limpiar búsqueda"
                    className="text-[#566A63] hover:text-[#172D28] cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  updateQuery({ panel: panel === 'location' ? null : 'location' }, false)
                }
                aria-label="Mi ubicación"
                title={zona ? `${zona} (${radioKm} km)` : 'Mi ubicación'}
                className="w-[52px] h-[52px] rounded-[12px] bg-white hover:bg-[#F6F8F7] text-[#145C46] flex items-center justify-center shadow-sm shrink-0 cursor-pointer pointer-events-auto"
              >
                <LocateFixed className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Bottom Legend + Selected Result Overlay */}
            <div className="absolute inset-x-4 sm:inset-x-6 bottom-10 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
              {/* Legend */}
              <div className="bg-white rounded-[12px] px-4 h-[52px] inline-flex items-center gap-5 text-[13px] font-semibold text-[#172D28] shadow-sm w-fit pointer-events-auto">
                <span className="inline-flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#145C46]" aria-hidden="true" />
                  <span>Eventos ({visibleEvents.length})</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#145C46]" aria-hidden="true" />
                  <span>Proveedores ({visibleBusinesses.length})</span>
                </span>
              </div>

              {/* Selected Pin Card */}
              {(selectedBusiness || selectedEvent) && (
                <div className="bg-white rounded-[16px] p-3 w-full sm:w-[390px] shadow-md flex items-center gap-3.5 pointer-events-auto relative">
                  {selectedBusiness ? (
                    <>
                      <div className="w-[90px] h-[88px] rounded-[12px] overflow-hidden shrink-0 bg-[#E7F3ED]">
                        <SafeImage src={selectedBusiness.imageUrl} alt={selectedBusiness.name} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h2 className="text-[17px] font-bold text-[#172D28] truncate pr-6">
                          {selectedBusiness.name}
                        </h2>
                        <p className="text-xs text-[#566A63] truncate">
                          Proveedor · {selectedBusiness.category}
                        </p>
                        <Link
                          to={`/proveedores/${selectedBusiness.id}`}
                          className="inline-block text-[13px] font-bold text-[#145C46] hover:underline no-underline pt-1"
                        >
                          Ver proveedor
                        </Link>
                      </div>
                    </>
                  ) : selectedEvent ? (
                    <>
                      <div className="w-[90px] h-[88px] rounded-[12px] overflow-hidden shrink-0 bg-[#E7F3ED]">
                        <SafeImage src={selectedEvent.imageUrl} alt={selectedEvent.title} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <h2 className="text-[17px] font-bold text-[#172D28] truncate pr-6">
                          {selectedEvent.title}
                        </h2>
                        <p className="text-xs text-[#566A63] truncate">
                          Evento · {selectedEvent.category}
                        </p>
                        <Link
                          to={`/eventos/${selectedEvent.id}`}
                          className="inline-block text-[13px] font-bold text-[#145C46] hover:underline no-underline pt-1"
                        >
                          Ver evento
                        </Link>
                      </div>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={async () => {
                      setHideDefaultPin(true);
                      updateQuery({ seleccion: null });
                    }}
                    aria-label="Cerrar detalle en mapa"
                    className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-[8px] hover:bg-[#F6F8F7] text-[#566A63] cursor-pointer"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>

            <p className="absolute bottom-3 inset-x-6 text-[13px] text-[#566A63] pointer-events-none z-10">
              Mapa ilustrativo · las posiciones no representan ubicaciones reales.
            </p>
          </div>

          {/* Lista rápida debajo del mapa */}
          <div className="bg-white rounded-[16px] p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-[#172D28]">
                Resultados en vista ({visibleEvents.length + visibleBusinesses.length})
              </h2>
              {zona && (
                <span className="text-xs font-semibold text-[#145C46]">
                  Zona: {zona} ({radioKm} km)
                </span>
              )}
            </div>
            {visibleEvents.length + visibleBusinesses.length === 0 ? (
              <p className="text-sm text-[#566A63] py-3">
                No hay resultados visibles con los filtros actuales.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {visibleEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={async () => {
                      setHideDefaultPin(false);
                      updateQuery({ seleccion: ev.id });
                    }}
                    className={`text-left p-3 rounded-[12px] border transition-colors cursor-pointer ${
                      selectedEvent?.id === ev.id
                        ? 'border-[#145C46] bg-[#E7F3ED]'
                        : 'border-[#DCE4DF] hover:bg-[#F6F8F7]'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#145C46]">
                      Evento · {ev.zone}
                    </p>
                    <p className="text-sm font-bold text-[#172D28] truncate">
                      {ev.title}
                    </p>
                  </button>
                ))}
                {visibleBusinesses.map((biz) => (
                  <button
                    key={biz.id}
                    type="button"
                    onClick={async () => {
                      setHideDefaultPin(false);
                      updateQuery({ seleccion: biz.id });
                    }}
                    className={`text-left p-3 rounded-[12px] border transition-colors cursor-pointer ${
                      selectedBusiness?.id === biz.id
                        ? 'border-[#145C46] bg-[#E7F3ED]'
                        : 'border-[#DCE4DF] hover:bg-[#F6F8F7]'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#566A63]">
                      Proveedor · {biz.zone}
                    </p>
                    <p className="text-sm font-bold text-[#172D28] truncate">
                      {biz.name}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
