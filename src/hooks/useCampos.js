import { useState, useEffect, useCallback, useMemo } from 'react';
import { camposApi } from '../api/camposApi';
import { useToast } from '../context/ToastContext';

export function useCampos() {
  const [campos, setCampos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const toast = useToast();

  const loadCampos = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await camposApi.getAll();
      setCampos(data);
    } catch (err) {
      console.error('[useCampos] Error:', err);
      setErrorMessage('No se pudo conectar con el servidor.');
      toast.error('Error al cargar los campos.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCampos();
  }, [loadCampos]);

  const filteredCampos = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    if (!s) return campos;
    return campos.filter(
      (c) =>
        c.nombre?.toLowerCase().includes(s) ||
        (c.ubicacion && c.ubicacion.toLowerCase().includes(s)) ||
        (c.responsable && c.responsable.toLowerCase().includes(s))
    );
  }, [campos, searchTerm]);

  const totalHectareas = useMemo(() => {
    const total = campos.reduce(
      (sum, c) => sum + Number(c.hectareas ?? c.areaHectareas ?? 0),
      0
    );
    return Number(total.toFixed(2));
  }, [campos]);

  const camposActivos = useMemo(() => {
    return campos.filter((c) => c.estado !== false).length;
  }, [campos]);

  const createCampo = async (payload) => {
    setIsLoading(true);
    try {
      const created = await camposApi.create(payload);
      toast.success('Campo creado exitosamente.');
      await loadCampos();
      return created;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear campo.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCampo = async (id, payload) => {
    setIsLoading(true);
    try {
      const updated = await camposApi.update(id, payload);
      toast.success('Campo actualizado exitosamente.');
      await loadCampos();
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar campo.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEstado = async (campo) => {
    const id = campo.id || campo.idCampo;
    if (!id) return;
    try {
      if (campo.estado) {
        await camposApi.eliminar(id);
        toast.success(`Campo "${campo.nombre}" desactivado.`);
      } else {
        await camposApi.restaurar(id);
        toast.success(`Campo "${campo.nombre}" restaurado.`);
      }
      await loadCampos();
    } catch {
      toast.error('Error al cambiar el estado del campo.');
    }
  };

  const deleteCampo = async (id) => {
    try {
      await camposApi.eliminar(id);
      toast.success('Campo eliminado.');
      await loadCampos();
    } catch {
      toast.error('Error al eliminar campo.');
    }
  };

  const restoreCampo = async (id) => {
    try {
      await camposApi.restaurar(id);
      toast.success('Campo restaurado.');
      await loadCampos();
    } catch {
      toast.error('Error al restaurar campo.');
    }
  };

  return {
    campos,
    filteredCampos,
    searchTerm,
    setSearchTerm,
    isLoading,
    errorMessage,
    totalHectareas,
    camposActivos,
    loadCampos,
    createCampo,
    updateCampo,
    toggleEstado,
    deleteCampo,
    restoreCampo,
    exportarPDF: camposApi.exportPdf,
  };
}
