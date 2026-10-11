import api from './axiosConfig';

export const camposApi = {
  getAll: async () => {
    const res = await api.get('/campos');
    return (res.data || []).map((c) => {
      const id = c.id || (c.idCampo != null ? String(c.idCampo) : '');
      const ha = c.hectareas ?? c.areaHectareas ?? 0;
      return { ...c, id, idCampo: id, hectareas: ha, areaHectareas: ha };
    });
  },

  getActivos: async () => {
    const res = await api.get('/campos/estado/true');
    return (res.data || []).map((c) => {
      const id = c.id || (c.idCampo != null ? String(c.idCampo) : '');
      const ha = c.hectareas ?? c.areaHectareas ?? 0;
      return { ...c, id, idCampo: id, hectareas: ha, areaHectareas: ha };
    });
  },

  create: async (campo) => {
    const payload = {
      ...campo,
      areaHectareas: campo.hectareas ?? campo.areaHectareas,
      hectareas: campo.hectareas ?? campo.areaHectareas
    };
    const res = await api.post('/campos', payload);
    return res.data;
  },

  update: async (id, campo) => {
    const payload = {
      ...campo,
      areaHectareas: campo.hectareas ?? campo.areaHectareas,
      hectareas: campo.hectareas ?? campo.areaHectareas
    };
    const res = await api.put(`/campos/${id}`, payload);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.patch(`/campos/${id}/eliminar`, {});
    return res.data;
  },

  restaurar: async (id) => {
    const res = await api.patch(`/campos/${id}/restaurar`, {});
    return res.data;
  },

  exportPdf: async () => {
    const res = await api.get('/campos/export/pdf', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campos_arona.pdf');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
