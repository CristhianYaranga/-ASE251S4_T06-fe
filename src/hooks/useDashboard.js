import { useState, useEffect, useCallback, useMemo } from 'react';
import { dashboardApi } from '../api/dashboardApi';

export function useDashboard() {
  const [data, setData] = useState({
    campos: [],
    cosechas: [],
    alertasPendientes: [],
    ultimasActividades: [],
    totalUsuarios: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const summary = await dashboardApi.getSummaryData();
      setData(summary);
    } catch (err) {
      console.error('[useDashboard] Error:', err);
      setErrorMessage('No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalProducido = useMemo(() => {
    const total = data.cosechas.reduce((sum, c) => sum + (c.cantidadKg ?? 0), 0);
    return (total / 1000).toFixed(1);
  }, [data.cosechas]);

  const rendimientoPromedio = useMemo(() => {
    const cosechasConDatos = data.cosechas.filter((c) => c.cantidadKg && c.cantidadKg > 0);
    if (cosechasConDatos.length === 0) return '0.0';
    const totalHa = data.campos.reduce((sum, c) => sum + (c.hectareas ?? c.areaHectareas ?? 0), 0);
    if (totalHa === 0) return '0.0';
    const totalKg = cosechasConDatos.reduce((sum, c) => sum + (c.cantidadKg ?? 0), 0);
    return ((totalKg / 1000) / totalHa).toFixed(1);
  }, [data.cosechas, data.campos]);

  const lotesCosechados = useMemo(() => {
    return data.cosechas.filter((c) => c.cantidadKg && c.cantidadKg > 0).length;
  }, [data.cosechas]);

  const chartData = useMemo(() => {
    const groupedMap = new Map();
    data.cosechas.forEach((c) => {
      let nombre = c.campo?.nombre;
      if (!nombre && c.idCampo) {
        const found = data.campos.find((camp) => String(camp.id || camp.idCampo) === String(c.idCampo));
        nombre = found?.nombre || `Campo #${c.idCampo}`;
      }
      nombre = nombre || 'Sin campo';
      groupedMap.set(nombre, (groupedMap.get(nombre) ?? 0) + (c.cantidadKg ?? 0));
    });

    const labels = Array.from(groupedMap.keys());
    const datasetValues = labels.map((label) =>
      parseFloat(((groupedMap.get(label) ?? 0) / 1000).toFixed(2))
    );
    const colors = ['#00843D', '#1565C0', '#F57C00', '#D32F2F', '#7B1FA2', '#00838F'];

    return {
      labels,
      datasets: [
        {
          label: 'Producción (t)',
          data: datasetValues,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderRadius: 6
        }
      ]
    };
  }, [data.cosechas, data.campos]);

  return {
    ...data,
    isLoading,
    errorMessage,
    totalProducido,
    rendimientoPromedio,
    lotesCosechados,
    totalLotes: data.campos.length,
    alertasPendientesCount: data.alertasPendientes.length,
    chartData,
    loadData
  };
}
