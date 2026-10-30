import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Health } from "../types";

export function useHealth() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.health().then(setHealth).catch((e) => setError((e as Error).message));
  }, []);
  return { health, error };
}
