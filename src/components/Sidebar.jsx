import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ collapsed, setCollapsed }) {
  const { userRole, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const allNavItems = [
    { icon: 'home', label: 'Inicio', route: '/dashboard' },
    { icon: 'person', label: 'Mis Datos', route: '/mis-datos' },
    { icon: 'bar_chart', label: 'Producción', route: '/produccion' },
    { icon: 'landscape', label: 'Mis Campos', route: '/mis-campos' },
    { icon: 'local_florist', label: 'Cultivos', route: '/cultivos' },
    { icon: 'assignment', label: 'Actividades', route: '/actividades' },
    { icon: 'bug_report', label: 'Enfermedades', route: '/enfermedades' },
    { icon: 'verified_user', label: 'Calidad', route: '/calidad' },
    { icon: 'admin_panel_settings', label: 'Gestión Usuarios', route: '/panel-admin', adminOnly: true },
  ];

  const visibleNavItems = allNavItems.filter((i) => !i.adminOnly || isAdmin);

  const toggleCollapse = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-[var(--color-border-light)] flex flex-col z-50 transition-all duration-300 shadow-sm ${
          collapsed && !isMobile ? 'w-20' : 'w-64'
        } ${
          isMobile
            ? mobileOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : 'translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-[var(--color-border-light)] shrink-0">
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label="Alternar navegación"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[var(--color-arona-500)] border-none bg-transparent cursor-pointer transition-all shrink-0"
          >
            <span className="material-icons-outlined text-xl">
              {collapsed && !isMobile ? 'menu_open' : 'menu'}
            </span>
          </button>

          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-2.5 animate-fade-in select-none">
              <div className="w-8 h-8 bg-[var(--color-arona-500)] rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <span className="material-icons-outlined text-white text-lg">eco</span>
              </div>
              <div>
                <span className="text-lg font-bold text-[var(--color-arona-500)] tracking-tight block leading-none">
                  Arona
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider font-semibold uppercase block mt-0.5">
                  Agrícola S.A.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1.5 px-3">
            {visibleNavItems.map((item) => (
              <li key={item.route}>
                <NavLink
                  to={item.route}
                  title={collapsed && !isMobile ? item.label : ''}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group select-none ${
                      isActive
                        ? 'bg-[var(--color-arona-500)] text-white shadow-md shadow-emerald-700/20'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-[var(--color-arona-500)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`material-icons-outlined text-xl transition-colors shrink-0 ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-[var(--color-arona-500)]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {(!collapsed || isMobile) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-[var(--color-border-light)] py-3 px-3 space-y-1 shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed && !isMobile ? 'Cerrar Sesión' : ''}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer w-full border-none bg-transparent group select-none"
          >
            <span className="material-icons-outlined text-xl text-red-400 group-hover:text-red-600 shrink-0">
              logout
            </span>
            {(!collapsed || isMobile) && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
