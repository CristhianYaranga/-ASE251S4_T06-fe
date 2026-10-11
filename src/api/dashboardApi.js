import { camposApi } from './camposApi';
import { cosechasApi } from './cosechasApi';
import { alertasApi } from './alertasApi';
import { actividadesApi } from './actividadesApi';
import { authApi } from './authApi';

export const dashboardApi = {
  getSummaryData: async () => {
    const [campos, cosechas, alertasPendientes, actividades, usuarios] = await Promise.all([
      camposApi.getActivos().catch(() => []),
      cosechasApi.getAll().catch(() => []),
      alertasApi.getPendientes().catch(() => []),
      actividadesApi.getAll().catch(() => []),
      authApi.getAllUsuarios().catch(() => [])
    ]);

    return {
      campos,
      cosechas,
      alertasPendientes,
      ultimasActividades: [...actividades].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 5),
      totalUsuarios: usuarios.filter(u => u.estado !== false).length
    };
  }
};
