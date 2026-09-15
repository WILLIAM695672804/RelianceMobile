import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { Query } from '@tanstack/react-query';
import type { PersistQueryClientOptions, Persister } from '@tanstack/react-query-persist-client';

import type { KeyValueStore } from '@/core/storage';

export const QUERY_CACHE_KEY = 'reliance.query-cache';
export const QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

/** Liste blanche : seules les requêtes réussies déclarant `meta: { persist: true }` sont persistées. */
export function shouldPersistQuery(query: Query): boolean {
  return query.meta?.persist === true && query.state.status === 'success';
}

/** Persisteur du cache TanStack Query adossé au stockage clé-valeur. */
export function createQueryPersister(
  store: KeyValueStore,
  { throttleTime = 1_000 }: { throttleTime?: number } = {},
): Persister {
  return createAsyncStoragePersister({
    storage: {
      getItem: (key) => store.getString(key) ?? null,
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.remove(key),
    },
    key: QUERY_CACHE_KEY,
    throttleTime,
  });
}

/** Options de `PersistQueryClientProvider` ; `buster` = version de l'application. */
export function createPersistOptions(
  persister: Persister,
  buster: string,
): Omit<PersistQueryClientOptions, 'queryClient'> {
  return {
    persister,
    maxAge: QUERY_CACHE_MAX_AGE,
    buster,
    dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
  };
}
