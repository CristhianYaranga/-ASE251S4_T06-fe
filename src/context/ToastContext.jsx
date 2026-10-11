import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type, message, icon, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, icon }]);
    setTimeout(() => {
      dismiss(id);
    }, duration);
  }, [dismiss]);

  const success = useCallback((message) => show('success', message, 'check_circle'), [show]);
  const error = useCallback((message) => show('error', message, 'error', 6000), [show]);
  const warning = useCallback((message) => show('warning', message, 'warning_amber', 5000), [show]);
  const info = useCallback((message) => show('info', message, 'info'), [show]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, warning, info, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
};
