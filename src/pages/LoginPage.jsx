import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginPage() {
  const { login } = useAuth();
  const { error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.correo.trim()) {
      errs.correo = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errs.correo = 'Ingrese un correo electrónico válido';
    }

    if (!formData.password) {
      errs.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errs.password = 'Mínimo 6 caracteres';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login({
        correo: formData.correo.trim(),
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Credenciales inválidas. Intente nuevamente.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#1B5E20]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-amber-700 opacity-95"></div>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920')",
        }}
      ></div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/40">
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-3.5">
              <div className="w-12 h-12 bg-[var(--color-arona-500)] rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-700/20">
                <span className="material-icons-outlined text-white text-2xl">eco</span>
              </div>
              <span className="text-3xl font-extrabold text-[var(--color-arona-500)] tracking-tight">
                Arona
              </span>
            </div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              Sociedad Agrícola Arona S.A.
            </h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">
              Plataforma Integral de Gestión y Trazabilidad Agrícola
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Correo */}
            <div>
              <label
                htmlFor="login-correo"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  id="login-correo"
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="operador@arona.com.pe"
                  className={`w-full pl-4 pr-10 py-3 bg-emerald-50/40 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all placeholder-gray-400 ${
                    errors.correo
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                  }`}
                />
                <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none">
                  mail
                </span>
              </div>
              {errors.correo && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.correo}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Contraseña
                </label>
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Por favor solicite el restablecimiento al Administrador de TI.');
                  }}
                  className="text-xs text-[var(--color-arona-500)] hover:underline font-medium"
                >
                  ¿Olvidó contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-11 py-3 bg-emerald-50/40 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all placeholder-gray-400 ${
                    errors.password
                      ? 'border-red-400 focus:border-red-400'
                      : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
                >
                  <span className="material-icons-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember device */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-arona-500)] focus:ring-[var(--color-arona-500)] cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-xs text-gray-600 cursor-pointer select-none"
              >
                Recordar en este equipo
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="arona-btn-primary w-full justify-center py-3.5 text-base font-semibold shadow-lg shadow-emerald-700/25 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin material-icons-outlined text-xl">
                    refresh
                  </span>
                  Validando credenciales...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <span className="material-icons-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 animate-fade-in flex items-center gap-2">
              <span className="material-icons-outlined text-base">error_outline</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Footer Links */}
          <div className="text-center mt-8 pt-4 border-t border-gray-100 space-y-3">
            <p className="text-xs text-gray-600">
              ¿No tiene una cuenta asignada?{' '}
              <Link
                to="/auth/register"
                className="text-[var(--color-arona-500)] font-bold hover:underline"
              >
                Regístrese aquí
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <span className="material-icons-outlined text-base text-[var(--color-arona-500)]">
                admin_panel_settings
              </span>
              <Link
                to="/auth/login-admin"
                className="hover:text-[var(--color-arona-500)] transition-colors font-medium"
              >
                Acceso Administrador del Sistema
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
