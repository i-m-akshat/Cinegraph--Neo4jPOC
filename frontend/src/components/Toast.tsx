import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

function Toast({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4500);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const config = {
    success: {
      icon: <CheckCircle2 size={15} />,
      iconColor: '#059669',
      border: 'rgba(5,150,105,0.25)',
      bg: 'rgba(5,150,105,0.06)',
    },
    error: {
      icon: <XCircle size={15} />,
      iconColor: '#e11d48',
      border: 'rgba(225,29,72,0.25)',
      bg: 'rgba(225,29,72,0.06)',
    },
    info: {
      icon: <Info size={15} />,
      iconColor: '#0284c7',
      border: 'rgba(2,132,199,0.25)',
      bg: 'rgba(2,132,199,0.06)',
    },
  }[toast.type];

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl min-w-72 max-w-sm animate-slide-up"
      style={{
        background: '#ffffff',
        border: `1px solid ${config.border}`,
        boxShadow: '0 8px 32px rgba(109,40,217,0.1), 0 2px 8px rgba(0,0,0,0.06)',
        backgroundColor: config.bg,
      }}
    >
      <span style={{ color: config.iconColor, flexShrink: 0 }}>{config.icon}</span>
      <span className="text-sm flex-1" style={{ color: '#374151' }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="transition-colors p-0.5 rounded flex-shrink-0"
        style={{ color: 'rgba(107,114,128,0.45)' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#7c3aed')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(107,114,128,0.45)')}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
