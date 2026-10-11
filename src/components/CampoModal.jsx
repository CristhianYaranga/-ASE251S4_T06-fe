import React, { useState, useEffect } from 'react';

export function CampoModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
    hectareas: '',
    responsable: '',
    sistemaRiego: 'Goteo',
    tipoSuelo: '',
    zona: '',
    observaciones: '',
    estado: true,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        ubicacion: initialData.ubicacion || '',
        hectareas: initialData.hectareas ?? initialData.areaHectareas ?? '',
        responsable: initialData.responsable || '',
        sistemaRiego: initialData.sistemaRiego || 'Goteo',
        tipoSuelo: initialData.tipoSuelo || '',
        zona: initialData.zona || '',
        observaciones: initialData.observaciones || '',
        estado: initialData.estado ?? true,
      });
    } else {
      setFormData({
        nombre: '',
        ubicacion: '',
        hectareas: '',
        responsable: '',
        sistemaRiego: 'Goteo',
        tipoSuelo: '',
        zona: '',
        observaciones: '',
        estado: true,
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const getWordCount = (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  };

  const validate = (dataToValidate = formData) => {
    const errs = {};
    if (!dataToValidate.nombre?.trim()) {
      errs.nombre = 'El nombre es obligatorio';
    } else if (dataToValidate.nombre.length > 100) {
      errs.nombre = 'Máximo 100 caracteres';
    }

    if (!dataToValidate.ubicacion?.trim()) {
      errs.ubicacion = 'La ubicación es obligatoria';
    } else if (dataToValidate.ubicacion.length > 200) {
      errs.ubicacion = 'Máximo 200 caracteres';
    }

    if (!dataToValidate.hectareas || Number(dataToValidate.hectareas) <= 0) {
      errs.hectareas = 'Las hectáreas deben ser mayores a 0';
    }

    if (!dataToValidate.responsable?.trim()) {
      errs.responsable = 'El responsable es obligatorio';
    } else if (dataToValidate.responsable.length > 150) {
      errs.responsable = 'Máximo 150 caracteres';
    }

    if (!dataToValidate.tipoSuelo?.trim()) {
      errs.tipoSuelo = 'El tipo de suelo es obligatorio';
    } else if (dataToValidate.tipoSuelo.length > 100) {
      errs.tipoSuelo = 'Máximo 100 caracteres';
    }

    if (!dataToValidate.zona?.trim()) {
      errs.zona = 'La zona es obligatoria';
    } else if (dataToValidate.zona.length > 100) {
      errs.zona = 'Máximo 100 caracteres';
    }

    if (!dataToValidate.observaciones?.trim()) {
      errs.observaciones = 'Las observaciones son obligatorias';
    } else {
      const words = getWordCount(dataToValidate.observaciones);
      if (words > 300) {
        errs.observaciones = `Límite superado: ${words}/300 palabras`;
      }
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    const updated = { ...formData, [name]: val };
    setFormData(updated);

    if (touched[name]) {
      const errs = validate(updated);
      setErrors(errs);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(formData);
    setErrors(errs);
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
      onSubmit({
        ...formData,
        hectareas: Number(formData.hectareas),
      });
    }
  };

  const wordCount = getWordCount(formData.observaciones);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 z-10 animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {initialData ? 'Editar Campo' : 'Nuevo Campo'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Complete los detalles agronómicos del lote
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Nombre del Lote *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Lote Norte A1"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.nombre && errors.nombre
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.nombre && errors.nombre && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.nombre}
                </p>
              )}
            </div>

            {/* Hectáreas */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Área (Hectáreas) *
              </label>
              <input
                type="number"
                name="hectareas"
                step="0.01"
                min="0.01"
                value={formData.hectareas}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: 15.5"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.hectareas && errors.hectareas
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.hectareas && errors.hectareas && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.hectareas}
                </p>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Ubicación *
            </label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ej: Valle de Ica - Sector La Tinguiña Km 12"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                touched.ubicacion && errors.ubicacion
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-200 focus:border-[var(--color-arona-500)]'
              }`}
            />
            {touched.ubicacion && errors.ubicacion && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">error</span>{' '}
                {errors.ubicacion}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Responsable */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Responsable de Campo *
              </label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Ing. Carlos Arona"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.responsable && errors.responsable
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.responsable && errors.responsable && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.responsable}
                </p>
              )}
            </div>

            {/* Zona */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Zona Agrícola *
              </label>
              <input
                type="text"
                name="zona"
                value={formData.zona}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Zona Norte, Sector D"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.zona && errors.zona
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.zona && errors.zona && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.zona}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sistema de Riego */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Sistema de Riego
              </label>
              <select
                name="sistemaRiego"
                value={formData.sistemaRiego}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
              >
                <option value="Goteo">Goteo automatizado</option>
                <option value="Aspersión">Aspersión</option>
                <option value="Microaspersión">Microaspersión</option>
                <option value="Gravedad">Gravedad / Surcos</option>
              </select>
            </div>

            {/* Tipo de Suelo */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Tipo de Suelo *
              </label>
              <input
                type="text"
                name="tipoSuelo"
                value={formData.tipoSuelo}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Franco arenoso"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.tipoSuelo && errors.tipoSuelo
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.tipoSuelo && errors.tipoSuelo && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.tipoSuelo}
                </p>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                Observaciones *
              </label>
              <span
                className={`text-xs ${
                  wordCount > 300
                    ? 'text-red-500 font-bold'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {wordCount} / 300 palabras
              </span>
            </div>
            <textarea
              name="observaciones"
              rows="3"
              value={formData.observaciones}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Notas sobre el estado físico, fertilidad, antecedentes..."
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all resize-none ${
                touched.observaciones && errors.observaciones
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-200 focus:border-[var(--color-arona-500)]'
              }`}
            />
            {touched.observaciones && errors.observaciones && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">error</span>{' '}
                {errors.observaciones}
              </p>
            )}
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
                    {initialData ? 'save' : 'add_circle'}
                  </span>
                  {initialData ? 'Guardar Cambios' : 'Crear Campo'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
