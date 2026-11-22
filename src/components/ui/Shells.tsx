import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  CalendarHeart,
  CalendarPlus,
  Compass,
  CreditCard,
  FileCheck2,
  Flag,
  Heart,
  History,
  Home,
  LayoutDashboard,
  MapPin,
  Settings,
  ShieldCheck,
  Store,
  UserCircle2,
  Users,
} from 'lucide-react';
import { useDemoStore } from '../../repositories/demoStore';
import { BrandLogo } from './BrandLogo';

const APP_TABS = [
  { to: '/', label: 'Inicio', icon: Home, exact: true },
  { to: '/explorar', label: 'Explorar', icon: Compass, exact: false },
  { to: '/mapa', label: 'Mapa', icon: MapPin, exact: false },
  { to: '/mis-eventos', label: 'Organizar', icon: CalendarHeart, exact: false },
  { to: '/cuenta', label: 'Perfil', icon: UserCircle2, exact: false },
] as const;

export const MobileBottomNav: React.FC = () => (
  <nav
    aria-label="Navegación móvil"
    className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#DCE4DF]"
  >
    <div className="grid grid-cols-5 h-16 px-1">
      {APP_TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exact}
            className={({ isActive }) =>
              `min-h-[44px] flex flex-col items-center justify-center gap-1 rounded-[12px] text-[11px] font-semibold no-underline transition-colors ${
                isActive ? 'text-[#145C46]' : 'text-[#566A63]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`px-3 py-1 rounded-[10px] ${
                    isActive ? 'bg-[#E7F3ED]' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="truncate max-w-full">{tab.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </div>
  </nav>
);

export const PlannerWorkspaceShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="min-h-dvh flex flex-col bg-[#F6F8F7] text-[#172D28]">
    <main className="flex-1 pb-24 md:pb-0">{children}</main>
    <MobileBottomNav />
  </div>
);

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, notifications, favorites } = useDemoStore();
  const location = useLocation();

  const unreadCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.read).length
    : 0;

  return (
    <div className="min-h-dvh flex flex-col bg-[#F6F8F7] text-[#172D28]">
      {/* Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#DCE4DF]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 h-16 md:h-[88px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-8 lg:gap-12 min-w-0">
            <BrandLogo to="/" size="md" />
            <nav
              aria-label="Navegación principal"
              className="hidden md:flex items-center gap-8"
            >
              {[
                { to: '/', label: 'Inicio', exact: true },
                { to: '/explorar', label: 'Explorar', exact: false },
                { to: '/mis-eventos', label: 'Organizar', exact: false },
                { to: '/mapa', label: 'Mapa', exact: false },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `text-sm whitespace-nowrap shrink-0 py-2 border-b-2 transition-colors no-underline ${
                      isActive
                        ? 'font-bold text-[#145C46] border-[#145C46]'
                        : 'font-medium text-[#566A63] border-transparent hover:text-[#172D28]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/favoritos"
              aria-label={`Favoritos (${favorites.length})`}
              className={`relative w-[44px] h-[44px] flex items-center justify-center rounded-[12px] transition-colors no-underline ${
                location.pathname.startsWith('/favoritos')
                  ? 'bg-[#E7F3ED] text-[#145C46]'
                  : 'bg-white text-[#172D28] hover:bg-[#F6F8F7]'
              }`}
            >
              <Heart className="w-[22px] h-[22px]" aria-hidden="true" />
            </Link>

            <Link
              to="/notificaciones"
              aria-label={`Notificaciones (${unreadCount} sin leer)`}
              className={`relative w-[44px] h-[44px] flex items-center justify-center rounded-[12px] transition-colors no-underline ${
                location.pathname.startsWith('/notificaciones')
                  ? 'bg-[#E7F3ED] text-[#145C46]'
                  : 'bg-white text-[#172D28] hover:bg-[#F6F8F7]'
              }`}
            >
              <Bell className="w-[22px] h-[22px]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#145C46] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link
              to="/cuenta/publicaciones"
              className="hidden md:inline-flex items-center gap-2 min-h-[48px] px-5 py-3 rounded-[12px] bg-[#E7F3ED] hover:bg-[#D7EF98]/60 text-[#145C46] text-sm font-bold transition-colors whitespace-nowrap shrink-0 no-underline"
            >
              <span>Publicar evento</span>
            </Link>

            <Link
              to={currentUser ? '/cuenta' : '/acceder'}
              className="hidden md:inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-[12px] bg-[#F6F8F7] hover:bg-[#E7F3ED] text-[#172D28] text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 no-underline"
            >
              <UserCircle2 className="w-[20px] h-[20px] text-[#145C46] shrink-0" aria-hidden="true" />
              <span className="max-w-[120px] truncate">
                {currentUser ? currentUser.name.split(' ')[0] : 'Acceder'}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-12">{children}</main>

      {/* Quiet Footer */}
      <footer className="hidden md:block bg-white border-t border-[#DCE4DF]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-20 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <BrandLogo to="/" size="sm" />
            <p className="text-xs text-[#566A63] mt-2 max-w-md leading-relaxed">
              Organiza tus celebraciones y descubre opciones para tu próximo evento. Pagos temporalmente deshabilitados.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[#566A63]">
            <Link to="/explorar" className="hover:text-[#145C46] no-underline">
              Explorar eventos
            </Link>
            <Link to="/proveedores" className="hover:text-[#145C46] no-underline">
              Proveedores
            </Link>
            <Link to="/cuenta/negocios" className="hover:text-[#145C46] no-underline">
              Mis negocios (S/ 30/mes)
            </Link>
            <Link to="/cuenta/publicaciones" className="hover:text-[#145C46] no-underline">
              Mis eventos públicos (S/ 100/mes)
            </Link>
            <Link to="/admin" className="hover:text-[#145C46] no-underline">
              Administración
            </Link>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useDemoStore();
  const navItems = [
    { to: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
    { to: '/admin/eventos', label: 'Eventos', icon: CalendarPlus, exact: false },
    { to: '/admin/negocios', label: 'Negocios', icon: Store, exact: false },
    { to: '/admin/pagos', label: 'Pagos', icon: CreditCard, exact: false },
    { to: '/admin/suscripciones', label: 'Suscripciones', icon: FileCheck2, exact: false },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users, exact: false },
    { to: '/admin/reportes', label: 'Reportes', icon: Flag, exact: false },
    { to: '/admin/actividad', label: 'Actividad', icon: History, exact: false },
    { to: '/admin/configuracion/publicaciones', label: 'Configuración', icon: Settings, exact: false },
  ];

  return (
    <div className="min-h-dvh bg-[#F6F8F7] text-[#172D28] flex flex-col">
      <header className="bg-[#112F27] text-white border-b border-[#1D463B] sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo to="/admin" size="sm" inverted />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-[8px] bg-[#1D463B] text-[#D7EF98] whitespace-nowrap">
              Administración
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#E7F3ED]">
              <ShieldCheck className="w-4 h-4 text-[#D7EF98]" aria-hidden="true" />
              {currentUser?.name || 'Sin sesión'}
            </span>
            <Link
              to="/cuenta"
              className="min-h-[40px] px-3.5 py-2 rounded-[12px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center whitespace-nowrap no-underline"
            >
              Volver a Eventin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] w-full mx-auto flex-1 flex flex-col lg:flex-row">
        <aside className="lg:w-64 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-[#DCE4DF] p-3 lg:p-5">
          <nav
            aria-label="Navegación administrativa"
            className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `min-h-[44px] px-3.5 py-2.5 rounded-[12px] flex items-center gap-2.5 text-sm font-semibold whitespace-nowrap shrink-0 no-underline transition-colors ${
                      isActive
                        ? 'bg-[#E7F3ED] text-[#145C46]'
                        : 'text-[#566A63] hover:bg-[#F6F8F7] hover:text-[#172D28]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export const PlannerLayout: React.FC<{
  privateEventId: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ privateEventId, title, subtitle, children }) => {
  const links = [
    {
      to: `/mis-eventos/${privateEventId}`,
      label: 'Presupuesto y tareas',
      icon: CalendarHeart,
      exact: true,
    },
    {
      to: `/mis-eventos/${privateEventId}/equipo`,
      label: 'Equipo',
      icon: Users,
      exact: false,
    },
    {
      to: `/mis-eventos/${privateEventId}/cotizaciones`,
      label: 'Cotizaciones',
      icon: Briefcase,
      exact: false,
    },
    {
      to: `/proveedores`,
      label: 'Buscar proveedores',
      icon: Store,
      exact: false,
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6 lg:py-10">
      <div className="mb-6">
        <Link
          to="/mis-eventos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#145C46] hover:underline mb-2 no-underline"
        >
          ← Todos mis eventos privados
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-[#172D28]">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[#566A63] mt-1">{subtitle}</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-3">
            <p className="hidden lg:block px-3 py-2 text-xs font-bold text-[#566A63]">
              Planificación privada
            </p>
            <nav
              aria-label="Secciones del evento privado"
              className="flex lg:flex-col gap-1 overflow-x-auto"
            >
              {links.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className={({ isActive }) =>
                      `min-h-[44px] px-3 py-2.5 rounded-[12px] flex items-center gap-2.5 text-sm font-semibold whitespace-nowrap shrink-0 no-underline transition-colors ${
                        isActive
                          ? 'bg-[#E7F3ED] text-[#145C46]'
                          : 'text-[#566A63] hover:bg-[#F6F8F7] hover:text-[#172D28]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
};
