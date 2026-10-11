export function formatDate(fecha) {
  if (!fecha) return '';
  if (fecha.includes('/')) return fecha;
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return fecha;
  }
}

export function backendDateToInput(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr.split('T')[0];
}

export function inputDateToBackend(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
}

export function formatFechaRelativa(fecha) {
  if (!fecha) return '';
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  } catch {
    return fecha;
  }
}
