import { QueryClient } from '@tanstack/react-query';

import { normalizeError, type AppErrorKind } from '@/core/errors';

const MAX_QUERY_RETRIES = 3;
const RETRIABLE_KINDS = new Set<AppErrorKind>(['network', 'timeout', 'server']);

/** Relance au plus trois fois, et uniquement les erreurs transitoires. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  return failureCount < MAX_QUERY_RETRIES && RETRIABLE_KINDS.has(normalizeError(error).kind);
}

/** Délai exponentiel : 1 s, 2 s, 4 s… plafonné à 30 s. */
export function retryDelay(attempt: number): number {
  return Math.min(1_000 * 2 ** attempt, 30_000);
}

/** QueryClient de l'application ; les mutations ne sont jamais relancées automatiquement. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        retryDelay,
        staleTime: 30_000,
        gcTime: 24 * 60 * 60 * 1000,
      },
      mutations: { retry: false },
    },
  });
}
