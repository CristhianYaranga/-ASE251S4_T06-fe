import api from './axiosConfig';

export const normalizeUser = (raw) => {
  if (!raw) return raw;
  const id = raw.id || raw.idUsuario;
  const nombres = raw.nombres || '';
  const apellidos = raw.apellidos || '';
  const nombreCompleto =
    raw.nombreCompleto ||
    `${nombres} ${apellidos}`.trim() ||
    raw.correo ||
    'Usuario';
  return {
    ...raw,
    id: id != null ? String(id) : undefined,
    idUsuario: id,
    nombres,
    apellidos,
    nombreCompleto,
  };
};

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/usuarios/login', credentials);
    const usuario = normalizeUser(res.data);
    const token =
      res.data.token ||
      btoa(
        JSON.stringify({
          id: usuario.idUsuario,
          correo: usuario.correo,
          ts: Date.now(),
        })
      );
    return { token, usuario };
  },

  loginAdmin: async (credentials) => {
    const res = await api.post('/usuarios/login', credentials);
    const usuario = normalizeUser(res.data);
    const rolUpper = String(usuario.rol || '').toUpperCase();
    if (rolUpper !== 'ADMINISTRADOR' && rolUpper !== 'ADMIN') {
      throw new Error('Acceso denegado: se requiere rol de Administrador');
    }
    const token =
      res.data.token ||
      btoa(
        JSON.stringify({
          id: usuario.idUsuario,
          correo: usuario.correo,
          rol: 'ADMIN',
          ts: Date.now(),
        })
      );
    return { token, usuario };
  },

  register: async (usuarioData) => {
    const res = await api.post('/usuarios', usuarioData);
    return res.data;
  },

  getUsuarioById: async (id) => {
    const res = await api.get(`/usuarios/${id}`);
    return normalizeUser(res.data);
  },

  getPerfil: async (id) => {
    const res = await api.get(`/usuarios/${id}`);
    return normalizeUser(res.data);
  },

  getAllUsuarios: async () => {
    const res = await api.get('/usuarios');
    return (res.data || []).map(normalizeUser);
  },

  createUsuario: async (data) => {
    const res = await api.post('/usuarios', data);
    return normalizeUser(res.data);
  },

  updateUsuario: async (id, data) => {
    const res = await api.put(`/usuarios/${id}`, data);
    return normalizeUser(res.data);
  },

  eliminarUsuario: async (id) => {
    const res = await api.patch(`/usuarios/${id}/eliminar`, {});
    return res.data;
  },

  restaurarUsuario: async (id) => {
    const res = await api.patch(`/usuarios/${id}/restaurar`, {});
    return res.data;
  },

  cambiarPassword: async (id, password) => {
    const res = await api.put(`/usuarios/${id}`, { password });
    return res.data;
  },
};
