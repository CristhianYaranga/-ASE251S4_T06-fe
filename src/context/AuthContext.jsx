import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, normalizeUser } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const TOKEN_KEY = 'arona_token';
  const USER_KEY = 'arona_user';

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return normalizeUser(JSON.parse(stored));
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!token && !!currentUser;

  const userName = useMemo(() => {
    if (!currentUser) return 'Usuario';
    return (
      currentUser.nombreCompleto ||
      `${currentUser.nombres || ''} ${currentUser.apellidos || ''}`.trim() ||
      currentUser.correo ||
      'Usuario'
    );
  }, [currentUser]);

  const userRole = useMemo(() => {
    return currentUser?.rol ?? 'ENCARGADO';
  }, [currentUser]);

  const isAdmin = useMemo(() => {
    const role = String(currentUser?.rol || '').toUpperCase();
    return role === 'ADMINISTRADOR' || role === 'ADMIN';
  }, [currentUser]);

  const userInitials = useMemo(() => {
    const name = userName;
    const parts = name.split(' ').filter((p) => p.length > 0);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }, [userName]);

  const handleAuthSuccess = (response) => {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.usuario));
    setToken(response.token);
    setCurrentUser(response.usuario);
  };

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    handleAuthSuccess(response);
    navigate('/dashboard');
    return response;
  };

  const loginAdmin = async (credentials) => {
    const response = await authApi.loginAdmin(credentials);
    handleAuthSuccess(response);
    navigate('/dashboard');
    return response;
  };

  const register = async (usuarioData) => {
    return await authApi.register(usuarioData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setCurrentUser(null);
    navigate('/auth/login');
  };

  const updateStoredUser = useCallback((fresh) => {
    setCurrentUser((prev) => {
      const updated = normalizeUser({ ...prev, ...fresh });
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        isAuthenticated,
        userName,
        userRole,
        isAdmin,
        userInitials,
        login,
        loginAdmin,
        register,
        logout,
        updateStoredUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
};
