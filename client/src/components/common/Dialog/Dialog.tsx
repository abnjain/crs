import { useEffect, useCallback, type ReactNode } from 'react';
import { XIcon } from '../svgs';

export type DialogSize = 'default' | 'wide';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Extra class for the overlay */
  className?: string;
  /** Larger content area (e.g. detail panes) */
  size?: DialogSize;
  /** Top-right dismiss control */
  showCloseButton?: boolean;
}

/**
 * Accessible modal dialog with overlay
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  className = '',
  size = 'default',
  showCloseButton = true,
}: DialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const showHeader = Boolean(title) || showCloseButton;
  const titleId = title ? 'dialog-title' : undefined;

  return (
    <div
      className={`dialog-overlay ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`dialog-content${size === 'wide' ? ' dialog-content--wide' : ''}`}>
        {showHeader && (
          <div
            className={`dialog-header${!title && showCloseButton ? ' dialog-header--end' : ''}`}
          >
            {title ? (
              <h2 id="dialog-title" className="dialog-title">
                {title}
              </h2>
            ) : null}
            {showCloseButton ? (
              <button
                type="button"
                className="dialog-close"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <XIcon size={20} aria-hidden />
              </button>
            ) : null}
          </div>
        )}
        <div className="dialog-body">{children}</div>
      </div>
    </div>
  );
}
