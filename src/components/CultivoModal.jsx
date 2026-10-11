import React, { useState, useEffect } from 'react';
import { backendDateToInput, inputDateToBackend } from '../utils/formatDate';

export function CultivoModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  campos = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipoCultivo: 'MANDARINA',
    frecuenciaRiegoDias: 3,
    temperaturaIdeal: 20,
    fechaSiembraInput: new Date().toISOString().split('T')[0],
    estadoSalud: 'BUENO',
    requiereSombra: false,
    observaciones: '',
    idCampoSelected: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      const campoVal =
        initialData.campoId ||
        initialData.idCampo ||
        initialData.campo?.id ||
        initialData.campo?.idCampo ||
        '';
      setFormData({
        nombre: initialData.nombre || '',
        tipoCultivo: initialData.tipoCultivo || 'MANDARINA',
        frecuenciaRiegoDias: initialData.frecuenciaRiegoDias ?? 3,
        temperaturaIdeal: initialData.temperaturaIdeal ?? 20,
        fechaSiembraInput: backendDateToInput(initialData.fechaSiembra),
        estadoSalud: initialData.estadoSalud || 'BUENO',
        requiereSombra: initialData.requiereSombra ?? false,
        observaciones: initialData.observaciones || '',
        idCampoSelected: String(campoVal),
      });
    } else {
      setFormData({
        nombre: '',
        tipoCultivo: 'MANDARINA',
        frecuenciaRiegoDias: 3,
        temperaturaIdeal: 20,
        fechaSiembraInput: new Date().toISOString().split('T')[0],
        estadoSalud: 'BUENO',
        requiereSombra: false,
        observaciones: '',
        idCampoSelected: campos[0]?.id || campos[0]?.idCampo ? String(campos[0].id || campos[0].idCampo) : '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen, campos]);

  if (!isOpen) return null;

  const validate = (data = formData) => {
    const errs = {};
    if (!data.nombre?.trim()) {
      errs.nombre = 'El nombre es obligatorio';
    } else if (data.nombre.length > 100) {
      errs.nombre = 'Máximo 100 caracteres';
    }

    if (!data.idCampoSelected) {
      errs.idCampoSelected = 'Debe seleccionar un campo';
    }

    if (!data.fechaSiembraInput) {
      errs.fechaSiembraInput = 'La fecha de siembra es requerida';
    }

    if (!data.frecuenciaRiegoDias || Number(data.frecuenciaRiegoDias) < 1) {
      errs.frecuenciaRiegoDias = 'Debe ser al menos 1 día';
    }

    if (
      data.temperaturaIdeal === '' ||
      Number(data.temperaturaIdeal) < 5 ||
      Number(data.temperaturaIdeal) > 45
    ) {
      errs.temperaturaIdeal = 'Debe estar entre 5°C y 45°C';
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
        nombre: formData.nombre.trim(),
        tipoCultivo: formData.tipoCultivo,
        frecuenciaRiegoDias: Number(formData.frecuenciaRiegoDias),
        temperaturaIdeal: Number(formData.temperaturaIdeal),
        fechaSiembra: inputDateToBackend(formData.fechaSiembraInput),
        requiereSombra: Boolean(formData.requiereSombra),
        estadoSalud: formData.estadoSalud,
        observaciones: formData.observaciones.trim(),
        idCampo: String(formData.idCampoSelected),
        campoId: String(formData.idCampoSelected),
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

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 z-10 animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-100">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {initialData ? 'Editar Cultivo' : 'Nuevo Cultivo'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Configure las variables agronómicas del cultivo
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
                Nombre de la Variedad *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej: Mandarina W. Murcott Lote 1"
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.nombre && errors.nombre
                    ? 'border-red-400'
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

            {/* Campo Asignado */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Campo Destino *
              </label>
              <select
                name="idCampoSelected"
                value={formData.idCampoSelected}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.idCampoSelected && errors.idCampoSelected
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
              {touched.idCampoSelected && errors.idCampoSelected && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.idCampoSelected}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo Cultivo */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Tipo de Cultivo *
              </label>
              <select
                name="tipoCultivo"
                value={formData.tipoCultivo}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
              >
                <option value="MANDARINA">Mandarina</option>
                <option value="PALTA">Palta Hass</option>
                <option value="ARANDANO">Arándano Biloxi / Ventura</option>
                <option value="CAQUI">Caqui Rojo Brillante</option>
                <option value="UVA">Uva de Mesa</option>
              </select>
            </div>

            {/* Fecha Siembra */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Fecha de Siembra *
              </label>
              <input
                type="date"
                name="fechaSiembraInput"
                value={formData.fechaSiembraInput}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all ${
                  touched.fechaSiembraInput && errors.fechaSiembraInput
                    ? 'border-red-400'
                    : 'border-gray-200 focus:border-[var(--color-arona-500)]'
                }`}
              />
              {touched.fechaSiembraInput && errors.fechaSiembraInput && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>{' '}
                  {errors.fechaSiembraInput}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Frecuencia Riego */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Riego (días) *
              </label>
              <input
                type="number"
                name="frecuenciaRiegoDias"
                min="1"
                value={formData.frecuenciaRiegoDias}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
              />
              {touched.frecuenciaRiegoDias && errors.frecuenciaRiegoDias && (
                <p className="text-xs text-red-500 mt-1">{errors.frecuenciaRiegoDias}</p>
              )}
            </div>

            {/* Temperatura Ideal */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Temp. Ideal (°C) *
              </label>
              <input
                type="number"
                name="temperaturaIdeal"
                min="5"
                max="45"
                value={formData.temperaturaIdeal}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
              />
              {touched.temperaturaIdeal && errors.temperaturaIdeal && (
                <p className="text-xs text-red-500 mt-1">{errors.temperaturaIdeal}</p>
              )}
            </div>

            {/* Estado Salud */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
                Estado Fitosanitario *
              </label>
              <select
                name="estadoSalud"
                value={formData.estadoSalud}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)]"
              >
                <option value="BUENO">Bueno (Óptimo)</option>
                <option value="EN_RIESGO">En Riesgo</option>
                <option value="CON_PROBLEMAS">Con Problemas</option>
              </select>
            </div>
          </div>

          {/* Requiere Sombra Checkbox */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="requiereSombra"
              name="requiereSombra"
              checked={formData.requiereSombra}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-[var(--color-arona-500)] focus:ring-[var(--color-arona-500)] cursor-pointer"
            />
            <label
              htmlFor="requiereSombra"
              className="text-sm text-gray-700 cursor-pointer font-medium"
            >
              Requiere mallas de sombra o protección solar especial
            </label>
          </div>

          {/* Observaciones */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Observaciones del Cultivo *
            </label>
            <textarea
              name="observaciones"
              rows="3"
              value={formData.observaciones}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Notas fenológicas, requerimientos nutricionales..."
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
                  {initialData ? 'Guardar Cambios' : 'Registrar Cultivo'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
