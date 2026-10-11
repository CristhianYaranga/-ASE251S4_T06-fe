import React, { useState } from 'react';
import { useCultivos } from '../hooks/useCultivos';
import { CultivoModal } from '../components/CultivoModal';
import { ConfirmModal } from '../components/ConfirmModal';

export function CultivosPage() {
  const {
    cultivos,
    campos,
    isLoading,
    createCultivo,
    updateCultivo,
    deleteCultivo,
    restoreCultivo,
    getCampoNombre,
    getSaludClass,
    getSaludIcon,
  } = useCultivos();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterSalud, setFilterSalud] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCultivo, setEditingCultivo] = useState(null);

  const [deletingCultivo, setDeletingCultivo] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const filteredCultivos = cultivos.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      !term ||
      c.nombre?.toLowerCase().includes(term) ||
      c.tipoCultivo?.toLowerCase().includes(term) ||
      getCampoNombre(c).toLowerCase().includes(term);

    const matchesTipo = !filterTipo || c.tipoCultivo === filterTipo;
    const matchesSalud = !filterSalud || c.estadoSalud === filterSalud;

    return matchesTerm && matchesTipo && matchesSalud;
  });

  const handleOpenCreate = () => {
    setEditingCultivo(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cultivo) => {
    setEditingCultivo(cultivo);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (payload) => {
    try {
      if (editingCultivo) {
        const id = editingCultivo.id || editingCultivo.idCultivo;
        await updateCultivo(id, payload);
      } else {
        await createCultivo(payload);
      }
      setIsModalOpen(false);
      setEditingCultivo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCultivo) return;
    const id = deletingCultivo.id || deletingCultivo.idCultivo;
    await deleteCultivo(id);
    setIsDeleteOpen(false);
    setDeletingCultivo(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Gestión de Cultivos y Variedades
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Parámetros fenológicos, necesidades hídricas y monitoreo fitosanitario
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="arona-btn-primary shadow-lg shadow-emerald-700/20"
        >
          <span className="material-icons-outlined text-lg">add_circle</span>
          Nuevo Cultivo
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
            placeholder="Buscar variedad o campo..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 cursor-pointer"
          >
            <option value="">Todos los tipos</option>
            <option value="MANDARINA">Mandarinas</option>
            <option value="PALTA">Paltas</option>
            <option value="ARANDANO">Arándanos</option>
            <option value="CAQUI">Caquis</option>
            <option value="UVA">Uvas</option>
          </select>

          <select
            value={filterSalud}
            onChange={(e) => setFilterSalud(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-arona-500)]/20 cursor-pointer"
          >
            <option value="">Cualquier estado</option>
            <option value="BUENO">Bueno (Óptimo)</option>
            <option value="EN_RIESGO">En Riesgo</option>
            <option value="CON_PROBLEMAS">Con Problemas</option>
          </select>
        </div>
      </div>

      {/* Cultivos Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCultivos.map((cultivo) => {
          const id = cultivo.id || cultivo.idCultivo;
          return (
            <div
              key={id}
              className={`arona-card p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${
                cultivo.estado === false ? 'opacity-65 bg-gray-50/50' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[var(--color-arona-600)] flex items-center justify-center shrink-0">
                      <span className="material-icons-outlined text-xl">
                        local_florist
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800 leading-tight">
                        {cultivo.nombre}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        {getCampoNombre(cultivo)}
                      </p>
                    </div>
                  </div>

                  <span className={`badge text-[10px] ${getSaludClass(cultivo.estadoSalud)} flex items-center gap-1`}>
                    <span className="material-icons-outlined text-xs">
                      {getSaludIcon(cultivo.estadoSalud)}
                    </span>
                    {cultivo.estadoSalud}
                  </span>
                </div>

                <div className="space-y-1.5 py-3 border-y border-gray-100 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span className="text-gray-400 font-medium">Tipo:</span>
                    <strong className="text-gray-800 uppercase font-semibold">
                      {cultivo.tipoCultivo}
                    </strong>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="text-gray-400 font-medium">Riego cada:</span>
                    <span className="text-gray-800">
                      {cultivo.frecuenciaRiegoDias} días
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="text-gray-400 font-medium">Temp. Ideal:</span>
                    <span className="text-gray-800">
                      {cultivo.temperaturaIdeal ?? 20}°C
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="text-gray-400 font-medium">Siembra:</span>
                    <span className="text-gray-800">
                      {cultivo.fechaSiembra || '—'}
                    </span>
                  </div>
                  {cultivo.requiereSombra && (
                    <div className="flex justify-between text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg mt-1 font-medium">
                      <span>Mallas de sombra:</span>
                      <span>Requeridas</span>
                    </div>
                  )}
                </div>

                {cultivo.observaciones && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">
                    "{cultivo.observaciones}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                <span
                  className={`text-[11px] font-semibold ${
                    cultivo.estado !== false ? 'text-emerald-700' : 'text-gray-400'
                  }`}
                >
                  {cultivo.estado !== false ? 'Activo' : 'Inactivo'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(cultivo)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border-none bg-transparent cursor-pointer"
                    title="Editar cultivo"
                  >
                    <span className="material-icons-outlined text-base">edit</span>
                  </button>
                  {cultivo.estado !== false ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingCultivo(cultivo);
                        setIsDeleteOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
                      title="Eliminar cultivo"
                    >
                      <span className="material-icons-outlined text-base">
                        delete_outline
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => restoreCultivo(id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all border-none bg-transparent cursor-pointer"
                      title="Restaurar cultivo"
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
      {filteredCultivos.length === 0 && !isLoading && (
        <div className="text-center py-16 arona-card">
          <span className="material-icons-outlined text-6xl text-gray-300">
            local_florist
          </span>
          <p className="text-base font-semibold text-gray-700 mt-4">
            No se encontraron cultivos
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Registre los cultivos y variedades sembradas en sus campos
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="arona-btn-primary mt-4"
          >
            Registrar Primer Cultivo
          </button>
        </div>
      )}

      {/* Modal Cultivo */}
      <CultivoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveModal}
        initialData={editingCultivo}
        campos={campos}
        isLoading={isLoading}
      />

      {/* Modal Confirm Delete */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title={`¿Eliminar Cultivo "${deletingCultivo?.nombre}"?`}
        message="Esta acción marcará el cultivo como inactivo en el sistema. Podrá restaurarlo posteriormente."
        confirmText="Eliminar"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
