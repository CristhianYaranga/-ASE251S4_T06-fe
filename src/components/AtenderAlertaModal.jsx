import React, { useState } from 'react';

export function AtenderAlertaModal({
  isOpen,
  onClose,
  onSubmit,
  alerta = null,
  isLoading = false,
}) {
  const [solucion, setSolucion] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !alerta) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!solucion.trim()) {
      setError('Ingrese una solución o tratamiento aplicado');
      return;
    }
    const id = alerta.id || alerta.idAlerta;
    onSubmit(id, solucion.trim());
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 animate-scale-in border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[var(--color-arona-600)] flex items-center justify-center shrink-0">
            <span className="material-icons-outlined text-xl">healing</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              Atender Alerta #{alerta.id || alerta.idAlerta}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              {alerta.campo?.nombre || 'Lote'} · {alerta.tipoProblema}
            </p>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 mb-4 border border-gray-100">
          <strong className="block font-semibold text-gray-800 mb-0.5">
            Problema Reportado:
          </strong>
          {alerta.descripcionProblema}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 block mb-1">
              Tratamiento / Solución Aplicada *
            </label>
            <textarea
              rows="4"
              value={solucion}
              onChange={(e) => {
                setSolucion(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej: Se realizó fumigación con producto X en dosis 1.5 L/ha, supervisado por técnico agrónomo..."
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all resize-none ${
                error
                  ? 'border-red-400'
                  : 'border-gray-200 focus:border-[var(--color-arona-500)]'
              }`}
            />
            {error && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <span className="material-icons-outlined text-xs">error</span>{' '}
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
                    task_alt
                  </span>
                  Marcar Atendida
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
