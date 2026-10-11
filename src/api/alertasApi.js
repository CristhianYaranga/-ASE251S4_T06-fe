import api from './axiosConfig';

export const alertasApi = {
  getAll: async () => {
    const res = await api.get('/alertas');
    return (res.data || []).map((a) => ({
      ...a,
      id: a.id || a.idAlerta,
      idAlerta: a.idAlerta || a.id,
      idCampo: a.idCampo || a.campo?.idCampo || a.campo?.id,
      idCultivo: a.idCultivo || a.cultivo?.idCultivo || a.cultivo?.id
    }));
  },

  getPendientes: async () => {
    const res = await api.get('/alertas/pendientes');
    return (res.data || []).map((a) => ({
      ...a,
      id: a.id || a.idAlerta,
      idAlerta: a.idAlerta || a.id
    }));
  },

  create: async (payload) => {
    const res = await api.post('/alertas', payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.put(`/alertas/${id}`, payload);
    return res.data;
  },

  atender: async (id, solucionAplicada) => {
    const res = await api.patch(`/alertas/${id}/atender`, { solucionAplicada });
    return res.data;
  },

  eliminar: async (id) => {
    const res = await api.patch(`/alertas/${id}/eliminar`, {});
    return res.data;
  },

  restaurar: async (id) => {
    const res = await api.patch(`/alertas/${id}/restaurar`, {});
    return res.data;
  }
};
