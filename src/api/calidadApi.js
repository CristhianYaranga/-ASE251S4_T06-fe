import api from './axiosConfig';

export const calidadApi = {
  getAll: async () => {
    const res = await api.get('/revisiones-calidad');
    return (res.data || []).map((r) => ({
      ...r,
      id: r.id || r.idRevision,
      idRevision: r.idRevision || r.id,
      idCosecha: r.idCosecha ?? r.cosecha?.idCosecha ?? r.cosecha?.id,
      idUsuarioSupervisor: r.idUsuarioSupervisor || r.idSupervisor || r.supervisor?.idUsuario || r.supervisor?.id
    }));
  },

  create: async (payload) => {
    const res = await api.post('/revisiones-calidad', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/revisiones-calidad/${id}`, payload);
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.patch(`/revisiones-calidad/${id}/eliminar`, {});
    return res.data;
  },

  restaurar: async (id) => {
    const res = await api.patch(`/revisiones-calidad/${id}/restaurar`, {});
    return res.data;
  }
};
