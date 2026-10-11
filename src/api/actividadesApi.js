import api from './axiosConfig';

export const actividadesApi = {
  getAll: async () => {
    const res = await api.get('/actividades-campo');
    return (res.data || []).map((a) => ({
      ...a,
      id: a.id || a.idActividad,
      idActividad: a.idActividad || a.id
    }));
  },

  create: async (payload) => {
    const res = await api.post('/actividades-campo', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/actividades-campo/${id}`, payload);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.patch(`/actividades-campo/${id}/eliminar`, {});
    return res.data;
  },

  restaurar: async (id) => {
    const res = await api.patch(`/actividades-campo/${id}/restaurar`, {});
    return res.data;
  }
};
