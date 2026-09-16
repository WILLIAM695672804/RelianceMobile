import { useCallback } from 'react';

import { useApiClient } from './ApiProvider';

const API_PREFIX = /\/api\/v\d+\/?$/;
const ABSOLUTE_URL = /^https?:\/\//;

/** URL publique d'un fichier du disque `public` de Laravel ; une URL absolue est conservée. */
export function resolveStorageUrl(baseURL: string | undefined, path: string): string {
  if (ABSOLUTE_URL.test(path)) return path;
  const origin = (baseURL ?? '').replace(API_PREFIX, '').replace(/\/$/, '');
  return `${origin}/storage/${path.replace(/^\/+/, '')}`;
}

/** Résolveur d'URL de stockage lié au client API courant. */
export function useStorageUrl(): (path: string) => string {
  const baseURL = useApiClient().defaults.baseURL;
  return useCallback((path: string) => resolveStorageUrl(baseURL, path), [baseURL]);
}
