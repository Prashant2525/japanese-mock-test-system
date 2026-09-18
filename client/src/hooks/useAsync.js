import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/api.js';

export function useAsync(asyncFunction, dependenciesOrOptions = {}) {
  const hasDependencies = Array.isArray(dependenciesOrOptions);
  const dependencies = hasDependencies ? dependenciesOrOptions : [asyncFunction];
  const { immediate = true } = hasDependencies ? {} : dependenciesOrOptions;
  const [state, setState] = useState({ data: null, loading: immediate, error: '' });

  const execute = useCallback(async (...args) => {
    setState((current) => ({ ...current, loading: true, error: '' }));
    try {
      const response = await asyncFunction(...args);
      setState({ data: response.data, loading: false, error: '' });
      return response.data;
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: getErrorMessage(error) }));
      throw error;
    }
  // Callers with changing query inputs provide those inputs through dependenciesOrOptions.
  // Stable service functions use their function identity as the dependency.
  }, dependencies);

  useEffect(() => {
    if (immediate) execute().catch(() => {});
  }, [execute, immediate]);

  return { ...state, execute };
}
