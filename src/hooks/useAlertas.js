import { useState, useEffect, useCallback, useMemo } from 'react';
import { alertasApi } from '../api/alertasApi';
import { camposApi } from '../api/camposApi';
import { cultivosApi } from '../api/cultivosApi';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';

export function useAlertas() {
  const [alertas, setAlertas] = useState([]);
  const [campos, setCampos] = useState([]);
  const [cultivos, setCultivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { refresh: refreshNotifs } = useNotifications();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [alertasData, camposData, cultivosData, usuariosData] = await Promise.all([
        alertasApi.getAll(),
        camposApi.getActivos().catch(() => []),
        cultivosApi.getActivos().catch(() => []),
        authApi.getAllUsuarios().catch(() => []),
      ]);
      setAlertas(alertasData);
      setCampos(camposData);
      setCultivos(cultivosData);
      setUsuarios(usuariosData);
    } catch {
      toast.error('Error al cargar alertas fitosanitarias');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const alertasPendientes = useMemo(() => {
    return alertas.filter((a) => !a.atendida && !a.solucionAplicada);
  }, [alertas]);

  const getNombreCampo = (idCampo) => {
    if (!idCampo) return 'Campo no especificado';
    const c = campos.find((x) => String(x.id || x.idCampo) === String(idCampo));
    return c ? c.nombre : `Campo #${idCampo}`;
  };

  const getNombreCultivo = (idCultivo) => {
    if (!idCultivo) return '';
    const cv = cultivos.find((x) => String(x.id || x.idCultivo) === String(idCultivo));
    return cv ? cv.nombre : `Cultivo #${idCultivo}`;
  };

  const getNombreUsuario = (idUsuario) => {
    if (!idUsuario) return '';
    const u = usuarios.find((x) => String(x.id || x.idUsuario) === String(idUsuario));
    return u
      ? u.nombreCompleto || `${u.nombres || ''} ${u.apellidos || ''}`.trim()
      : `Usuario #${idUsuario}`;
  };

  const createAlerta = async (payload) => {
    setIsLoading(true);
    try {
      const created = await alertasApi.create(payload);
      toast.success('Alerta reportada exitosamente');
      await loadData();
      refreshNotifs();
      return created;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al reportar alerta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAlerta = async (id, payload) => {
    setIsLoading(true);
    try {
      const updated = await alertasApi.update(id, payload);
      toast.success('Alerta actualizada exitosamente');
      await loadData();
      refreshNotifs();
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar alerta');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const atenderAlerta = async (id, solucion) => {
    try {
      await alertasApi.atender(id, solucion);
      toast.success('Alerta marcada como ATENDIDA');
      await loadData();
      refreshNotifs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al atender alerta');
    }
  };

  const deleteAlerta = async (id) => {
    try {
      await alertasApi.eliminar(id);
      toast.success('Alerta eliminada');
      await loadData();
      refreshNotifs();
    } catch {
      toast.error('Error al eliminar alerta');
    }
  };

  const restoreAlerta = async (id) => {
    try {
      await alertasApi.restaurar(id);
      toast.success('Alerta restaurada');
      await loadData();
      refreshNotifs();
    } catch {
      toast.error('Error al restaurar');
    }
  };

  const getSeverityClass = (tipo) => {
    switch (tipo) {
      case 'PLAGA':
        return 'bg-red-100 text-red-700';
      case 'ENFERMEDAD':
        return 'bg-orange-100 text-orange-700';
      case 'OTRO':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'PLAGA':
        return '🐛';
      case 'ENFERMEDAD':
        return '🍂';
      case 'OTRO':
        return '⚠️';
      default:
        return '🌿';
    }
  };

  return {
    alertas,
    campos,
    cultivos,
    usuarios,
    alertasPendientes,
    isLoading,
    loadData,
    createAlerta,
    updateAlerta,
    getNombreCampo,
    getNombreCultivo,
    getNombreUsuario,
    atenderAlerta,
    deleteAlerta,
    restoreAlerta,
    getSeverityClass,
    getIcon,
  };
}
