import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function RegisterPage() {
  const { register } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    dni: '',
    telefono: '',
    direccion: '',
    area: 'CAMPO',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!formData.apellidos.trim()) errs.apellidos = 'Los apellidos son obligatorios';

    if (!formData.correo.trim()) {
      errs.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      errs.correo = 'Ingrese un correo electrónico válido';
    }

    if (!formData.dni.trim()) {
      errs.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8}$/.test(formData.dni.trim())) {
      errs.dni = 'El DNI debe tener exactamente 8 dígitos numéricos';
    }

    if (formData.telefono && !/^\d{9}$/.test(formData.telefono.trim())) {
      errs.telefono = 'El teléfono debe tener 9 dígitos';
    }

    if (!formData.area) errs.area = 'Seleccione un área laboral';

    if (!formData.password) {
      errs.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      errs.password = 'Mínimo 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Las contraseñas no coinciden';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);

    try {
      const payload = {
        nombreCompleto: `${formData.nombre.trim()} ${formData.apellidos.trim()}`,
        correo: formData.correo.trim(),
        password: formData.password,
        dni: formData.dni.trim(),
        telefono: formData.telefono.trim() || null,
        direccion: formData.direccion.trim() || null,
        rol: 'ENCARGADO',
        area: formData.area,
        estado: true,
      };

      await register(payload);
      toastSuccess('¡Cuenta registrada exitosamente! Ahora puede iniciar sesión.');
      navigate('/auth/login');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error al crear la cuenta. Intente nuevamente.';
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#1B5E20] py-10">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-amber-700 opacity-95"></div>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920')",
        }}
      ></div>

      <div className="relative z-10 w-full max-w-xl mx-4 animate-scale-in">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/40">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-[var(--color-arona-500)] rounded-xl flex items-center justify-center shadow-md">
                <span className="material-icons-outlined text-white text-xl">eco</span>
              </div>
              <span className="text-2xl font-bold text-[var(--color-arona-500)]">
                Arona
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Crear Nueva Cuenta</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Registro de personal para operaciones agrícolas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Juan Carlos"
                  className={`w-full px-3.5 py-2.5 bg-emerald-50/40 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 ${
                    errors.nombre ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.nombre && (
                  <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Pérez Ramos"
                  className={`w-full px-3.5 py-2.5 bg-emerald-50/40 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 ${
                    errors.apellidos ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.apellidos && (
                  <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="juan.perez@arona.com.pe"
                  className={`w-full px-3.5 py-2.5 bg-emerald-50/40 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 ${
                    errors.correo ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.correo && (
                  <p className="text-xs text-red-500 mt-1">{errors.correo}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  DNI (8 dígitos) *
                </label>
                <input
                  type="text"
                  name="dni"
                  maxLength={8}
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="71234567"
                  className={`w-full px-3.5 py-2.5 bg-emerald-50/40 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 ${
                    errors.dni ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errors.dni && (
                  <p className="text-xs text-red-500 mt-1">{errors.dni}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Teléfono Móvil
                </label>
                <input
                  type="text"
                  name="telefono"
                  maxLength={9}
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="987654321"
                  className="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20"
                />
                {errors.telefono && (
                  <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Área Laboral *
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20"
                >
                  <option value="CAMPO">Operaciones Campo</option>
                  <option value="ADMINISTRACION">Administración</option>
                  <option value="CALIDAD">Aseguramiento de Calidad</option>
                  <option value="LOGISTICA">Logística / Empaque</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Av. Principal Km 14, Ica"
                className="w-full px-3.5 py-2.5 bg-emerald-50/40 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 bg-emerald-50/40 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 ${
                      errors.password ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0.5"
                  >
                    <span className="material-icons-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-3.5 py-2.5 bg-emerald-50/40 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 ${
                      errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-0.5"
                  >
                    <span className="material-icons-outlined text-lg">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="arona-btn-primary w-full justify-center py-3.5 text-base font-semibold shadow-lg shadow-emerald-700/25 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin material-icons-outlined text-xl">
                    refresh
                  </span>
                  Creando cuenta...
                </>
              ) : (
                <>
                  Registrar Cuenta
                  <span className="material-icons-outlined text-xl">person_add</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              ¿Ya tiene una cuenta registrada?{' '}
              <Link
                to="/auth/login"
                className="text-[var(--color-arona-500)] font-bold hover:underline"
              >
                Inicie sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
