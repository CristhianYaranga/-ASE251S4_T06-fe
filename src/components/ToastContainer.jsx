import React from 'react';
import { useToast } from '../context/ToastContext';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getClasses = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-500/10';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 shadow-red-500/10';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-500/10';
      case 'info':
        return 'bg-sky-50 border-sky-200 text-sky-800 shadow-sky-500/10';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 shadow-gray-500/10';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-emerald-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
        return 'text-sky-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border min-w-[300px] max-w-md animate-slide-in transition-all ${getClasses(
            toast.type
          )}`}
        >
          <span
            className={`material-icons-outlined text-xl shrink-0 ${getIconColor(
              toast.type
            )}`}
          >
            {toast.icon}
          </span>
          <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 transition-opacity border-none bg-transparent cursor-pointer text-current shrink-0"
            aria-label="Cerrar notificación"
          >
            <span className="material-icons-outlined text-sm">close</span>
          </button>
        </div>
      ))}
    </div>
  );
}
