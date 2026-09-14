import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import type { AppEnv } from '@/core/config/env';
import { normalizeError } from '@/core/errors';

import type { CsrfManager } from './csrf';

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);
/** Routes dont la 401 est une réponse attendue et non une expiration de session. */
const SESSION_PROBES = ['/auth/me', '/auth/login'];
const REQUEST_TIMEOUT_MS = 15_000;

type RetriableConfig = InternalAxiosRequestConfig & { _csrfRetried?: boolean };

/** En-têtes qui font reconnaître le mobile comme client « stateful » par Sanctum. */
export function statefulHeaders(env: AppEnv): Record<string, string> {
  return {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    Origin: env.statefulOrigin,
    Referer: `${env.statefulOrigin}/`,
  };
}

/** Fonction d'appel à `/sanctum/csrf-cookie`, hors intercepteurs du client principal. */
export function createCsrfCookieFetcher(env: AppEnv, http: AxiosInstance): () => Promise<void> {
  return async () => {
    await http.get(`${env.apiUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
      timeout: REQUEST_TIMEOUT_MS,
      headers: statefulHeaders(env),
    });
  };
}

export interface ApiClientDeps {
  env: AppEnv;
  csrf: CsrfManager;
  /** Appelé sur toute 401 hors `/auth/me` et `/auth/login`. */
  onUnauthenticated: () => void;
}

/**
 * Crée le client HTTP de l'API `/api/v1` : cookies de session, CSRF sur les écritures,
 * rejeu unique après 419, signalement des 401 et normalisation des erreurs en `AppError`.
 */
export function createApiClient({ env, csrf, onUnauthenticated }: ApiClientDeps): AxiosInstance {
  const client = axios.create({
    baseURL: `${env.apiUrl}/api/v1`,
    withCredentials: true,
    timeout: REQUEST_TIMEOUT_MS,
    headers: statefulHeaders(env),
  });

  client.interceptors.request.use(async (config) => {
    if (MUTATING_METHODS.has((config.method ?? 'get').toLowerCase())) {
      config.headers.set('X-XSRF-TOKEN', await csrf.getToken());
    }
    return config;
  });

  client.interceptors.response.use(undefined, async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response && error.config) {
      const config = error.config as RetriableConfig;
      const status = error.response.status;

      if (status === 419 && !config._csrfRetried) {
        config._csrfRetried = true;
        csrf.invalidate();
        return client.request(config);
      }

      const isSessionProbe = SESSION_PROBES.some((probe) => config.url?.startsWith(probe));
      if (status === 401 && !isSessionProbe) {
        onUnauthenticated();
      }
    }
    throw normalizeError(error);
  });

  return client;
}
