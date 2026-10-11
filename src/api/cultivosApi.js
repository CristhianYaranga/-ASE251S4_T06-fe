import api from './axiosConfig';

export const cultivosApi = {
  getAll: async () => {
    const res = await api.get('/cultivos');
    return (res.data || []).map((c) => {
      const id = c.id || (c.idCultivo != null ? String(c.idCultivo) : '');
      return {
        ...c,
        id,
        idCultivo: id,
        campoId: c.campoId || c.idCampo || c.campo?.id || (c.campo?.idCampo != null ? String(c.campo.idCampo) : undefined)
      };
    });
  },

  getActivos: async () => {
    const res = await api.get('/cultivos/estado/true');
    return (res.data || []).map((c) => {
      const id = c.id || (c.idCultivo != null ? String(c.idCultivo) : '');
      return {
        ...c,
        id,
        idCultivo: id,
        campoId: c.campoId || c.idCampo || c.campo?.id || (c.campo?.idCampo != null ? String(c.campo.idCampo) : undefined)
      };
    });
  },

  create: async (cultivo) => {
    const res = await api.post('/cultivos', cultivo);
    return res.data;
  },

  update: async (id, cultivo) => {
    const res = await api.put(`/cultivos/${id}`, cultivo);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.patch(`/cultivos/${id}/eliminar`, {});
    return res.data;
  },

  restaurar: async (id) => {
    const res = await api.patch(`/cultivos/${id}/restaurar`, {});
    return res.data;
  }
};
