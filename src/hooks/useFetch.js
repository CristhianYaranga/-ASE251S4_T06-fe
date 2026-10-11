import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

/**
 * Custom Hook genérico para peticiones GET.
 * Tal como lo especifica la arquitectura del proyecto.
 */
export function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(url, options);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error en la petición');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
