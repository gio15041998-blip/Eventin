import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
} from 'lucide-react';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral' | 'brand';

interface StatusBadgeProps {
  tone: StatusTone;
  label: string;
}

const TONE_MAP: Record<
  StatusTone,
  { bg: string; text: string; border: string; Icon: React.FC<{ className?: string }> }
> = {
  success: {
    bg: 'bg-[#E7F3ED]',
    text: 'text-[#145C46]',
    border: 'border-[#C7DFD3]',
    Icon: CheckCircle2,
  },
  brand: {
    bg: 'bg-[#D7EF98]',
    text: 'text-[#172D28]',
    border: 'border-[#C2DF78]',
    Icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-[#FFF4D6]',
    text: 'text-[#785715]',
    border: 'border-[#EED89F]',
    Icon: Clock,
  },
  danger: {
    bg: 'bg-[#FDECEC]',
    text: 'text-[#B53737]',
    border: 'border-[#F5C6C6]',
    Icon: XCircle,
  },
  neutral: {
    bg: 'bg-[#F6F8F7]',
    text: 'text-[#566A63]',
    border: 'border-[#DCE4DF]',
    Icon: FileEdit,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ tone, label }) => {
  const { bg, text, border, Icon } = TONE_MAP[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border text-xs font-semibold whitespace-nowrap shrink-0 ${bg} ${text} ${border}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export function mapModerationStatus(
  status: string
): { tone: StatusTone; label: string } {
  switch (status) {
    case 'approved':
      return { tone: 'success', label: 'Contenido aprobado' };
    case 'pending':
      return { tone: 'warning', label: 'En revisión' };
    case 'observed':
      return { tone: 'warning', label: 'Con observaciones' };
    case 'rejected':
      return { tone: 'danger', label: 'Rechazado' };
    case 'suspended':
      return { tone: 'danger', label: 'Suspendido' };
    default:
      return { tone: 'neutral', label: 'Borrador' };
  }
}

export function mapPaymentStatus(
  status: string
): { tone: StatusTone; label: string } {
  switch (status) {
    case 'verified':
      return { tone: 'success', label: 'Pago verificado' };
    case 'proof_received':
      return { tone: 'warning', label: 'Comprobante recibido' };
    case 'observed':
      return { tone: 'danger', label: 'Pago observado' };
    default:
      return { tone: 'neutral', label: 'Pago pendiente' };
  }
}

export function mapQuoteStatus(
  status: string
): { tone: StatusTone; label: string } {
  switch (status) {
    case 'responded':
      return { tone: 'success', label: 'Respondida' };
    case 'declined':
      return { tone: 'danger', label: 'No disponible' };
    case 'closed':
      return { tone: 'brand', label: 'Propuesta elegida' };
    default:
      return { tone: 'warning', label: 'Pendiente de respuesta' };
  }
}

export const InlineNotice: React.FC<{
  tone?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
  children: React.ReactNode;
}> = ({ tone = 'info', title, children }) => {
  const styles =
    tone === 'warning'
      ? 'bg-[#FFF4D6] border-[#EED89F] text-[#785715]'
      : tone === 'danger'
      ? 'bg-[#FDECEC] border-[#F5C6C6] text-[#B53737]'
      : tone === 'success'
      ? 'bg-[#E7F3ED] border-[#C7DFD3] text-[#145C46]'
      : 'bg-[#F6F8F7] border-[#DCE4DF] text-[#172D28]';

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`rounded-[12px] border p-4 text-sm leading-relaxed ${styles}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          {title && <p className="font-bold mb-1">{title}</p>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
