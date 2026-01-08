import { memo } from 'react';
import { Icons } from './Icons';
import type { Toast as ToastType } from '@/types';

interface ToastProps {
  toast: ToastType;
}

/**
 * Toast notification component
 */
export const Toast = memo(function Toast({ toast }: ToastProps) {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-rose-900/40';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-amber-900/40';
      default:
        return 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-900/40';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <Icons.Info className="w-5 h-5" />;
      case 'warning':
        return <Icons.Warning className="w-5 h-5" />;
      default:
        return <Icons.Check className="w-5 h-5" />;
    }
  };

  return (
    <div
      className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none"
      role="alert"
      aria-live="polite"
    >
      <div
        className={`toast-enter px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl pointer-events-auto flex items-center gap-2 ${getToastStyles()}`}
      >
        {getIcon()}
        {toast.msg}
      </div>
    </div>
  );
});

export default Toast;
