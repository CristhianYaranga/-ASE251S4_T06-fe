import { useState, useEffect, useCallback, useMemo } from 'react';
import { cosechasApi } from '../api/cosechasApi';
import { camposApi } from '../api/camposApi';
import { cultivosApi } from '../api/cultivosApi';
import { authApi } from '../api/authApi';
import { useToast } from '../context/ToastContext';

export function useCosechas() {
  const [cosechas, setCosechas] = useState([]);
  const [campos, setCampos] = useState([]);
  const [cultivos, setCultivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cosechasData, camposData, cultivosData, usuariosData] = await Promise.all([
        cosechasApi.getAll(),
        camposApi.getActivos().catch(() => []),
        cultivosApi.getActivos().catch(() => []),
        authApi.getAllUsuarios().catch(() => []),
      ]);
      setCosechas(cosechasData);
      setCampos(camposData);
      setCultivos(cultivosData);
      setUsuarios(usuariosData);
    } catch {
      toast.error('Error al cargar datos de cosechas');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalToneladas = useMemo(() => {
    const sum = cosechas
      .filter((c) => c.estado !== false)
      .reduce((acc, c) => acc + (Number(c.cantidadKg) || 0), 0);
    return (sum / 1000).toFixed(2);
  }, [cosechas]);

  const cosechasActivas = useMemo(() => {
    return cosechas.filter((c) => c.estado !== false).length;
  }, [cosechas]);

  const getCampoNombre = (cosecha) => {
    const cid =
      cosecha.idCampo ||
      cosecha.campo?.id ||
      (cosecha.campo?.idCampo != null ? String(cosecha.campo.idCampo) : '');
    if (cid) {
      const f = campos.find((c) => (c.id || String(c.idCampo)) === String(cid));
      if (f?.nombre) return f.nombre;
    }
    return cosecha.campo?.nombre ?? '—';
  };

  const getCultivoNombre = (cosecha) => {
    const cid =
      cosecha.idCultivo ||
      cosecha.cultivo?.id ||
      (cosecha.cultivo?.idCultivo != null ? String(cosecha.cultivo.idCultivo) : '');
    if (cid) {
      const f = cultivos.find((c) => (c.id || String(c.idCultivo)) === String(cid));
      if (f?.nombre) return f.nombre;
    }
    return cosecha.cultivo?.nombre ?? '—';
  };

  const getUsuarioNombre = (cosecha) => {
    if (cosecha.usuario?.nombreCompleto) return cosecha.usuario.nombreCompleto;
    const uid = cosecha.idUsuario || cosecha.usuario?.id || cosecha.usuario?.idUsuario;
    if (uid) {
      const u = usuarios.find(
        (user) => String(user.id || user.idUsuario) === String(uid)
      );
      if (u) {
        return (
          u.nombreCompleto ||
          `${u.nombres || ''} ${u.apellidos || ''}`.trim() ||
          u.correo
        );
      }
      return `Usuario #${uid}`;
    }
    return '—';
  };

  const createCosecha = async (payload) => {
    setIsLoading(true);
    try {
      const created = await cosechasApi.create(payload);
      toast.success('Cosecha registrada');
      await loadData();
      return created;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar cosecha');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCosecha = async (id, payload) => {
    setIsLoading(true);
    try {
      const updated = await cosechasApi.update(id, payload);
      toast.success('Cosecha actualizada');
      await loadData();
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar cosecha');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCosecha = async (id) => {
    try {
      await cosechasApi.eliminar(id);
      toast.success('Cosecha eliminada');
      await loadData();
    } catch {
      toast.error('Error al eliminar cosecha');
    }
  };

  const restoreCosecha = async (id) => {
    try {
      await cosechasApi.restaurar(id);
      toast.success('Cosecha restaurada');
      await loadData();
    } catch {
      toast.error('Error al restaurar');
    }
  };

  return {
    cosechas,
    campos,
    cultivos,
    usuarios,
    isLoading,
    loadData,
    totalToneladas,
    cosechasActivas,
    createCosecha,
    updateCosecha,
    getCampoNombre,
    getCultivoNombre,
    getUsuarioNombre,
    deleteCosecha,
    restoreCosecha,
  };
}
