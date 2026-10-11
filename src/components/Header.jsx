import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export function Header() {
  const { userName, userRole, userInitials } = useAuth();
  const {
    allNotifications,
    unreadCount,
    showPanel,
    togglePanel,
    setShowPanel,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const getNotifIcon = (type) => {
    switch (type) {
      case 'PLAGA': return 'bug_report';
      case 'ENFERMEDAD': return 'local_pharmacy';
      case 'OTRO': return 'warning_amber';
      default: return 'notifications';
    }
  };

  const getNotifIconBg = (type) => {
    switch (type) {
      case 'PLAGA': return 'bg-red-100 text-red-500';
      case 'ENFERMEDAD': return 'bg-orange-100 text-orange-500';
      case 'OTRO': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-[var(--color-border-light)] flex items-center justify-between px-6">
        {/* Search Bar */}
        <div className="relative w-72 md:w-96">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            search
          </span>
          <input
            type="text"
            id="header-search"
            placeholder="Buscar lote, cultivo..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)] transition-all"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="btn-notifications"
              onClick={togglePanel}
              className="relative w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[var(--color-arona-500)] transition-all border-none bg-transparent cursor-pointer"
            >
              <span className="material-icons-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold px-0.5 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showPanel && (
              <div
                className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-fade-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-800">Notificaciones</p>
                    {unreadCount > 0 && (
                      <span className="badge badge-warning text-xs">{unreadCount} nuevas</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[var(--color-arona-500)] font-semibold hover:underline border-none bg-transparent cursor-pointer"
                    >
                      Marcar todo como leído
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {allNotifications.slice(0, 15).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`px-4 py-3 border-b border-gray-50 transition-colors cursor-pointer ${
                        notif.isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/40 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getNotifIconBg(
                            notif.type
                          )}`}
                        >
                          <span className="material-icons-outlined text-sm">
                            {getNotifIcon(notif.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-gray-800 truncate">{notif.title}</p>
                            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-400">📅 {notif.date}</span>
                            <span
                              className={`badge text-[10px] ${
                                notif.status === 'ATENDIDO' ? 'badge-success' : 'badge-warning'
                              }`}
                            >
                              {notif.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {allNotifications.length === 0 && (
                    <div className="px-4 py-10 text-center">
                      <span className="material-icons-outlined text-4xl text-gray-300">notifications_none</span>
                      <p className="text-xs text-gray-400 mt-2">Sin notificaciones</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[var(--color-arona-500)] transition-all border-none bg-transparent cursor-pointer">
            <span className="material-icons-outlined text-xl">help_outline</span>
          </button>

          <div className="w-px h-8 bg-[var(--color-border)]"></div>

          {/* User Profile */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-[var(--color-arona-500)] flex items-center justify-center text-white font-bold text-sm group-hover:shadow-md transition-shadow">
              {userInitials}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">{userName}</p>
              <p className="text-xs leading-tight">
                <span className={`badge text-[10px] ${userRole === 'ADMINISTRADOR' ? 'badge-info' : 'badge-success'}`}>
                  {userRole === 'ADMINISTRADOR' ? 'Administrador' : 'Encargado'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {showPanel && (
        <div className="fixed inset-0 z-30" onClick={() => setShowPanel(false)}></div>
      )}
    </>
  );
}
