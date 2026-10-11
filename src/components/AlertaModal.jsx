import React, { useState, useEffect } from 'react';
import { backendDateToInput, inputDateToBackend } from '../utils/formatDate';

export function AlertaModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  campos = [],
  cultivos = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    campoId: '',
    cultivoId: '',
    tipoProblema: 'ENFERMEDAD',
    fechaDeteccion: new Date().toISOString().split('T')[0],
    descripcionProblema: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      const cId =
        initialData.idCampo ||
        initialData.campo?.idCampo ||
        initialData.campo?.id ||
        '';
      const cuId =
        initialData.idCultivo ||
        initialData.cultivo?.idCultivo ||
        initialData.cultivo?.id ||
        '';
      setFormData({
        campoId: String(cId),
        cultivoId: cuId ? String(cuId) : '',
        tipoProblema: initialData.tipoProblema || 'ENFERMEDAD',
        fechaDeteccion: backendDateToInput(initialData.fechaDeteccion),
        descripcionProblema: initialData.descripcionProblema || '',
      });
    } else {
      setFormData({
        campoId: '',
        cultivoId: '',
        tipoProblema: 'ENFERMEDAD',
        fechaDeteccion: new Date().toISOString().split('T')[0],
        descripcionProblema: '',
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
    if (!data.campoId) {
      errs.campoId = 'Seleccione un campo afectado';
    }

    if (!data.fechaDeteccion) {
      errs.fechaDeteccion = 'La fecha de detección es obligatoria';
    }

    if (!data.descripcionProblema?.trim()) {
      errs.descripcionProblema = 'La descripción es obligatoria';
    } else if (data.descripcionProblema.trim().length < 5) {
      errs.descripcionProblema = 'Mínimo 5 caracteres';
    } else if (data.descripcionProblema.trim().length > 500) {
      errs.descripcionProblema = 'Máximo 500 caracteres';
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
        idCampo: String(formData.campoId),
        idCultivo: formData.cultivoId ? String(formData.cultivoId) : null,
        tipoProblema: formData.tipoProblema,
        fechaDeteccion: inputDateToBackend(formData.fechaDeteccion),
        descripcionProblema: formData.descripcionProblema.trim(),
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
              {initialData ? 'Editar Alerta' : 'Reportar Alerta Fitosanitaria'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Notifique plagas, hongos o anomalías sanitarias en los lotes
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
            {/* Tipo de Problema */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Tipo de Incidencia *
              </label>
              <select
                name="tipoProblema"
                value={formData.tipoProblema}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
              >
                <option value="ENFERMEDAD">🍂 Enfermedad (Hongo/Bacteria)</option>
                <option value="PLAGA">🐛 Plaga de Insectos / Ácaros</option>
                <option value="OTRO">⚠️ Fisiopatía u Otro daño</option>
              </select>
            </div>

            {/* Fecha Detección */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Fecha de Detección *
              </label>
              <input
                type="date"
                name="fechaDeteccion"
                value={formData.fechaDeteccion}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.fechaDeteccion && errors.fechaDeteccion
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.fechaDeteccion && errors.fechaDeteccion && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.fechaDeteccion}
                </p>
              )}
            </div>
          </div>

          {/* Campo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Campo / Lote Afectado *
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

          {/* Cultivo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Cultivo en Lote (Opcional)
            </label>
            <select
              name="cultivoId"
              value={formData.cultivoId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
            >
              <option value="">— Todo el lote / Sin especificar —</option>
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

          {/* Descripción */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Descripción del Síntoma o Daño *
            </label>
            <textarea
              name="descripcionProblema"
              rows="3"
              value={formData.descripcionProblema}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describa síntomas visibles, porcentaje de afectación o sospecha de patógeno..."
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all resize-none ${
                touched.descripcionProblema && errors.descripcionProblema
                  ? 'border-red-400'
                  : 'border-gray-200 focus:border-[var(--color-arona-500)]'
              }`}
            />
            {touched.descripcionProblema && errors.descripcionProblema && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">error</span>{' '}
                {errors.descripcionProblema}
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
                    {initialData ? 'save' : 'campaign'}
                  </span>
                  {initialData ? 'Guardar Cambios' : 'Emitir Alerta'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
