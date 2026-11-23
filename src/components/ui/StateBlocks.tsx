import React from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDemoStore } from '../../repositories/demoStore';
import { isSafeInternalReturnTo } from '../../domain/predicates';
import {
  AlertCircle,
  ArrowLeft,
  FolderOpen,
  Lock,
  SearchX,
} from 'lucide-react';

export const BackButton: React.FC<{
  fallbackTo?: string;
  label?: string;
}> = ({ fallbackTo = '/', label = 'Volver' }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };
  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-[12px] text-sm font-semibold text-[#172D28] hover:bg-[#E7F3ED] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, actionTo, onAction }) => (
  <div className="bg-white border border-[#DCE4DF] rounded-[16px] p-8 text-center max-w-lg mx-auto my-6">
    <div className="w-12 h-12 rounded-[12px] bg-[#E7F3ED] text-[#145C46] flex items-center justify-center mx-auto mb-4">
      <FolderOpen className="w-6 h-6" aria-hidden="true" />
    </div>
    <h2 className="text-lg font-bold text-[#172D28] mb-2">{title}</h2>
    <p className="text-sm text-[#566A63] mb-6 leading-relaxed">{description}</p>
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-semibold hover:bg-[#0D4535] transition-colors no-underline"
      >
        {actionLabel}
      </Link>
    )}
    {actionLabel && !actionTo && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-semibold hover:bg-[#0D4535] transition-colors cursor-pointer"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
}> = ({ title = 'No pudimos completar esta vista', message, onRetry }) => (
  <div
    role="alert"
    className="bg-[#FDECEC] border border-[#F5C6C6] rounded-[16px] p-6 max-w-xl mx-auto my-6 text-[#B53737]"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <h2 className="text-base font-bold mb-1">{title}</h2>
        <p className="text-sm leading-relaxed mb-4">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] px-4 py-2 rounded-[12px] bg-[#B53737] text-white text-sm font-semibold cursor-pointer"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  </div>
);

export const GuardDenied403: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = 'Acceso restringido (403)',
  description = 'Tu cuenta actual no tiene permisos para abrir este recurso privado o administrativo.',
}) => {
  const { currentUser } = useDemoStore();
  const location = useLocation();
  if (!currentUser) {
    const returnTo = isSafeInternalReturnTo(location.pathname + location.search);
    return <Navigate to={`/acceder?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  return (
  <div className="max-w-lg mx-auto my-12 bg-white border border-[#DCE4DF] rounded-[16px] p-8 text-center">
    <div className="w-12 h-12 rounded-[12px] bg-[#FDECEC] text-[#B53737] flex items-center justify-center mx-auto mb-4">
      <Lock className="w-6 h-6" aria-hidden="true" />
    </div>
    <h1 className="text-xl font-bold text-[#172D28] mb-2">{title}</h1>
    <p className="text-sm text-[#566A63] mb-6 leading-relaxed">{description}</p>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link
        to="/cuenta"
        className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-semibold hover:bg-[#0D4535] no-underline"
      >
        Ir a mi cuenta
      </Link>
      <Link
        to="/"
        className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold hover:bg-[#F6F8F7] no-underline"
      >
        Volver al inicio
      </Link>
    </div>
  </div>
  );
};

export const NotFound404: React.FC<{
  title?: string;
  description?: string;
}> = ({
  title = 'Recurso no disponible (404)',
  description = 'La dirección que buscas no existe o ya no está publicada.',
}) => (
  <div className="max-w-lg mx-auto my-12 bg-white border border-[#DCE4DF] rounded-[16px] p-8 text-center">
    <div className="w-12 h-12 rounded-[12px] bg-[#E7F3ED] text-[#145C46] flex items-center justify-center mx-auto mb-4">
      <SearchX className="w-6 h-6" aria-hidden="true" />
    </div>
    <h1 className="text-xl font-bold text-[#172D28] mb-2">{title}</h1>
    <p className="text-sm text-[#566A63] mb-6 leading-relaxed">{description}</p>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link
        to="/explorar"
        className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-[12px] bg-[#145C46] text-white text-sm font-semibold hover:bg-[#0D4535] no-underline"
      >
        Explorar eventos
      </Link>
      <Link
        to="/"
        className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-[12px] border border-[#DCE4DF] text-[#172D28] text-sm font-semibold hover:bg-[#F6F8F7] no-underline"
      >
        Ir al inicio
      </Link>
    </div>
  </div>
);

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-3" aria-busy="true" aria-label="Cargando contenido">
    {Array.from({ length: rows }).map((_, idx) => (
      <div
        key={idx}
        className="h-20 rounded-[16px] bg-white border border-[#DCE4DF] animate-pulse p-4"
      >
        <div className="h-4 w-1/3 bg-[#E7F3ED] rounded mb-2" />
        <div className="h-3 w-2/3 bg-[#F6F8F7] rounded" />
      </div>
    ))}
  </div>
);
