import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function LoadingSpinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <Loader2
      size={size}
      className={clsx('animate-spin text-blue-400', className)}
      aria-label="Loading..."
      role="status"
    />
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 animate-pulse', className)}>
      <div className="h-3 bg-slate-700 rounded w-1/3 mb-3" />
      <div className="h-6 bg-slate-700 rounded w-1/2 mb-2" />
      <div className="h-2 bg-slate-700 rounded w-full mb-1" />
      <div className="h-2 bg-slate-700 rounded w-4/5" />
    </div>
  );
}

export function SkeletonSensorGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('text-center py-12 px-4', className)}>
      {Icon && <Icon size={40} className="mx-auto mb-3 text-slate-600" aria-hidden="true" />}
      <h3 className="text-sm font-semibold text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────
interface ErrorStateProps {
  error: Error | unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
  return (
    <div className={clsx('text-center py-12 px-4', className)}>
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
        <span className="text-red-400 text-xl font-bold" aria-hidden="true">!</span>
      </div>
      <h3 className="text-sm font-semibold text-red-400 mb-1">Failed to load</h3>
      <p className="text-sm text-slate-500 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
          aria-label="Retry loading data"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h2 id="confirm-dialog-title" className="text-base font-semibold text-slate-100 mb-2">
          {title}
        </h2>
        <p className="text-sm text-slate-400 mb-6">{description}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              destructive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white',
            )}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const colors = {
    success: 'bg-emerald-900/80 border-emerald-500/30 text-emerald-300',
    error:   'bg-red-900/80 border-red-500/30 text-red-300',
    info:    'bg-blue-900/80 border-blue-500/30 text-blue-300',
  };

  React.useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="alert"
      className={clsx(
        'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-sm font-medium',
        'shadow-lg backdrop-blur-sm flex items-center gap-2 animate-fade-in',
        colors[type],
      )}
    >
      {message}
      <button
        onClick={onClose}
        className="ml-2 text-current opacity-60 hover:opacity-100"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
