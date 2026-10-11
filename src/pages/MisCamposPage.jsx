import React, { useState } from 'react';
import { useCampos } from '../hooks/useCampos';
import { CampoModal } from '../components/CampoModal';
import { ConfirmModal } from '../components/ConfirmModal';

export function MisCamposPage() {
  const {
    campos,
    isLoading,
    createCampo,
    updateCampo,
    deleteCampo,
    restoreCampo,
    totalHectareas,
    camposActivos,
  } = useCampos();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampo, setEditingCampo] = useState(null);

  const [deletingCampo, setDeletingCampo] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [detailCampo, setDetailCampo] = useState(null);

  const filteredCampos = campos.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      !term ||
      c.nombre?.toLowerCase().includes(term) ||
      c.zona?.toLowerCase().includes(term) ||
      c.responsable?.toLowerCase().includes(term) ||
      c.ubicacion?.toLowerCase().includes(term);

    const matchesEstado =
      filterEstado === 'ALL'
        ? true
        : filterEstado === 'ACTIVE'
        ? c.estado === true
        : c.estado === false;

    return matchesTerm && matchesEstado;
  });

  const handleOpenCreate = () => {
    setEditingCampo(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (campo) => {
    setEditingCampo(campo);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (payload) => {
    try {
      if (editingCampo) {
        const id = editingCampo.id || editingCampo.idCampo;
        await updateCampo(id, payload);
      } else {
        await createCampo(payload);
      }
      setIsModalOpen(false);
      setEditingCampo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleEstado = async (campo) => {
    const id = campo.id || campo.idCampo;
    if (campo.estado) {
      await deleteCampo(id);
    } else {
      await restoreCampo(id);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCampo) return;
    const id = deletingCampo.id || deletingCampo.idCampo;
    await deleteCampo(id);
    setIsDeleteOpen(false);
    setDeletingCampo(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Mis Campos y Lotes
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Administración agronómica y zonificación de parcelas productivas
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="arona-btn-primary shadow-lg shadow-emerald-700/20"
        >
          <span className="material-icons-outlined text-lg">add_circle</span>
          Nuevo Campo
        </button>
      </div>

      {/* KPI Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="arona-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[var(--color-arona-600)] flex items-center justify-center">
            <span className="material-icons-outlined text-xl">landscape</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Total Lotes</p>
            <p className="text-2xl font-bold text-gray-800">{campos.length}</p>
          </div>
        </div>

        <div className="arona-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
            <span className="material-icons-outlined text-xl">check_circle</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Lotes Activos</p>
            <p className="text-2xl font-bold text-gray-800">{camposActivos}</p>
          </div>
        </div>

        <div className="arona-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <span className="material-icons-outlined text-xl">straighten</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-gray-500">Extensión Total</p>
            <p className="text-2xl font-bold text-gray-800">{totalHectareas} ha</p>
          </div>
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="arona-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, zona o responsable..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 focus:border-[var(--color-arona-500)] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 cursor-pointer"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Solo Activos</option>
            <option value="INACTIVE">Solo Inactivos</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[var(--color-arona-600)] shadow-xs'
                  : 'text-gray-400 hover:text-gray-600 bg-transparent'
              }`}
            >
              <span className="material-icons-outlined text-base">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[var(--color-arona-600)] shadow-xs'
                  : 'text-gray-400 hover:text-gray-600 bg-transparent'
              }`}
            >
              <span className="material-icons-outlined text-base">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampos.map((campo) => {
            const id = campo.id || campo.idCampo;
            return (
              <div
                key={id}
                className={`arona-card p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${
                  !campo.estado ? 'opacity-70 bg-gray-50/50' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[var(--color-arona-600)] flex items-center justify-center shrink-0">
                        <span className="material-icons-outlined text-xl">
                          landscape
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-800 leading-tight">
                          {campo.nombre}
                        </h3>
                        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                          {campo.zona || 'Zona no especificada'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`badge text-[11px] ${
                        campo.estado ? 'badge-success' : 'badge-danger'
                      }`}
                    >
                      {campo.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="space-y-1.5 py-3 border-y border-gray-100 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400 font-medium">Extensión:</span>
                      <strong className="text-gray-800">
                        {campo.hectareas || campo.areaHectareas} ha
                      </strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400 font-medium">Responsable:</span>
                      <span className="text-gray-800 truncate max-w-[150px]">
                        {campo.responsable || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400 font-medium">Riego:</span>
                      <span className="text-gray-800">{campo.sistemaRiego || '—'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span className="text-gray-400 font-medium">Tipo Suelo:</span>
                      <span className="text-gray-800">{campo.tipoSuelo || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setDetailCampo(campo)}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-transparent border-none cursor-pointer flex items-center gap-1 p-0"
                  >
                    <span className="material-icons-outlined text-base">
                      visibility
                    </span>
                    Ver Detalle
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(campo)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all border-none bg-transparent cursor-pointer"
                      title="Editar campo"
                    >
                      <span className="material-icons-outlined text-base">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleEstado(campo)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border-none bg-transparent cursor-pointer ${
                        campo.estado
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={campo.estado ? 'Desactivar lote' : 'Restaurar lote'}
                    >
                      <span className="material-icons-outlined text-base">
                        {campo.estado ? 'delete_outline' : 'restore_from_trash'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="arona-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Campo</th>
                  <th className="py-3.5 px-4">Responsable</th>
                  <th className="py-3.5 px-4">Ubicación</th>
                  <th className="py-3.5 px-4">Hectáreas</th>
                  <th className="py-3.5 px-4">Tipo Suelo</th>
                  <th className="py-3.5 px-4">Zona</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCampos.map((campo) => {
                  const id = campo.id || campo.idCampo;
                  return (
                    <tr
                      key={id}
                      className={`hover:bg-emerald-50/30 transition-colors ${
                        !campo.estado ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-gray-800 flex items-center gap-2">
                        <span className="material-icons-outlined text-emerald-600 text-base">
                          landscape
                        </span>
                        {campo.nombre}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {campo.responsable || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {campo.ubicacion || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-700">
                        {campo.hectareas || campo.areaHectareas} ha
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {campo.tipoSuelo || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {campo.zona || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`badge text-[10px] ${
                            campo.estado ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {campo.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailCampo(campo)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-sky-600 hover:bg-sky-50 border-none bg-transparent cursor-pointer"
                          >
                            <span className="material-icons-outlined text-base">
                              visibility
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(campo)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border-none bg-transparent cursor-pointer"
                          >
                            <span className="material-icons-outlined text-base">
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleEstado(campo)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border-none bg-transparent cursor-pointer ${
                              campo.estado
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <span className="material-icons-outlined text-base">
                              {campo.estado ? 'delete_outline' : 'restore_from_trash'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCampos.length === 0 && !isLoading && (
        <div className="text-center py-16 arona-card">
          <span className="material-icons-outlined text-6xl text-gray-300">
            landscape
          </span>
          <p className="text-base font-semibold text-gray-700 mt-4">
            No se encontraron campos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Intente con otro filtro o registre un nuevo campo agrícola
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="arona-btn-primary mt-4"
          >
            Registrar Primer Campo
          </button>
        </div>
      )}

      {/* Modal Crear / Editar */}
      <CampoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveModal}
        initialData={editingCampo}
        isLoading={isLoading}
      />

      {/* Detail Panel Modal */}
      {detailCampo && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          onClick={() => setDetailCampo(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-32 bg-gradient-to-r from-emerald-700 to-green-600 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setDetailCampo(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center border-none cursor-pointer"
              >
                <span className="material-icons-outlined text-sm">close</span>
              </button>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                Ficha Agronómica
              </span>
              <h2 className="text-2xl font-black mt-1">{detailCampo.nombre}</h2>
              <p className="text-xs text-emerald-100">
                {detailCampo.ubicacion || 'Sin ubicación geográfica'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <p className="text-gray-400 font-semibold uppercase">Extensión</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {detailCampo.hectareas || detailCampo.areaHectareas} ha
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <p className="text-gray-400 font-semibold uppercase">Zona</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {detailCampo.zona || '—'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <p className="text-gray-400 font-semibold uppercase">Responsable</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {detailCampo.responsable || '—'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <p className="text-gray-400 font-semibold uppercase">Riego</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {detailCampo.sistemaRiego || '—'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl col-span-2">
                  <p className="text-gray-400 font-semibold uppercase">Tipo de Suelo</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    {detailCampo.tipoSuelo || '—'}
                  </p>
                </div>
              </div>

              {detailCampo.observaciones && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs">
                  <p className="font-semibold text-emerald-900 mb-1">
                    Observaciones:
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    {detailCampo.observaciones}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = detailCampo;
                    setDetailCampo(null);
                    handleOpenEdit(c);
                  }}
                  className="arona-btn-primary flex-1 justify-center"
                >
                  <span className="material-icons-outlined text-base">edit</span>
                  Editar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soft-delete confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="¿Eliminar o desactivar campo?"
        message={`Esta acción marcará como inactivo el campo "${deletingCampo?.nombre}". Podrá reactivarlo en cualquier momento.`}
        confirmText="Desactivar"
        type="warning"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
