import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function LoginAdminPage() {
  const { loginAdmin } = useAuth();
  const { error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    correo: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.correo.trim()) {
      errs.correo = 'El correo institucional es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errs.correo = 'Ingrese un correo electrónico válido';
    }

    if (!formData.password) {
      errs.password = 'La contraseña administrativa es requerida';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await loginAdmin({
        correo: formData.correo.trim(),
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Credenciales inválidas o sin privilegios de Administrador.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Dark Slate & Deep Emerald Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950"></div>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920')",
        }}
      ></div>

      {/* Decorative Blur */}
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-700/60 text-white">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-3.5">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <span className="material-icons-outlined text-white text-2xl">
                  admin_panel_settings
                </span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Arona Admin
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-100">
              Acceso a la Consola de Administración
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Restringido exclusivamente para personal directivo y TI
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-correo"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Correo Administrador
              </label>
              <div className="relative">
                <input
                  id="admin-correo"
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="admin@arona.com.pe"
                  className={`w-full pl-4 pr-10 py-3 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder-slate-500 ${
                    errors.correo
                      ? 'border-red-500'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                  badge
                </span>
              </div>
              {errors.correo && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.correo}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Contraseña Administrativa
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-11 py-3 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder-slate-500 ${
                    errors.password
                      ? 'border-red-500'
                      : 'border-slate-700 focus:border-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
                >
                  <span className="material-icons-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full justify-center py-3.5 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/40 border-none cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50 mt-3"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin material-icons-outlined text-xl">
                    refresh
                  </span>
                  Verificando permisos...
                </>
              ) : (
                <>
                  <span className="material-icons-outlined text-xl">
                    verified_user
                  </span>
                  Acceder a la Consola
                </>
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-950/70 border border-red-800/80 rounded-xl text-xs text-red-300 animate-fade-in flex items-center gap-2">
              <span className="material-icons-outlined text-base text-red-400">
                security
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="text-center mt-6 pt-4 border-t border-slate-800">
            <Link
              to="/auth/login"
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-icons-outlined text-sm">arrow_back</span>
              Volver al inicio de sesión regular
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
