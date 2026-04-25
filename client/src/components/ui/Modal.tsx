import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  close: () => void;
  title?: string;
  children: ReactNode;
  onConfirm?: () => void;
}

export function ModalConfirm({ isOpen, close, title, children, onConfirm }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      close();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          {title && <h3>{title}</h3>}
          <button className="modal-close" onClick={close} title="Закрыть">
            <X size={20} />
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
        <Button onClick={onConfirm}>
          Подтвердить
        </Button>
      </div>
    </div>
  );
}