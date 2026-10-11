import api from './axiosConfig';

export const cosechasApi = {
  getAll: async () => {
    const res = await api.get('/cosechas');
    return (res.data || []).map((c) => ({
      ...c,
      id: c.id ?? c.idCosecha,
      idCosecha: c.idCosecha ?? c.id
    }));
  },

  getById: async (id) => {
    const res = await api.get(`/cosechas/${id}`);
    return res.data;
  },

  getByEstado: async (estado) => {
    const res = await api.get(`/cosechas/estado/${estado}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post('/cosechas', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/cosechas/${id}`, payload);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.patch(`/cosechas/${id}/eliminar`, {});
    return res.data;
  },

  restaurar: async (id) => {
    const res = await api.patch(`/cosechas/${id}/restaurar`, {});
    return res.data;
  }
};
