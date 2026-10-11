import React, { useState, useEffect } from 'react';
import { backendDateToInput, inputDateToBackend } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';

export function CalidadModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  cosechas = [],
  usuarios = [],
  isLoading = false,
}) {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.idUsuario || currentUser?.id || '';

  const [formData, setFormData] = useState({
    idCosechaSelected: '',
    idSupervisorSelected: '',
    fecha: new Date().toISOString().split('T')[0],
    cumpleRequisitos: true,
    observaciones: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      const cId =
        initialData.idCosecha ??
        initialData.cosecha?.idCosecha ??
        initialData.cosecha?.id ??
        '';
      const sId =
        initialData.idUsuarioSupervisor ||
        initialData.idSupervisor ||
        initialData.supervisor?.idUsuario ||
        initialData.supervisor?.id ||
        currentUserId;

      setFormData({
        idCosechaSelected: String(cId),
        idSupervisorSelected: String(sId),
        fecha: backendDateToInput(initialData.fecha),
        cumpleRequisitos: initialData.cumpleRequisitos ?? true,
        observaciones: initialData.observaciones || '',
      });
    } else {
      setFormData({
        idCosechaSelected: cosechas[0]?.id || cosechas[0]?.idCosecha ? String(cosechas[0].id || cosechas[0].idCosecha) : '',
        idSupervisorSelected: String(currentUserId),
        fecha: new Date().toISOString().split('T')[0],
        cumpleRequisitos: true,
        observaciones: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen, currentUserId, cosechas]);

  if (!isOpen) return null;

  const validate = (data = formData) => {
    const errs = {};
    if (!data.idCosechaSelected) {
      errs.idCosechaSelected = 'Seleccione una cosecha para auditar';
    }

    if (!data.idSupervisorSelected) {
      errs.idSupervisorSelected = 'Seleccione un supervisor responsable';
    }

    if (!data.fecha) {
      errs.fecha = 'La fecha de revisión es obligatoria';
    }

    if (!data.cumpleRequisitos && !data.observaciones?.trim()) {
      errs.observaciones = 'Las observaciones son obligatorias cuando la revisión no cumple requisitos (rechazada)';
    } else if (data.observaciones?.trim()) {
      if (data.observaciones.trim().length < 10) {
        errs.observaciones = 'Mínimo 10 caracteres';
      } else if (data.observaciones.trim().length > 500) {
        errs.observaciones = 'Máximo 500 caracteres';
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
        idCosecha: Number(formData.idCosechaSelected),
        idSupervisor: String(formData.idSupervisorSelected),
        cumpleRequisitos: Boolean(formData.cumpleRequisitos),
        observaciones: formData.observaciones.trim(),
        fecha: inputDateToBackend(formData.fecha),
      };
      onSubmit(payload);
    }
  };

  const getCosechaOptionLabel = (c) => {
    const id = c.id || c.idCosecha;
    const cultivo = c.cultivo?.nombre || c.idCultivo || 'Cultivo';
    const campo = c.campo?.nombre || c.idCampo || 'Campo';
    const tons = c.cantidadKg ? `${(c.cantidadKg / 1000).toFixed(2)} t` : '';
    return `#${id} · ${cultivo} en ${campo} ${tons ? `(${tons})` : ''}`;
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
              {initialData ? 'Editar Control de Calidad' : 'Nueva Inspección de Calidad'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Auditoría sensorial, calibre y estándares de inocuidad
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
          {/* Cosecha */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Lote de Cosecha a Auditar *
            </label>
            <select
              name="idCosechaSelected"
              value={formData.idCosechaSelected}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                touched.idCosechaSelected && errors.idCosechaSelected
                  ? 'border-red-400'
                  : 'border-gray-200 focus:border-[var(--color-arona-500)]'
              }`}
            >
              <option value="">— Seleccionar cosecha —</option>
              {cosechas.map((c) => {
                const cId = c.id || c.idCosecha;
                return (
                  <option key={cId} value={cId}>
                    {getCosechaOptionLabel(c)}
                  </option>
                );
              })}
            </select>
            {touched.idCosechaSelected && errors.idCosechaSelected && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">error</span>{' '}
                {errors.idCosechaSelected}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supervisor */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Supervisor Asignado *
              </label>
              <select
                name="idSupervisorSelected"
                value={formData.idSupervisorSelected}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.idSupervisorSelected && errors.idSupervisorSelected
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              >
                <option value="">— Seleccionar supervisor —</option>
                {usuarios.map((u) => {
                  const uId = u.id || u.idUsuario;
                  const name =
                    u.nombreCompleto ||
                    `${u.nombres || ''} ${u.apellidos || ''}`.trim() ||
                    u.correo;
                  return (
                    <option key={uId} value={uId}>
                      {name}
                    </option>
                  );
                })}
              </select>
              {touched.idSupervisorSelected && errors.idSupervisorSelected && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.idSupervisorSelected}
                </p>
              )}
            </div>

            {/* Fecha */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Fecha de Inspección *
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

          {/* Cumple Requisitos (Toggle buttons) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1.5">
              Dictamen de Calidad *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, cumpleRequisitos: true }))
                }
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all border cursor-pointer ${
                  formData.cumpleRequisitos
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="material-icons-outlined text-emerald-600">
                  check_circle
                </span>
                Aprobado (Cumple)
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, cumpleRequisitos: false }))
                }
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all border cursor-pointer ${
                  !formData.cumpleRequisitos
                    ? 'bg-red-50 border-red-500 text-red-800 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="material-icons-outlined text-red-600">cancel</span>
                Rechazado (No Cumple)
              </button>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Observaciones del Inspector{' '}
              {!formData.cumpleRequisitos ? '(Obligatorio en Rechazo) *' : '(Opcional)'}
            </label>
            <textarea
              name="observaciones"
              rows="3"
              value={formData.observaciones}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={
                formData.cumpleRequisitos
                  ? 'Notas de muestreo, grados Brix, firmeza...'
                  : 'Detalle el motivo técnico del rechazo (ej. daño mecánico > 5%, plaga cuarentenaria)...'
              }
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
                    {initialData ? 'save' : 'verified'}
                  </span>
                  {initialData ? 'Guardar Cambios' : 'Emitir Dictamen'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
