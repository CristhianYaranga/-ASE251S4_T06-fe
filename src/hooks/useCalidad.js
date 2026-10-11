import { useState, useEffect, useCallback, useMemo } from 'react';
import { calidadApi } from '../api/calidadApi';
import { cosechasApi } from '../api/cosechasApi';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';

export function useCalidad() {
  const [revisiones, setRevisiones] = useState([]);
  const [cosechas, setCosechas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [revisionesData, cosechasData, usuariosData] = await Promise.all([
        calidadApi.getAll(),
        cosechasApi.getAll().catch(() => []),
        authApi.getAllUsuarios().catch(() => []),
      ]);
      setRevisiones(revisionesData);
      setCosechas(cosechasData);
      setUsuarios(usuariosData);
    } catch {
      toast.error('Error al cargar revisiones de calidad');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalAprobadas = useMemo(
    () => revisiones.filter((r) => r.cumpleRequisitos).length,
    [revisiones]
  );
  const totalRechazadas = useMemo(
    () => revisiones.filter((r) => !r.cumpleRequisitos).length,
    [revisiones]
  );
  const tasaAprobacion = useMemo(() => {
    return revisiones.length
      ? ((totalAprobadas / revisiones.length) * 100).toFixed(1)
      : '0';
  }, [revisiones, totalAprobadas]);

  const notificacionesPendientes = useMemo(() => {
    return revisiones.filter((r) => r.notificado && !r.cumpleRequisitos).length;
  }, [revisiones]);

  const getCosechaDisplay = (rev) => {
    const cId = rev.idCosecha ?? rev.cosecha?.idCosecha ?? rev.cosecha?.id;
    if (cId == null) return '—';
    const c = cosechas.find((x) => String(x.id || x.idCosecha) === String(cId));
    if (c) {
      const cultivo = c.cultivo?.nombre || c.idCultivo || 'Cultivo';
      const campo = c.campo?.nombre || c.idCampo || 'Campo';
      return `#${cId} · ${cultivo} – ${campo}`;
    }
    return `Cosecha #${cId}`;
  };

  const getSupervisorDisplay = (rev) => {
    const sId =
      rev.idUsuarioSupervisor ??
      rev.idSupervisor ??
      rev.supervisor?.idUsuario ??
      rev.supervisor?.id;
    if (!sId) return rev.supervisor?.nombreCompleto || '—';
    const u = usuarios.find((x) => String(x.id || x.idUsuario) === String(sId));
    return u
      ? u.nombreCompleto || `${u.nombres || ''} ${u.apellidos || ''}`.trim()
      : rev.supervisor?.nombreCompleto || `Usuario #${sId}`;
  };

  const createRevision = async (payload) => {
    setIsLoading(true);
    try {
      const created = await calidadApi.create(payload);
      toast.success('Revisión registrada');
      await loadData();
      return created;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar revisión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRevision = async (id, payload) => {
    setIsLoading(true);
    try {
      const updated = await calidadApi.update(id, payload);
      toast.success('Revisión actualizada');
      await loadData();
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar revisión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRevision = async (id) => {
    try {
      await calidadApi.eliminar(id);
      toast.success('Revisión eliminada');
      await loadData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const restoreRevision = async (id) => {
    try {
      await calidadApi.restaurar(id);
      toast.success('Revisión restaurada');
      await loadData();
    } catch {
      toast.error('Error al restaurar');
    }
  };

  return {
    revisiones,
    cosechas,
    usuarios,
    isLoading,
    totalAprobadas,
    totalRechazadas,
    tasaAprobacion,
    notificacionesPendientes,
    loadData,
    createRevision,
    updateRevision,
    getCosechaDisplay,
    getSupervisorDisplay,
    deleteRevision,
    restoreRevision,
  };
}
