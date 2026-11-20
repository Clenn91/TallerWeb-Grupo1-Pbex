import { ReactNode, useEffect, useId, useRef } from 'react';

interface DialogProps {
  title: ReactNode;
  description?: string;
  onClose: () => void;
  busy?: boolean;
  wide?: boolean;
  children: ReactNode;
}

const Dialog = ({ title, description, onClose, busy = false, wide = false, children }: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  const titleId = useId();
  const descriptionId = useId();
  closeRef.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    // Keep the heading visible when a long form first opens.
    dialog?.querySelector<HTMLElement>('[data-dialog-heading]')?.focus({ preventScroll: true });
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog ref={ref} className={`dialog ${wide ? 'max-w-2xl' : ''}`} aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined} aria-busy={busy}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
          .filter(control => control.tabIndex >= 0 && control.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement as HTMLElement))) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first?.focus();
        }
      }}
      onCancel={(event) => { event.preventDefault(); if (!busy) closeRef.current(); }}>
      <div className="dialog-header">
        <div>
          <h2 id={titleId} tabIndex={-1} data-dialog-heading className="text-xl font-bold focus:outline-none">{title}</h2>
          {description && <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>}
        </div>
        <button type="button" className="-mr-2 -mt-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-2xl text-gray-500 hover:bg-gray-100 disabled:opacity-40"
          aria-label="Cerrar ventana" onClick={onClose} disabled={busy}>×</button>
      </div>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
};

export default Dialog;
