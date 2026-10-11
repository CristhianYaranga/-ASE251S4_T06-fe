import React, { useState, useEffect } from 'react';

export function ActividadModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  campos = [],
  cultivos = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    tipoActividad: 'RIEGO',
    fecha: new Date().toISOString().split('T')[0],
    campoId: '',
    cultivoId: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      let fechaVal = initialData.fecha || '';
      if (fechaVal.includes('/')) {
        const parts = fechaVal.split('/');
        if (parts.length === 3) fechaVal = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (fechaVal.includes('T')) {
        fechaVal = fechaVal.split('T')[0];
      }

      setFormData({
        tipoActividad: initialData.tipoActividad || 'RIEGO',
        fecha: fechaVal || new Date().toISOString().split('T')[0],
        campoId: String(initialData.idCampo || ''),
        cultivoId: initialData.idCultivo ? String(initialData.idCultivo) : '',
        observaciones: initialData.observaciones || '',
      });
    } else {
      setFormData({
        tipoActividad: 'RIEGO',
        fecha: new Date().toISOString().split('T')[0],
        campoId: '',
        cultivoId: '',
        observaciones: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const filteredCultivos = formData.campoId
    ? cultivos.filter((c) => {
        const cid = c.campoId || c.idCampo || c.campo?.id || c.campo?.idCampo;
        return String(cid) === String(formData.campoId);
      })
    : cultivos;

  const validate = (data = formData) => {
    const errs = {};
    if (!data.fecha) {
      errs.fecha = 'La fecha es obligatoria';
    }

    if (!data.campoId) {
      errs.campoId = 'Seleccione un campo';
    }

    if (!data.observaciones?.trim()) {
      errs.observaciones = 'Las observaciones son obligatorias';
    } else if (data.observaciones.trim().length < 10) {
      errs.observaciones = 'Mínimo 10 caracteres';
    } else if (data.observaciones.trim().length > 500) {
      errs.observaciones = 'Máximo 500 caracteres';
    }

    return errs;
  };

  const handleCampoChange = (e) => {
    const cid = e.target.value;
    const available = cultivos.filter((c) => {
      const cId = c.campoId || c.idCampo || c.campo?.id || c.campo?.idCampo;
      return String(cId) === String(cid);
    });
    const autoCultivo = available.length === 1 ? (available[0].id || available[0].idCultivo) : '';

    const updated = {
      ...formData,
      campoId: cid,
      cultivoId: autoCultivo ? String(autoCultivo) : '',
    };
    setFormData(updated);

    if (touched.campoId) {
      setErrors(validate(updated));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
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
      const payload = {
        tipoActividad: formData.tipoActividad,
        fecha: formData.fecha,
        idCampo: String(formData.campoId),
        idCultivo: formData.cultivoId ? String(formData.cultivoId) : null,
        observaciones: formData.observaciones.trim(),
      };
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
              {initialData ? 'Editar Actividad' : 'Nueva Actividad de Campo'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Registre labores agrícolas, riegos o tratamientos fitosanitarios
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
            {/* Tipo de Actividad */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Tipo de Labor *
              </label>
              <select
                name="tipoActividad"
                value={formData.tipoActividad}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
              >
                <option value="RIEGO">💧 Riego</option>
                <option value="PODA">✂️ Poda</option>
                <option value="FUMIGACION">🧪 Fumigación</option>
                <option value="FERTILIZACION">🌱 Fertilización</option>
                <option value="OTRO">🛠️ Otro mantenimiento</option>
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Fecha de Ejecución *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.fecha && errors.fecha
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.fecha && errors.fecha && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.fecha}
                </p>
              )}
            </div>
          </div>

          {/* Campo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Campo / Lote *
            </label>
            <select
              name="campoId"
              value={formData.campoId}
              onChange={handleCampoChange}
              onBlur={handleBlur}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                touched.campoId && errors.campoId
                  ? 'border-red-400'
                  : 'border-gray-200 focus:border-[var(--color-arona-500)]'
              }`}
            >
              <option value="">— Seleccionar campo —</option>
              {campos.map((c) => {
                const cId = c.id || c.idCampo;
                return (
                  <option key={cId} value={cId}>
                    {c.nombre} ({c.hectareas || c.areaHectareas} ha)
                  </option>
                );
              })}
            </select>
            {touched.campoId && errors.campoId && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">error</span>{' '}
                {errors.campoId}
              </p>
            )}
          </div>

          {/* Cultivo (opcional) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Cultivo Específico (Opcional)
            </label>
            <select
              name="cultivoId"
              value={formData.cultivoId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
            >
              <option value="">— Todo el campo o no especificado —</option>
              {filteredCultivos.map((cv) => {
                const cvId = cv.id || cv.idCultivo;
                return (
                  <option key={cvId} value={cvId}>
                    {cv.nombre} ({cv.tipoCultivo})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Observaciones */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Descripción / Observaciones *
            </label>
            <textarea
              name="observaciones"
              rows="3"
              value={formData.observaciones}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Detalle dosis, maquinaria, operarios o condiciones de la labor..."
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all resize-none ${
                touched.observaciones && errors.observaciones
                  ? 'border-red-400'
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
                  {initialData ? 'Guardar Cambios' : 'Registrar Actividad'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
