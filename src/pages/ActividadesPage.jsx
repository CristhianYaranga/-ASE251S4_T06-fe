import React, { useState } from 'react';
import { useActividades } from '../hooks/useActividades';
import { ActividadModal } from '../components/ActividadModal';
import { ConfirmModal } from '../components/ConfirmModal';

export function ActividadesPage() {
  const {
    actividades,
    campos,
    cultivos,
    isLoading,
    createActividad,
    updateActividad,
    deleteActividad,
    restoreActividad,
    getIcon,
    getColor,
    getNombreCampo,
    getNombreCultivo,
    formatFecha,
  } = useActividades();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);

  const [deletingActividad, setDeletingActividad] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const filteredActividades = actividades.filter((a) => {
    const term = searchTerm.toLowerCase();
    const campo = getNombreCampo(a.idCampo).toLowerCase();
    const obs = (a.observaciones || '').toLowerCase();
    const matchesTerm = !term || campo.includes(term) || obs.includes(term);
    const matchesTipo = !filterTipo || a.tipoActividad === filterTipo;

    return matchesTerm && matchesTipo;
  });

  const handleOpenCreate = () => {
    setEditingActividad(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (actividad) => {
    setEditingActividad(actividad);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (payload) => {
    try {
      if (editingActividad) {
        const id = editingActividad.id || editingActividad.idActividad;
        await updateActividad(id, payload);
      } else {
        await createActividad(payload);
      }
      setIsModalOpen(false);
      setEditingActividad(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingActividad) return;
    const id = deletingActividad.id || deletingActividad.idActividad;
    await deleteActividad(id);
    setIsDeleteOpen(false);
    setDeletingActividad(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Actividades y Labores de Campo
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Bitácora de riego, fertilización, poda y manejos fitotécnicos
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="arona-btn-primary shadow-lg shadow-emerald-700/20"
        >
          <span className="material-icons-outlined text-lg">add_circle</span>
          Nueva Actividad
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="arona-card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por campo u observación..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 cursor-pointer"
          >
            <option value="">Todas las labores</option>
            <option value="RIEGO">Riego</option>
            <option value="PODA">Poda</option>
            <option value="FUMIGACION">Fumigación</option>
            <option value="FERTILIZACION">Fertilización</option>
            <option value="OTRO">Otros mantenimientos</option>
          </select>
        </div>
      </div>

      {/* Actividades Table */}
      <div className="arona-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Labor</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Campo</th>
                <th className="py-3.5 px-4">Cultivo</th>
                <th className="py-3.5 px-4">Observaciones</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActividades.map((a) => {
                const id = a.id || a.idActividad;
                return (
                  <tr
                    key={id}
                    className={`hover:bg-emerald-50/30 transition-colors ${
                      a.estado === false ? 'opacity-60 bg-gray-50/50' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${getColor(
                            a.tipoActividad
                          )}`}
                        >
                          <span className="material-icons-outlined text-base">
                            {getIcon(a.tipoActividad)}
                          </span>
                        </span>
                        <strong className="font-bold text-gray-800">
                          {a.tipoActividad}
                        </strong>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-600 whitespace-nowrap">
                      {formatFecha(a.fecha)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {getNombreCampo(a.idCampo)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {getNombreCultivo(a.idCultivo) || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 max-w-xs truncate" title={a.observaciones}>
                      {a.observaciones || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`badge text-[10px] ${
                          a.estado !== false ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {a.estado !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(a)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border-none bg-transparent cursor-pointer"
                          title="Editar actividad"
                        >
                          <span className="material-icons-outlined text-base">
                            edit
                          </span>
                        </button>
                        {a.estado !== false ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingActividad(a);
                              setIsDeleteOpen(true);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer"
                            title="Eliminar actividad"
                          >
                            <span className="material-icons-outlined text-base">
                              delete_outline
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => restoreActividad(id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border-none bg-transparent cursor-pointer"
                            title="Restaurar actividad"
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
      {filteredActividades.length === 0 && !isLoading && (
        <div className="text-center py-16 arona-card">
          <span className="material-icons-outlined text-6xl text-gray-300">
            assignment
          </span>
          <p className="text-base font-semibold text-gray-700 mt-4">
            No se encontraron actividades registradas
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Comience anotando las faenas de riego y fertilización
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="arona-btn-primary mt-4"
          >
            Registrar Primera Actividad
          </button>
        </div>
      )}

      {/* Modal Actividad */}
      <ActividadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveModal}
        initialData={editingActividad}
        campos={campos}
        cultivos={cultivos}
        isLoading={isLoading}
      />

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="¿Eliminar Actividad de Campo?"
        message="Esta labor se marcará como inactiva. Podrá restaurarla si fue borrada involuntariamente."
        confirmText="Eliminar"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
