import { useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportUsuariosPdf, exportUsuariosExcel } from '../utils/exportUtils';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const { currentUser } = useAuth();
  const toast = useToast();

  const loadUsuarios = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authApi.getAllUsuarios();
      setUsuarios(data);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return usuarios.filter((u) => {
      const nombre = (
        u.nombreCompleto ||
        `${u.nombres || ''} ${u.apellidos || ''}`.trim() ||
        u.correo ||
        ''
      ).toLowerCase();
      const correo = (u.correo || '').toLowerCase();
      const dni = (u.dni || '').toLowerCase();
      return (
        !term ||
        nombre.includes(term) ||
        correo.includes(term) ||
        dni.includes(term)
      );
    });
  }, [usuarios, searchTerm]);

  const totalAdmins = useMemo(
    () =>
      usuarios.filter((u) => {
        const r = String(u.rol || '').toUpperCase();
        return r === 'ADMINISTRADOR' || r === 'ADMIN';
      }).length,
    [usuarios]
  );

  const totalActive = useMemo(
    () => usuarios.filter((u) => u.estado !== false).length,
    [usuarios]
  );

  const createUsuario = async (payload) => {
    setIsLoading(true);
    try {
      const created = await authApi.createUsuario(payload);
      toast.success('Usuario registrado exitosamente');
      await loadUsuarios();
      return created;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar el usuario');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsuario = async (id, payload) => {
    setIsLoading(true);
    try {
      const updated = await authApi.updateUsuario(id, payload);
      toast.success('Usuario actualizado exitosamente');
      await loadUsuarios();
      return updated;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar usuario');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEstado = async (u) => {
    const id = u.id || u.idUsuario;
    if (!id) return;
    try {
      if (u.estado) {
        await authApi.eliminarUsuario(id);
        toast.success('Usuario desactivado');
      } else {
        await authApi.restaurarUsuario(id);
        toast.success('Usuario restaurado');
      }
      await loadUsuarios();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  const deleteUsuario = async (id) => {
    try {
      await authApi.eliminarUsuario(id);
      toast.success('Usuario eliminado');
      await loadUsuarios();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const cambiarPassword = async (newPassword) => {
    const userId = currentUser?.idUsuario || currentUser?.id;
    if (!userId) {
      toast.error('No se pudo identificar al usuario logueado');
      return;
    }
    try {
      await authApi.cambiarPassword(userId, newPassword);
      toast.success('Contraseña actualizada correctamente');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Error al cambiar contraseña'
      );
      throw err;
    }
  };

  const exportPdf = async () => {
    if (!filteredUsers.length) {
      toast.warning('No hay usuarios para exportar.');
      return;
    }
    setIsExportingPdf(true);
    try {
      await exportUsuariosPdf(filteredUsers);
      toast.success(
        `PDF generado — ${filteredUsers.length} registro(s) exportado(s)`
      );
    } catch {
      toast.error('No se pudo generar el PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const exportExcel = async () => {
    if (!filteredUsers.length) {
      toast.warning('No hay usuarios para exportar.');
      return;
    }
    setIsExportingExcel(true);
    try {
      await exportUsuariosExcel(filteredUsers);
      toast.success(
        `Excel generado — ${filteredUsers.length} registro(s) exportado(s)`
      );
    } catch {
      toast.error('No se pudo generar el Excel.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  return {
    usuarios,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    isLoading,
    isExportingPdf,
    isExportingExcel,
    totalAdmins,
    totalActive,
    loadUsuarios,
    createUsuario,
    updateUsuario,
    toggleEstado,
    deleteUsuario,
    cambiarPassword,
    exportPdf,
    exportExcel,
    exportToPdf: exportPdf,
    exportToExcel: exportExcel,
  };
}
