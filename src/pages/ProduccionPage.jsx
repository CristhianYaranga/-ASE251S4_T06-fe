import React, { useState } from 'react';
import { useCosechas } from '../hooks/useCosechas';
import { CosechaModal } from '../components/CosechaModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { ProduccionChart } from '../components/ProduccionChart';
import { kgToTonDisplay } from '../utils/produccionUtils';

export function ProduccionPage() {
  const {
    cosechas,
    campos,
    cultivos,
    usuarios,
    isLoading,
    createCosecha,
    updateCosecha,
    deleteCosecha,
    restoreCosecha,
    totalToneladas,
    cosechasActivas,
    getCampoNombre,
    getCultivoNombre,
    getUsuarioNombre,
  } = useCosechas();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampo, setFilterCampo] = useState('');
  const [filterCultivo, setFilterCultivo] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCosecha, setEditingCosecha] = useState(null);

  const [deletingCosecha, setDeletingCosecha] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const filteredCosechas = cosechas.filter((c) => {
    const term = searchTerm.toLowerCase();
    const campoName = getCampoNombre(c).toLowerCase();
    const cultivoName = getCultivoNombre(c).toLowerCase();
    const obs = (c.observaciones || '').toLowerCase();
    const matchesTerm = !term || campoName.includes(term) || cultivoName.includes(term) || obs.includes(term);

    const matchesCampo =
      !filterCampo ||
      String(c.idCampo || c.campo?.id || c.campo?.idCampo) === String(filterCampo);

    const matchesCultivo =
      !filterCultivo ||
      String(c.idCultivo || c.cultivo?.id || c.cultivo?.idCultivo) === String(filterCultivo);

    return matchesTerm && matchesCampo && matchesCultivo;
  });

  const handleOpenCreate = () => {
    setEditingCosecha(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cosecha) => {
    setEditingCosecha(cosecha);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (payload) => {
    try {
      if (editingCosecha) {
        const id = editingCosecha.id || editingCosecha.idCosecha;
        await updateCosecha(id, payload);
      } else {
        await createCosecha(payload);
      }
      setIsModalOpen(false);
      setEditingCosecha(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCosecha) return;
    const id = deletingCosecha.id || deletingCosecha.idCosecha;
    await deleteCosecha(id);
    setIsDeleteOpen(false);
    setDeletingCosecha(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Control de Producción y Cosechas
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Registro cuantitativo de pesaje y rendimiento agrícola
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="arona-btn-primary shadow-lg shadow-emerald-700/20"
        >
          <span className="material-icons-outlined text-lg">add_circle</span>
          Registrar Cosecha
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="arona-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[var(--color-arona-600)] flex items-center justify-center">
            <span className="material-icons-outlined text-xl">scale</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Total Cosechado
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {totalToneladas} <span className="text-sm font-medium text-gray-500">t</span>
            </p>
          </div>
        </div>

        <div className="arona-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <span className="material-icons-outlined text-xl">fact_check</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Registros Activos
            </p>
            <p className="text-2xl font-bold text-gray-800">{cosechasActivas}</p>
          </div>
        </div>

        <div className="arona-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <span className="material-icons-outlined text-xl">local_shipping</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">
              Cosechas Totales
            </p>
            <p className="text-2xl font-bold text-gray-800">{cosechas.length}</p>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="arona-card p-6">
        <h2 className="text-base font-bold text-gray-800 mb-1">
          Distribución Cosechada por Cultivo
        </h2>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          Comparativa de toneladas brutas recolectadas
        </p>
        <ProduccionChart data={cosechas} type="bar" />
      </div>

      {/* Filter Toolbar */}
      <div className="arona-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por lote, cultivo u observación..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={filterCampo}
            onChange={(e) => setFilterCampo(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 cursor-pointer"
          >
            <option value="">Todos los campos</option>
            {campos.map((c) => {
              const id = c.id || c.idCampo;
              return (
                <option key={id} value={id}>
                  {c.nombre}
                </option>
              );
            })}
          </select>

          <select
            value={filterCultivo}
            onChange={(e) => setFilterCultivo(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 cursor-pointer"
          >
            <option value="">Todos los cultivos</option>
            {cultivos.map((cv) => {
              const id = cv.id || cv.idCultivo;
              return (
                <option key={id} value={id}>
                  {cv.nombre}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Cosechas Table */}
      <div className="arona-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4"># Lote</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Campo</th>
                <th className="py-3.5 px-4">Cultivo</th>
                <th className="py-3.5 px-4">Cantidad</th>
                <th className="py-3.5 px-4">Jabas/Cajas</th>
                <th className="py-3.5 px-4">Registrado Por</th>
                <th className="py-3.5 px-4">Observaciones</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCosechas.map((c) => {
                const id = c.id || c.idCosecha;
                return (
                  <tr
                    key={id}
                    className={`hover:bg-emerald-50/30 transition-colors ${
                      c.estado === false ? 'opacity-60 bg-gray-50/50' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-gray-800">
                      #{id}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium whitespace-nowrap">
                      {c.fecha}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                      {getCampoNombre(c)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--color-arona-600)]">
                      {getCultivoNombre(c)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-gray-800">
                      {kgToTonDisplay(c.cantidadKg)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {c.cantidadUnidades ? `${c.cantidadUnidades} u` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {getUsuarioNombre(c)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 max-w-[200px] truncate" title={c.observaciones}>
                      {c.observaciones || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`badge text-[10px] ${
                          c.estado !== false ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {c.estado !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border-none bg-transparent cursor-pointer"
                          title="Editar registro"
                        >
                          <span className="material-icons-outlined text-base">
                            edit
                          </span>
                        </button>
                        {c.estado !== false ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingCosecha(c);
                              setIsDeleteOpen(true);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer"
                            title="Eliminar registro"
                          >
                            <span className="material-icons-outlined text-base">
                              delete_outline
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => restoreCosecha(id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border-none bg-transparent cursor-pointer"
                            title="Restaurar registro"
                          >
                            <span className="material-icons-outlined text-base">
                              restore_from_trash
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredCosechas.length === 0 && !isLoading && (
        <div className="text-center py-16 arona-card">
          <span className="material-icons-outlined text-6xl text-gray-300">
            inventory_2
          </span>
          <p className="text-base font-semibold text-gray-700 mt-4">
            No se encontraron registros de cosecha
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Comience registrando el peso de las jabas y lotes cosechados
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="arona-btn-primary mt-4"
          >
            Registrar Primera Cosecha
          </button>
        </div>
      )}

      {/* Modal Cosecha */}
      <CosechaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveModal}
        initialData={editingCosecha}
        campos={campos}
        cultivos={cultivos}
        isLoading={isLoading}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title={`¿Eliminar Cosecha #${deletingCosecha?.id || deletingCosecha?.idCosecha}?`}
        message="Esta acción marcará la cosecha como inactiva. Podrá restaurarla si fue eliminada por error."
        confirmText="Eliminar"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
