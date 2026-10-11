import React, { useState, useEffect } from 'react';
import { backendDateToInput, inputDateToBackend } from '../utils/formatDate';
import { kgToTonNum, tonToKg } from '../utils/produccionUtils';

export function CosechaModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  campos = [],
  cultivos = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    campoId: '',
    cultivoId: '',
    cantidadTon: '',
    cantidadUnidades: '',
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      const campoVal =
        initialData.idCampo ||
        initialData.campo?.id ||
        initialData.campo?.idCampo ||
        '';
      const cultivoVal =
        initialData.idCultivo ||
        initialData.cultivo?.id ||
        initialData.cultivo?.idCultivo ||
        '';
      setFormData({
        fecha: backendDateToInput(initialData.fecha),
        campoId: String(campoVal),
        cultivoId: String(cultivoVal),
        cantidadTon: kgToTonNum(initialData.cantidadKg) || '',
        cantidadUnidades: initialData.cantidadUnidades ?? '',
        observaciones: initialData.observaciones || '',
      });
    } else {
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        campoId: '',
        cultivoId: '',
        cantidadTon: '',
        cantidadUnidades: '',
        observaciones: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Filter crops for currently selected field
  const filteredCultivos = formData.campoId
    ? cultivos.filter((c) => {
        const cid =
          c.campoId ||
          c.idCampo ||
          c.campo?.id ||
          c.campo?.idCampo;
        return String(cid) === String(formData.campoId);
      })
    : cultivos;

  const validate = (data = formData) => {
    const errs = {};
    if (!data.fecha) {
      errs.fecha = 'La fecha es obligatoria';
    } else {
      const selected = new Date(data.fecha);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selected > today) {
        errs.fecha = 'La fecha no puede ser futura';
      }
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (selected < oneYearAgo) {
        errs.fecha = 'La fecha no puede tener más de 1 año de antigüedad';
      }
    }

    if (!data.campoId) {
      errs.campoId = 'Seleccione un campo';
    }

    if (!data.cultivoId) {
      errs.cultivoId = 'Seleccione un cultivo';
    }

    if (!data.cantidadTon || Number(data.cantidadTon) <= 0) {
      errs.cantidadTon = 'La cantidad debe ser mayor que 0';
    } else if (Number(data.cantidadTon) > 1000) {
      errs.cantidadTon = 'No puede superar las 1,000 toneladas';
    }

    if (
      data.cantidadUnidades !== '' &&
      (!Number.isInteger(Number(data.cantidadUnidades)) || Number(data.cantidadUnidades) < 0)
    ) {
      errs.cantidadUnidades = 'Debe ser un número entero mayor o igual a 0';
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

    const autoSelectedCultivo = available.length === 1 ? (available[0].id || available[0].idCultivo) : '';

    const updated = {
      ...formData,
      campoId: cid,
      cultivoId: autoSelectedCultivo ? String(autoSelectedCultivo) : '',
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
        fecha: inputDateToBackend(formData.fecha),
        idCampo: String(formData.campoId),
        idCultivo: String(formData.cultivoId),
        cantidadKg: tonToKg(Number(formData.cantidadTon)),
        cantidadUnidades: formData.cantidadUnidades ? Number(formData.cantidadUnidades) : 0,
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
              {initialData ? 'Editar Cosecha' : 'Nueva Cosecha'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Ingrese los registros pesados de la producción cosechada
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
          {/* Fecha */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Fecha de Cosecha *
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

          {/* Cultivo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Cultivo *
            </label>
            <select
              name="cultivoId"
              value={formData.cultivoId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                touched.cultivoId && errors.cultivoId
                  ? 'border-red-400'
                  : 'border-gray-200 focus:border-[var(--color-arona-500)]'
              }`}
            >
              <option value="">— Seleccionar cultivo —</option>
              {filteredCultivos.map((cv) => {
                const cvId = cv.id || cv.idCultivo;
                return (
                  <option key={cvId} value={cvId}>
                    {cv.nombre} ({cv.tipoCultivo})
                  </option>
                );
              })}
            </select>
            {touched.cultivoId && errors.cultivoId && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">error</span>{' '}
                {errors.cultivoId}
              </p>
            )}
            {formData.campoId && filteredCultivos.length === 0 && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">warning</span> No
                hay cultivos registrados en este lote
              </p>
            )}
          </div>

          {/* Cantidades: Toneladas y Unidades */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Cantidad (t) *
              </label>
              <input
                type="number"
                name="cantidadTon"
                step="0.01"
                min="0.01"
                max="1000"
                value={formData.cantidadTon}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0.00"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.cantidadTon && errors.cantidadTon
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.cantidadTon && errors.cantidadTon && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.cantidadTon}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Jabas / Cajas
              </label>
              <input
                type="number"
                name="cantidadUnidades"
                step="1"
                min="0"
                value={formData.cantidadUnidades}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.cantidadUnidades && errors.cantidadUnidades
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.cantidadUnidades && errors.cantidadUnidades && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.cantidadUnidades}
                </p>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Observaciones *
            </label>
            <textarea
              name="observaciones"
              rows="3"
              value={formData.observaciones}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Notas de pesaje, cuadrilla, calibre..."
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
                  {initialData ? 'Guardar Cambios' : 'Registrar Cosecha'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
