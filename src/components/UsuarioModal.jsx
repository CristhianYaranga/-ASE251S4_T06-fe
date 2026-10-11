import React, { useState, useEffect } from 'react';

export function UsuarioModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const isCreate = !initialData;

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correo: '',
    dni: '',
    telefono: '',
    direccion: '',
    password: '',
    rol: 'ENCARGADO',
    area: 'CAMPO',
    estado: true,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      const name =
        initialData.nombreCompleto ||
        `${initialData.nombres || ''} ${initialData.apellidos || ''}`.trim() ||
        '';
      setFormData({
        nombreCompleto: name,
        correo: initialData.correo || '',
        dni: initialData.dni || '',
        telefono: initialData.telefono || '',
        direccion: initialData.direccion || '',
        password: '',
        rol: initialData.rol || 'ENCARGADO',
        area: initialData.area || 'CAMPO',
        estado: initialData.estado ?? true,
      });
    } else {
      setFormData({
        nombreCompleto: '',
        correo: '',
        dni: '',
        telefono: '',
        direccion: '',
        password: '',
        rol: 'ENCARGADO',
        area: 'CAMPO',
        estado: true,
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (data = formData) => {
    const errs = {};
    if (!data.nombreCompleto?.trim()) {
      errs.nombreCompleto = 'El nombre completo es obligatorio';
    } else if (data.nombreCompleto.trim().length < 2) {
      errs.nombreCompleto = 'Mínimo 2 caracteres';
    } else if (data.nombreCompleto.length > 100) {
      errs.nombreCompleto = 'Máximo 100 caracteres';
    }

    if (!data.correo?.trim()) {
      errs.correo = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) {
      errs.correo = 'Ingrese un correo electrónico válido';
    }

    if (data.dni && !/^\d{8}$/.test(data.dni)) {
      errs.dni = 'El DNI debe tener 8 dígitos numéricos';
    }

    if (data.telefono && !/^\d{9}$/.test(data.telefono)) {
      errs.telefono = 'El teléfono debe tener 9 dígitos numéricos';
    }

    if (isCreate) {
      if (!data.password) {
        errs.password = 'La contraseña es obligatoria';
      } else if (data.password.length < 6) {
        errs.password = 'Mínimo 6 caracteres';
      }
    } else if (data.password && data.password.length < 6) {
      errs.password = 'Mínimo 6 caracteres si desea cambiarla';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    const updated = { ...formData, [name]: val };
    setFormData(updated);

    if (touched[name]) {
      setErrors(validate(updated));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(formData).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allTouched);
    const errs = validate(formData);
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      const parts = formData.nombreCompleto.trim().split(/\s+(.*)/s);
      const payload = {
        nombreCompleto: formData.nombreCompleto.trim(),
        nombres: parts[0] || '',
        apellidos: parts[1] || '',
        correo: formData.correo.trim(),
        dni: formData.dni?.trim() || null,
        telefono: formData.telefono?.trim() || null,
        direccion: formData.direccion?.trim() || null,
        rol: formData.rol,
        area: formData.area,
        estado: formData.estado,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      onSubmit(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 z-10 animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {isCreate ? 'Nuevo Usuario' : 'Editar Usuario'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Administración de cuentas, accesos y roles del sistema
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all border-none bg-transparent cursor-pointer"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Nombre Completo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: Juan Pérez Morales"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                touched.nombreCompleto && errors.nombreCompleto
                  ? 'border-red-400'
                  : 'border-gray-200 focus:border-[var(--color-arona-500)]'
              }`}
            />
            {touched.nombreCompleto && errors.nombreCompleto && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">error</span>{' '}
                {errors.nombreCompleto}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Correo */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Correo Institucional *
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="usuario@arona.com.pe"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.correo && errors.correo
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.correo && errors.correo && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.correo}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                {isCreate ? 'Contraseña *' : 'Nueva Contraseña (Opcional)'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={isCreate ? '••••••••' : 'Dejar en blanco para conservar'}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.password && errors.password
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.password && errors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DNI */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                DNI (8 dígitos)
              </label>
              <input
                type="text"
                name="dni"
                maxLength={8}
                value={formData.dni}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="12345678"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.dni && errors.dni
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.dni && errors.dni && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.dni}
                </p>
              )}
            </div>

            {/* Telefono */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Teléfono (9 dígitos)
              </label>
              <input
                type="text"
                name="telefono"
                maxLength={9}
                value={formData.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="987654321"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.telefono && errors.telefono
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.telefono && errors.telefono && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.telefono}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rol */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Rol del Sistema *
              </label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
              >
                <option value="ENCARGADO">Encargado de Campo</option>
                <option value="ADMINISTRADOR">Administrador General</option>
              </select>
            </div>

            {/* Área */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Área Laboral *
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
              >
                <option value="CAMPO">Operaciones Campo</option>
                <option value="ADMINISTRACION">Administración</option>
                <option value="CALIDAD">Aseguramiento de Calidad</option>
                <option value="LOGISTICA">Logística y Despacho</option>
              </select>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Dirección Domiciliaria
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Av. Los Libertadores 450, Ica"
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="arona-btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="arona-btn-primary disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="material-icons-outlined text-lg animate-spin">
                    refresh
                  </span>
                  Guardando...
                </>
              ) : (
                <>
                  <span className="material-icons-outlined text-lg">
                    {isCreate ? 'person_add' : 'save'}
                  </span>
                  {isCreate ? 'Registrar Usuario' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
