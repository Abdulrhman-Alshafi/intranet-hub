import { useState, useEffect, useCallback } from 'react';
import { SPFI } from '@pnp/sp';

export interface IListDataState<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useListData<T>(
  sp: SPFI | null,
  fetchFn: ((sp: SPFI) => Promise<T[]>) | null,
  deps: unknown[] = []
): IListDataState<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!sp || !fetchFn) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchFn(sp)
      .then(result => {
        if (!cancelled) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[useListData] Error:', err);
          setError(err?.message || 'Failed to load data');
          setData([]);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, refreshTrigger, ...deps]);

  return { data, isLoading, error, refresh };
}
