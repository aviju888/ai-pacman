import { useState, useCallback } from 'react';
import type { ValueIterationResult, QLearningResult, Algorithm, PacmanGameResult } from '../types';

const API_BASE = '/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApi = useCallback(async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }
      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const healthCheck = useCallback(async () => {
    return fetchApi<{ status: string; message: string }>('/health');
  }, [fetchApi]);

  const getLayouts = useCallback(async () => {
    return fetchApi<{ layouts: string[]; gridworlds: string[] }>('/layouts');
  }, [fetchApi]);

  const getAlgorithms = useCallback(async () => {
    return fetchApi<{ algorithms: Algorithm[] }>('/algorithms');
  }, [fetchApi]);

  const runValueIteration = useCallback(async (params: {
    grid?: string;
    iterations?: number;
    discount?: number;
    noise?: number;
    livingReward?: number;
  }) => {
    return fetchApi<ValueIterationResult>('/value-iteration', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }, [fetchApi]);

  const runQLearning = useCallback(async (params: {
    grid?: string;
    episodes?: number;
    epsilon?: number;
    alpha?: number;
    discount?: number;
    noise?: number;
    livingReward?: number;
  }) => {
    return fetchApi<QLearningResult>('/qlearning/start', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }, [fetchApi]);

  const runPacmanGame = useCallback(async (params: {
    layout?: string;
    agent?: string;
    numTraining?: number;
    numGames?: number;
    epsilon?: number;
    alpha?: number;
    discount?: number;
  }) => {
    return fetchApi<PacmanGameResult>('/pacman/run', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }, [fetchApi]);

  const compareAlgorithms = useCallback(async (params: {
    grid?: string;
    iterations?: number;
    episodes?: number;
  }) => {
    return fetchApi<{
      grid: string;
      comparisons: {
        algorithm: string;
        iterations?: number;
        episodes?: number;
        values: Record<string, number>;
        policy: Record<string, string>;
      }[];
    }>('/demo/compare', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }, [fetchApi]);

  return {
    loading,
    error,
    healthCheck,
    getLayouts,
    getAlgorithms,
    runValueIteration,
    runQLearning,
    runPacmanGame,
    compareAlgorithms,
  };
}
