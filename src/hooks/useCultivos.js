import { useState, useEffect, useCallback, useMemo } from 'react';
import { cultivosApi } from '../api/cultivosApi';
import { camposApi } from '../api/camposApi';
import { useToast } from '../context/ToastContext';

export function useCultivos() {
  const [cultivos, setCultivos] = useState([]);
  const [campos, setCampos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cultivosData, camposData] = await Promise.all([
        cultivosApi.getAll(),
        camposApi.getActivos().catch(() => []),
      ]);
      setCultivos(cultivosData);
      setCampos(camposData);
    } catch {
      toast.error('Error al cargar cultivos');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCultivos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return cultivos.filter(
      (c) =>
        !term ||
        c.nombre?.toLowerCase().includes(term) ||
        c.tipoCultivo?.toLowerCase().includes(term)
    );
  }, [cultivos, searchTerm]);

  const getCampoNombre = (cultivo) => {
    const cid =
      cultivo?.campoId ||
      cultivo?.idCampo ||
      cultivo?.campo?.id ||
      (cultivo?.campo?.idCampo != null ? String(cultivo.campo.idCampo) : '');
    if (!cid) return cultivo?.campo?.nombre ?? 'Sin campo asignado';
    const found = campos.find((c) => (c.id || String(c.idCampo)) === String(cid));
    return found?.nombre ?? cultivo?.campo?.nombre ?? 'Sin campo asignado';
  };

  const createCultivo = async (payload) => {
    setIsLoading(true);
    try {
      const created = await cultivosApi.create(payload);
      toast.success('Cultivo registrado');
      await loadData();
      return created;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar cultivo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCultivo = async (id, payload) => {
    setIsLoading(true);
    try {
      const updated = await cultivosApi.update(id, payload);
      toast.success('Cultivo actualizado');
      await loadData();
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar cultivo');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCultivo = async (id) => {
    try {
      await cultivosApi.eliminar(id);
      toast.success('Cultivo eliminado');
      await loadData();
    } catch {
      toast.error('Error al eliminar cultivo');
    }
  };

  const restoreCultivo = async (id) => {
    try {
      await cultivosApi.restaurar(id);
      toast.success('Cultivo restaurado');
      await loadData();
    } catch {
      toast.error('Error al restaurar cultivo');
    }
  };

  const getSaludClass = (salud) => {
    switch (salud) {
      case 'BUENO':
        return 'badge-success';
      case 'EN_RIESGO':
        return 'badge-warning';
      case 'CON_PROBLEMAS':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  const getSaludIcon = (salud) => {
    switch (salud) {
      case 'BUENO':
        return 'check_circle';
      case 'EN_RIESGO':
        return 'warning_amber';
      case 'CON_PROBLEMAS':
        return 'error';
      default:
        return 'help_outline';
    }
  };

  return {
    cultivos,
    campos,
    filteredCultivos,
    searchTerm,
    setSearchTerm,
    isLoading,
    loadData,
    createCultivo,
    updateCultivo,
    getCampoNombre,
    deleteCultivo,
    restoreCultivo,
    getSaludClass,
    getSaludIcon,
  };
}
