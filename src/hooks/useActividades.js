import { useState, useEffect, useCallback } from 'react';
import { actividadesApi } from '../api/actividadesApi';
import { camposApi } from '../api/camposApi';
import { cultivosApi } from '../api/cultivosApi';
import { useToast } from '../context/ToastContext';

const actividadIconMap = {
  RIEGO: 'water_drop',
  PODA: 'content_cut',
  FUMIGACION: 'science',
  FERTILIZACION: 'eco',
  OTRO: 'handyman',
};

const actividadColorMap = {
  RIEGO: 'bg-blue-100 text-blue-600',
  PODA: 'bg-emerald-100 text-emerald-600',
  FUMIGACION: 'bg-purple-100 text-purple-600',
  FERTILIZACION: 'bg-amber-100 text-amber-600',
  OTRO: 'bg-gray-100 text-gray-600',
};

export function useActividades() {
  const [actividades, setActividades] = useState([]);
  const [campos, setCampos] = useState([]);
  const [cultivos, setCultivos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [actividadesData, camposData, cultivosData] = await Promise.all([
        actividadesApi.getAll(),
        camposApi.getActivos().catch(() => []),
        cultivosApi.getActivos().catch(() => []),
      ]);
      setActividades(actividadesData);
      setCampos(camposData);
      setCultivos(cultivosData);
    } catch {
      toast.error('Error al cargar actividades');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getNombreCampo = (idCampo) => {
    if (!idCampo) return '—';
    const found = campos.find((c) => (c.id || String(c.idCampo)) === String(idCampo));
    return found?.nombre ?? `Campo #${idCampo}`;
  };

  const getNombreCultivo = (idCultivo) => {
    if (!idCultivo) return '';
    const found = cultivos.find((c) => (c.id || String(c.idCultivo)) === String(idCultivo));
    return found?.nombre ?? `Cultivo #${idCultivo}`;
  };

  const createActividad = async (payload) => {
    setIsLoading(true);
    try {
      const created = await actividadesApi.create(payload);
      toast.success('Actividad registrada exitosamente');
      await loadData();
      return created;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar actividad');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateActividad = async (id, payload) => {
    setIsLoading(true);
    try {
      const updated = await actividadesApi.update(id, payload);
      toast.success('Actividad actualizada exitosamente');
      await loadData();
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar actividad');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteActividad = async (id) => {
    try {
      await actividadesApi.eliminar(id);
      toast.success('Actividad eliminada');
      await loadData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const restoreActividad = async (id) => {
    try {
      await actividadesApi.restaurar(id);
      toast.success('Actividad restaurada');
      await loadData();
    } catch {
      toast.error('Error al restaurar');
    }
  };

  const getIcon = (tipo) => actividadIconMap[tipo] ?? 'handyman';
  const getColor = (tipo) => actividadColorMap[tipo] ?? 'bg-gray-100 text-gray-600';

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    if (fecha.includes('/')) return fecha;
    try {
      const d = new Date(fecha);
      if (isNaN(d.getTime())) return fecha;
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return fecha;
    }
  };

  return {
    actividades,
    campos,
    cultivos,
    isLoading,
    loadData,
    createActividad,
    updateActividad,
    getNombreCampo,
    getNombreCultivo,
    deleteActividad,
    restoreActividad,
    getIcon,
    getColor,
    formatFecha,
  };
}
