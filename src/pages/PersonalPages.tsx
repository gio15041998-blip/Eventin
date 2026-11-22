import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CalendarHeart,
  CalendarPlus,
  ChevronRight,
  FileText,
  Heart,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Store,
  UserCheck,
} from 'lucide-react';
import {
  formatDateTime,
  formatPen,
  formatShortDate,
  resolveNotificationPath,
} from '../domain/predicates';
import { useDemoStore } from '../repositories/demoStore';
import { SafeImage } from '../components/ui/SafeImage';
import { EmptyState, GuardDenied403 } from '../components/ui/StateBlocks';
import { InlineNotice } from '../components/ui/StatusBadge';

export const AccountPage: React.FC = () => {
  const {
    currentUser,
    users,
    switchDemoUser,
    signOutDemo,
    resetDemoData,
    privateEvents,
    businesses,
    publicEvents,
    memberships,
    quoteRequests,
  } = useDemoStore();
  const navigate = useNavigate();

  if (!currentUser) {
    return <GuardDenied403 title="Inicia sesión para ver tu cuenta" />;
  }

  const myPrivateEvents = privateEvents.filter((ev) =>
    memberships.some((m) => m.privateEventId === ev.id && m.userId === currentUser.id)
  );
  const myPrivateCount = myPrivateEvents.length;
  const primaryPrivateId = myPrivateEvents[0]?.id;
  const myBusinessCount = businesses.filter((b) => b.ownerId === currentUser.id).length;
  const myPublicCount = publicEvents.filter((e) => e.ownerId === currentUser.id).length;
  const myQuotesCount = quoteRequests.filter((q) =>
    myPrivateEvents.some((ev) => ev.id === q.privateEventId)
  ).length;

  const initials = currentUser.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'EV';
  const avatarLabel = currentUser.name.toLowerCase().startsWith('giovanny')
    ? 'GV'
    : initials;

  const navRows = [
    {
      label: 'Mis eventos privados',
      count: `${myPrivateCount} activos`,
      to: '/mis-eventos',
      icon: CalendarHeart,
    },
    {
      label: 'Mis cotizaciones',
      count: `${myQuotesCount} solicitudes`,
      to: primaryPrivateId ? `/mis-eventos/${primaryPrivateId}/cotizaciones` : '/mis-eventos',
      icon: FileText,
    },
    {
      label: 'Mis negocios',
      count: `${myBusinessCount} fichas`,
      to: '/cuenta/negocios',
      icon: Store,
    },
    {
      label: 'Mis eventos publicados',
      count: `${myPublicCount} eventos`,
      to: '/cuenta/publicaciones',
      icon: CalendarPlus,
    },
    {
      label: 'Favoritos personales',
      count: 'Guardados',
      to: '/favoritos',
      icon: Heart,
    },
    {
      label: 'Notificaciones',
      count: 'Centro de avisos',
      to: '/notificaciones',
      icon: Bell,
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-6 lg:py-10 space-y-8">
      {/* Header matching mobile/profile.tsx.reference + desktop responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E7F3ED] text-[#145C46] text-[21px] font-bold flex items-center justify-center shrink-0">
            {avatarLabel}
          </div>
          <div>
            <h1 className="text-[24px] sm:text-[32px] font-bold text-[#172D28] leading-tight">
              {currentUser.name}
            </h1>
            <p className="text-[13px] text-[#566A63] mt-0.5">
              Cuenta Eventin · {currentUser.email} · {currentUser.city}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
<button
            type="button"
            onClick={async () => {
              await signOutDemo();
              navigate('/acceder');
            }}
            className="min-h-[44px] px-4 py-2 rounded-[12px] border border-[#DCE4DF] bg-white hover:bg-[#FDECEC] text-[#B53737] text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main Profile Split: Row/Navigation + CTAs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <nav
          aria-label="Opciones de mi cuenta"
          className="lg:col-span-7 bg-white rounded-[16px] px-5 divide-y divide-[#DCE4DF]"
        >
          {navRows.map((row) => {
            const Icon = row.icon;
            return (
              <Link
                key={row.label}
                to={row.to}
                className="min-h-[64px] py-3 flex items-center justify-between gap-4 no-underline group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Icon className="w-6 h-6 text-[#145C46] shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#172D28] group-hover:text-[#145C46] truncate">
                      {row.label}
                    </p>
                    <p className="text-xs text-[#566A63]">{row.count}</p>
                  </div>
                </div>
                <ChevronRight
                  className="w-5 h-5 text-[#566A63] group-hover:text-[#145C46] shrink-0"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>

        <div className="lg:col-span-5 space-y-4">
          <Link
            to="/cuenta/negocios/nuevo"
            className="block bg-[#E7F3ED] hover:bg-[#D7EF98]/70 transition-colors rounded-[16px] p-5 space-y-3 no-underline"
          >
            <Store className="w-6 h-6 text-[#145C46]" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-[#172D28]">¿Ofreces servicios?</h2>
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="text-[13px] font-bold text-[#145C46]">
                  Crea el perfil de tu negocio
                </span>
                <ArrowRight className="w-5 h-5 text-[#145C46] shrink-0" aria-hidden="true" />
              </div>
            </div>
          </Link>

          <Link
            to="/cuenta/publicaciones/nueva"
            className="block bg-white border border-[#DCE4DF] hover:border-[#145C46] transition-colors rounded-[16px] p-5 space-y-2 no-underline"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-bold text-[#172D28]">
                Publica un evento abierto
              </span>
              <ArrowRight className="w-4 h-4 text-[#145C46] shrink-0" aria-hidden="true" />
            </div>
            <p className="text-xs text-[#566A63]">
              Cartelera y mapa de Lima · Plan mensual S/ 100/mes por evento.
            </p>
          </Link>
        </div>
      </div>

      {currentUser.adminCapabilities.length > 0 && <Link to="/admin" className="inline-flex min-h-[44px] items-center rounded-[12px] bg-[#145C46] px-5 text-white font-semibold">Abrir administración</Link>}
    </div>
  );
};

export const FavoritesPage: React.FC = () => {
  const { favorites, publicEvents, businesses, toggleFavorite } = useDemoStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const tipo = searchParams.get('tipo') ?? 'todos';

  const favEvents = publicEvents.filter((ev) =>
    favorites.some((f) => f.kind === 'event' && f.id === ev.id)
  );
  const favProviders = businesses.filter((b) =>
    favorites.some((f) => f.kind === 'provider' && f.id === b.id)
  );

  const showEvents = tipo === 'todos' || tipo === 'eventos';
  const showProviders = tipo === 'todos' || tipo === 'proveedores';

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28]">
            Favoritos personales
          </h1>
          <p className="text-sm text-[#566A63] mt-1">
            Guardados exclusivamente en tu perfil. No modifica los proveedores propuestos de un evento privado.
          </p>
        </div>

        <div className="inline-flex p-1 bg-white border border-[#DCE4DF] rounded-[12px] self-start">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'eventos', label: 'Eventos' },
            { id: 'proveedores', label: 'Proveedores' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setSearchParams(tab.id === 'todos' ? {} : { tipo: tab.id }, {
                  replace: true,
                })
              }
              className={`min-h-[38px] px-3.5 rounded-[8px] text-sm font-semibold cursor-pointer ${
                tipo === tab.id
                  ? 'bg-[#145C46] text-white'
                  : 'text-[#566A63] hover:text-[#172D28]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {favorites.length === 0 ? (
        <EmptyState
          title="Todavía no guardaste favoritos"
          description="Marca eventos o proveedores con el corazón para tenerlos a la mano cuando organices tu próximo plan."
          actionLabel="Explorar planes"
          actionTo="/explorar"
        />
      ) : (
        <div className="space-y-8">
          {showEvents && favEvents.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-extrabold text-[#172D28]">
                Eventos guardados ({favEvents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {favEvents.map((ev) => (
                  <article
                    key={ev.id}
                    className="bg-white border border-[#DCE4DF] rounded-[16px] overflow-hidden flex flex-col"
                  >
                    <div className="relative h-44">
                      <Link to={`/eventos/${ev.id}`} className="block w-full h-full">
                        <SafeImage src={ev.imageUrl} alt={ev.title} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleFavorite('event', ev.id)}
                        aria-label="Quitar de favoritos"
                        className="absolute top-3 right-3 w-10 h-10 rounded-[12px] bg-white/95 flex items-center justify-center cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-[#145C46] text-[#145C46]" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <p className="text-xs text-[#566A63]">
                        {ev.category} · {ev.zone}
                      </p>
                      <h3 className="text-base font-bold text-[#172D28]">
                        <Link to={`/eventos/${ev.id}`} className="text-[#172D28] no-underline hover:text-[#145C46]">
                          {ev.title}
                        </Link>
                      </h3>
                      <p className="text-xs font-semibold text-[#145C46] tabular-nums">
                        {formatShortDate(ev.startsAt)} ·{' '}
                        {ev.isFree ? 'Gratis' : formatPen(ev.entryPricePen)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {showProviders && favProviders.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-extrabold text-[#172D28]">
                Proveedores guardados ({favProviders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {favProviders.map((biz) => (
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
                        aria-label="Quitar proveedor de favoritos"
                        className="absolute top-3 right-3 w-10 h-10 rounded-[12px] bg-white/95 flex items-center justify-center cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-[#145C46] text-[#145C46]" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <p className="text-xs text-[#566A63]">
                        {biz.category} · {biz.zone}
                      </p>
                      <h3 className="text-base font-bold text-[#172D28]">
                        <Link to={`/proveedores/${biz.id}`} className="text-[#172D28] no-underline hover:text-[#145C46]">
                          {biz.name}
                        </Link>
                      </h3>
                      <p className="text-xs font-semibold text-[#145C46] tabular-nums">
                        {biz.quoteOnly
                          ? 'Por cotizar'
                          : `Desde ${formatPen(biz.startingPricePen)}`}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export const NotificationsPage: React.FC = () => {
  const {
    currentUser,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useDemoStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  if (!currentUser) {
    return <GuardDenied403 />;
  }

  const estado = searchParams.get('estado') ?? 'todas';
  const myNotifs = notifications.filter((n) => n.userId === currentUser.id);
  const filtered =
    estado === 'no_leidas' ? myNotifs.filter((n) => !n.read) : myNotifs;

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 lg:py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172D28]">
            Notificaciones
          </h1>
          <p className="text-sm text-[#566A63] mt-1">
            Cada aviso enlaza únicamente con recursos e IDs validados para tu cuenta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-white border border-[#DCE4DF] rounded-[12px]">
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className={`min-h-[38px] px-3 rounded-[8px] text-xs font-semibold cursor-pointer ${
                estado === 'todas' ? 'bg-[#145C46] text-white' : 'text-[#566A63]'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setSearchParams({ estado: 'no_leidas' }, { replace: true })}
              className={`min-h-[38px] px-3 rounded-[8px] text-xs font-semibold cursor-pointer ${
                estado === 'no_leidas' ? 'bg-[#145C46] text-white' : 'text-[#566A63]'
              }`}
            >
              No leídas
            </button>
          </div>

          {myNotifs.some((n) => !n.read) && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="min-h-[44px] px-3.5 rounded-[12px] border border-[#DCE4DF] bg-white text-xs font-bold text-[#145C46] cursor-pointer"
            >
              Marcar todo leído
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No tienes notificaciones pendientes"
          description="Aquí verás invitaciones a eventos, propuestas de proveedores y resultados de revisión."
          actionLabel="Explorar Eventin"
          actionTo="/explorar"
        />
      ) : (
        <div className="bg-white border border-[#DCE4DF] rounded-[16px] divide-y divide-[#DCE4DF]">
          {filtered.map((item) => {
            const targetPath = resolveNotificationPath(item);
            return (
              <div
                key={item.id}
                className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.read ? 'bg-white' : 'bg-[#F6F8F7]'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!item.read && (
                      <span className="text-[11px] font-bold text-[#145C46]">
                        Nueva ·
                      </span>
                    )}
                    <span className="text-xs text-[#566A63] tabular-nums">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#172D28]">
                    {item.title}
                  </h2>
                  <p className="text-sm text-[#566A63]">{item.body}</p>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    markNotificationRead(item.id);
                    navigate(targetPath);
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-[12px] bg-[#145C46] hover:bg-[#0D4535] text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Abrir detalle
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
