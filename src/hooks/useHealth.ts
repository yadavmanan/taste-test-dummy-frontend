import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Health } from "../types";

const RETRY_MS = 4000;
const MAX_ATTEMPTS = 45;

let wake: Promise<Health> | null = null;

// A free-tier host sleeps when idle; pinging on load starts it before the user submits anything.
export function wakeBackend(): Promise<Health> {
  if (!wake) {
    wake = (async () => {
      let lastError: unknown;
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
          return await api.health();
        } catch (e) {
          lastError = e;
          await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
        }
      }
      wake = null;
      throw lastError;
    })();
  }
  return wake;
}

export function useHealth() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    wakeBackend()
      .then((h) => active && setHealth(h))
      .catch((e) => active && setError((e as Error).message));
    return () => { active = false; };
  }, []);
  return { health, error, waking: !health && !error };
}
