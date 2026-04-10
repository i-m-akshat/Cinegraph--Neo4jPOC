import { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen) return null;

  const maxWidth = { sm: '380px', md: '480px', lg: '580px' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(109,40,217,0.12)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="relative w-full animate-slide-up"
        style={{
          maxWidth,
          background: '#ffffff',
          border: '1px solid rgba(139,92,246,0.18)',
          borderRadius: '1.25rem',
          boxShadow: '0 20px 60px rgba(109,40,217,0.14), 0 4px 16px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h3 className="text-sm font-semibold" style={{ color: '#7c3aed' }}>{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'rgba(107,114,128,0.6)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = '#7c3aed';
              (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.07)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(107,114,128,0.6)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="divider mx-6" />
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
