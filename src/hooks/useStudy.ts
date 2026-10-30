import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import type { Study } from "../types";

const RUNNING = new Set(["PLANNING", "RETRIEVING", "ANALYSING"]);

export function useStudy(id: string | undefined) {
  const [study, setStudy] = useState<Study | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number>();

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const s = await api.getStudy(id);
      setStudy(s);
      setError(null);
      return s;
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const s = await refresh();
      if (cancelled) return;
      timer.current = window.setTimeout(tick, s && RUNNING.has(s.status) ? 2000 : 6000);
    };
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer.current);
    };
  }, [refresh]);

  return { study, setStudy, error, refresh, running: !!study && RUNNING.has(study.status) };
}
