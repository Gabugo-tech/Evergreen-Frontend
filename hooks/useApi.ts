"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  fetcher: () => Promise<{ data: T }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: any[] = []
): UseApiState<T> {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Keep latest fetcher in a ref so we don't need it as a dep
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcherRef.current();
      setData(res.data as T);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  // deps are intentionally spread — caller controls re-runs
   
  }, deps);  

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}
