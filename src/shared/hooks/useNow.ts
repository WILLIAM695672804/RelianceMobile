import { useEffect, useState } from 'react';

/** Fréquence par défaut de réévaluation de l'instant courant. */
const DEFAULT_INTERVAL_MS = 30 * 1000;

/** Instant courant, réévalué périodiquement afin que le rendu reste pur. */
export function useNow(intervalMs: number = DEFAULT_INTERVAL_MS): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
