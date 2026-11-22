import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'brand' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'brand',
  busy = false,
  onConfirm,
  onCancel,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#172D28]/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-confirm-title"
    >
      <div className="bg-white border border-[#DCE4DF] rounded-[16px] w-full max-w-md p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 id="modal-confirm-title" className="text-lg font-bold text-[#172D28]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cerrar confirmación"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-[12px] text-[#566A63] hover:bg-[#F6F8F7] cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-[#566A63] leading-relaxed mb-4">
          {description}
        </p>
        {children && <div className="mb-5">{children}</div>}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-[44px] px-4 py-2.5 rounded-[12px] border border-[#DCE4DF] bg-white text-[#172D28] text-sm font-semibold hover:bg-[#F6F8F7] cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`min-h-[44px] px-5 py-2.5 rounded-[12px] text-white text-sm font-semibold transition-colors cursor-pointer ${
              tone === 'danger'
                ? 'bg-[#B53737] hover:bg-[#932828]'
                : 'bg-[#145C46] hover:bg-[#0D4535]'
            }`}
          >
            {busy ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
