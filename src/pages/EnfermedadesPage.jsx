import React, { useState } from 'react';
import { useAlertas } from '../hooks/useAlertas';
import { AlertaModal } from '../components/AlertaModal';
import { AtenderAlertaModal } from '../components/AtenderAlertaModal';
import { ConfirmModal } from '../components/ConfirmModal';

export function EnfermedadesPage() {
  const {
    alertas,
    campos,
    cultivos,
    isLoading,
    createAlerta,
    updateAlerta,
    deleteAlerta,
    restoreAlerta,
    atenderAlerta,
    alertasPendientes,
    getSeverityClass,
    getIcon,
  } = useAlertas();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterAtendida, setFilterAtendida] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlerta, setEditingAlerta] = useState(null);

  const [atenderTarget, setAtenderTarget] = useState(null);
  const [isAtenderOpen, setIsAtenderOpen] = useState(false);

  const [deletingAlerta, setDeletingAlerta] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedAlerta, setSelectedAlerta] = useState(null);

  const filteredAlertas = alertas.filter((a) => {
    const term = searchTerm.toLowerCase();
    const campo = (a.campo?.nombre || `Campo #${a.idCampo}`).toLowerCase();
    const desc = (a.descripcionProblema || '').toLowerCase();
    const sol = (a.solucionAplicada || '').toLowerCase();
    const matchesTerm = !term || campo.includes(term) || desc.includes(term) || sol.includes(term);

    const matchesTipo = !filterTipo || a.tipoProblema === filterTipo;

    const isAtendida = a.atendida === true || a.solucionAplicada != null;
    const matchesAtendida =
      filterAtendida === 'ALL'
        ? true
        : filterAtendida === 'PENDIENTE'
        ? !isAtendida
        : isAtendida;

    return matchesTerm && matchesTipo && matchesAtendida;
  });

  const handleOpenCreate = () => {
    setEditingAlerta(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (alerta) => {
    setEditingAlerta(alerta);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (payload) => {
    try {
      if (editingAlerta) {
        const id = editingAlerta.id || editingAlerta.idAlerta;
        await updateAlerta(id, payload);
      } else {
        await createAlerta(payload);
      }
      setIsModalOpen(false);
      setEditingAlerta(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAtender = (alerta) => {
    setAtenderTarget(alerta);
    setIsAtenderOpen(true);
  };

  const handleConfirmAtender = async (id, solucion) => {
    await atenderAlerta(id, solucion);
    setIsAtenderOpen(false);
    setAtenderTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAlerta) return;
    const id = deletingAlerta.id || deletingAlerta.idAlerta;
    await deleteAlerta(id);
    setIsDeleteOpen(false);
    setDeletingAlerta(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Control de Plagas y Enfermedades
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Monitoreo fitosanitario, alertas tempranas y aplicación de tratamientos
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="arona-btn-primary shadow-lg shadow-emerald-700/20"
        >
          <span className="material-icons-outlined text-lg">campaign</span>
          Reportar Alerta
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="arona-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <span className="material-icons-outlined text-xl">warning_amber</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Alertas Pendientes
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {alertasPendientes.length}
            </p>
          </div>
        </div>

        <div className="arona-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <span className="material-icons-outlined text-xl">task_alt</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Casos Atendidos
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {alertas.length - alertasPendientes.length}
            </p>
          </div>
        </div>

        <div className="arona-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <span className="material-icons-outlined text-xl">bug_report</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Total Reportes
            </p>
            <p className="text-2xl font-bold text-gray-800">{alertas.length}</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="arona-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por lote o síntoma..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 cursor-pointer"
          >
            <option value="">Todos los problemas</option>
            <option value="ENFERMEDAD">Enfermedades</option>
            <option value="PLAGA">Plagas</option>
            <option value="OTRO">Otros problemas</option>
          </select>

          <select
            value={filterAtendida}
            onChange={(e) => setFilterAtendida(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 cursor-pointer"
          >
            <option value="ALL">Pendientes y Atendidas</option>
            <option value="PENDIENTE">Solo Pendientes</option>
            <option value="ATENDIDA">Solo Atendidas</option>
          </select>
        </div>
      </div>

      {/* Alertas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAlertas.map((a) => {
          const id = a.id || a.idAlerta;
          const isAtendida = a.atendida === true || Boolean(a.solucionAplicada);
          return (
            <div
              key={id}
              className={`arona-card p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${
                !isAtendida
                  ? 'border-l-4 border-l-amber-500'
                  : 'border-l-4 border-l-emerald-500'
              } ${a.estado === false ? 'opacity-60 bg-gray-50/50' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{getIcon(a.tipoProblema)}</span>
                    <div>
                      <h3 className="text-base font-bold text-gray-800 leading-tight">
                        {a.campo?.nombre || `Campo #${a.idCampo}`}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        {a.cultivo?.nombre || 'Todo el lote'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`badge text-[10px] ${
                      isAtendida ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {isAtendida ? 'Atendida' : 'Pendiente'}
                  </span>
                </div>

                <div className="space-y-1 py-2 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="material-icons-outlined text-sm">
                      calendar_today
                    </span>
                    <span>Detección: {a.fechaDeteccion}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <span className="material-icons-outlined text-sm">
                      category
                    </span>
                    <span className="font-semibold text-gray-700">
                      {a.tipoProblema}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 mt-2">
                  <strong className="block text-[11px] text-gray-500 uppercase font-semibold mb-0.5">
                    Problema:
                  </strong>
                  <p className="line-clamp-2 leading-relaxed">
                    {a.descripcionProblema}
                  </p>
                </div>

                {a.solucionAplicada && (
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900 mt-2">
                    <strong className="block text-[11px] text-emerald-700 uppercase font-semibold mb-0.5">
                      Tratamiento Aplicado:
                    </strong>
                    <p className="line-clamp-2 leading-relaxed">
                      {a.solucionAplicada}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-gray-100">
                {!isAtendida ? (
                  <button
                    type="button"
                    onClick={() => handleOpenAtender(a)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span className="material-icons-outlined text-sm">healing</span>
                    Atender
                  </button>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="material-icons-outlined text-sm">
                      check_circle
                    </span>
                    Resuelto
                  </span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(a)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border-none bg-transparent cursor-pointer"
                    title="Editar alerta"
                  >
                    <span className="material-icons-outlined text-base">edit</span>
                  </button>
                  {a.estado !== false ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingAlerta(a);
                        setIsDeleteOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
                      title="Eliminar reporte"
                    >
                      <span className="material-icons-outlined text-base">
                        delete_outline
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => restoreAlerta(id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border-none bg-transparent cursor-pointer"
                      title="Restaurar reporte"
                    >
                      <span className="material-icons-outlined text-base">
                        restore_from_trash
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAlertas.length === 0 && !isLoading && (
        <div className="text-center py-16 arona-card">
          <span className="material-icons-outlined text-6xl text-gray-300">
            health_and_safety
          </span>
          <p className="text-base font-semibold text-gray-700 mt-4">
            No se encontraron alertas fitosanitarias
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Los campos evaluados se encuentran saludables
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="arona-btn-primary mt-4"
          >
            Reportar Nueva Incidencia
          </button>
        </div>
      )}

      {/* Alerta Modal */}
      <AlertaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveModal}
        initialData={editingAlerta}
        campos={campos}
        cultivos={cultivos}
        isLoading={isLoading}
      />

      {/* Atender Modal */}
      <AtenderAlertaModal
        isOpen={isAtenderOpen}
        onClose={() => setIsAtenderOpen(false)}
        onSubmit={handleConfirmAtender}
        alerta={atenderTarget}
        isLoading={isLoading}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="¿Eliminar Alerta Fitosanitaria?"
        message="Esta alerta se marcará como inactiva. Podrá restaurarla si fue dada de baja por error."
        confirmText="Eliminar"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
