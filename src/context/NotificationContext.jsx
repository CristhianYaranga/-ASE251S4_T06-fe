import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { alertasApi } from '../api/alertasApi';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [allNotifications, setAllNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      const raw = localStorage.getItem('arona_read_notifications');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const saveReadIds = (set) => {
    try {
      localStorage.setItem('arona_read_notifications', JSON.stringify([...set]));
    } catch {}
  };

  const processAlertas = useCallback((alertas) => {
    const notifications = (alertas || [])
      .filter((a) => a.estado !== false)
      .sort((a, b) => (b.fechaDeteccion || '').localeCompare(a.fechaDeteccion || ''))
      .map((a) => {
        const id = a.id || a.idAlerta || '';
        const campoNombre = a.campo?.nombre ?? 'Campo';
        return {
          id,
          title: `${campoNombre} — ${a.tipoProblema}`,
          description: a.descripcionProblema,
          date: a.fechaDeteccion,
          type: a.tipoProblema,
          status: a.solucionAplicada ? 'ATENDIDO' : 'PENDIENTE',
          isRead: readIds.has(String(id)),
          raw: a
        };
      });
    setAllNotifications(notifications);
  }, [readIds]);

  const refresh = useCallback(async () => {
    try {
      const alertas = await alertasApi.getAll();
      processAlertas(alertas);
    } catch (e) {
      console.warn('Error fetching notifications polling:', e);
    }
  }, [processAlertas]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  const unreadNotifications = useMemo(() => {
    return allNotifications.filter((n) => !n.isRead);
  }, [allNotifications]);

  const unreadCount = unreadNotifications.length;

  const markAsRead = (id) => {
    const updated = new Set(readIds);
    updated.add(String(id));
    setReadIds(updated);
    saveReadIds(updated);
    setAllNotifications((prev) =>
      prev.map((n) => (String(n.id) === String(id) ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    const allIds = allNotifications.map((n) => String(n.id));
    const updated = new Set(allIds);
    setReadIds(updated);
    saveReadIds(updated);
    setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const togglePanel = () => setShowPanel((v) => !v);

  return (
    <NotificationContext.Provider
      value={{
        allNotifications,
        unreadNotifications,
        unreadCount,
        showPanel,
        setShowPanel,
        togglePanel,
        markAsRead,
        markAllAsRead,
        refresh
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  return context;
};
