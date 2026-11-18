import type { QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientOptions, Persister } from '@tanstack/react-query-persist-client';
import axios, { type AxiosInstance } from 'axios';
import type { i18n as I18n } from 'i18next';

import {
  createApiClient,
  createCsrfCookieFetcher,
  createCsrfManager,
  type CookieReader,
  type CsrfManager,
} from '@/core/api';
import type { AppEnv } from '@/core/config/env';
import { createI18n, type Language, type TranslationResources } from '@/core/i18n';
import { createPersistOptions, createQueryClient, createQueryPersister } from '@/core/query';
import {
  createRealtimeClient,
  createRealtimeService,
  type ChannelAuthData,
  type RealtimeClient,
  type RealtimeClientDeps,
  type RealtimeService,
} from '@/core/realtime';
import {
  createProfileCache,
  createSessionStore,
  fetchCurrentUser,
  performLogout,
  restoreSession,
  type LogoutDeps,
  type ProfileCache,
  type SessionActions,
  type SessionStatus,
  type SessionStore,
} from '@/core/session';
import type { KeyValueStore } from '@/core/storage';

export interface ServicesDeps {
  env: AppEnv;
  cookies: CookieReader;
  /** Stockage du profil de session. */
  sessionStorage: KeyValueStore;
  /** Stockage du cache TanStack Query persisté. */
  cacheStorage: KeyValueStore;
  appVersion: string;
  language: Language;
  translations?: TranslationResources[];
  realtimeFactory?: (deps: RealtimeClientDeps) => RealtimeClient;
  /** Instance HTTP dédiée à `/sanctum/csrf-cookie` (remplaçable en test). */
  csrfHttp?: AxiosInstance;
}

export interface AppServices {
  env: AppEnv;
  api: AxiosInstance;
  csrf: CsrfManager;
  queryClient: QueryClient;
  persister: Persister;
  persistOptions: Omit<PersistQueryClientOptions, 'queryClient'>;
  sessionStore: SessionStore;
  profileCache: ProfileCache;
  sessionActions: SessionActions;
  realtime: RealtimeService;
  i18n: I18n;
}

const isSignedIn = (status: SessionStatus) => status === 'authenticated' || status === 'degraded';

/** Compose les singletons de l'application ; seule fonction qui connaît toutes les dépendances. */
export function createServices(deps: ServicesDeps): AppServices {
  const { env } = deps;
  const sessionStore = createSessionStore();
  const profileCache = createProfileCache(deps.sessionStorage);
  const csrf = createCsrfManager({
    apiUrl: env.apiUrl,
    cookies: deps.cookies,
    fetchCsrfCookie: createCsrfCookieFetcher(env, deps.csrfHttp ?? axios.create()),
  });
  const queryClient = createQueryClient();
  const persister = createQueryPersister(deps.cacheStorage);

  let expiring: Promise<void> | null = null;
  const expireSession = () => {
    if (expiring || sessionStore.getState().status === 'unauthenticated') return;
    expiring = performLogout(logoutDeps, { expired: true, remote: false }).finally(() => {
      expiring = null;
    });
  };

  const api = createApiClient({ env, csrf, onUnauthenticated: expireSession });

  const realtimeFactory = deps.realtimeFactory ?? createRealtimeClient;
  const realtime = createRealtimeService(() =>
    realtimeFactory({
      env,
      authorize: async (socketId, channelName) => {
        const { data } = await api.post<ChannelAuthData>(`${env.apiUrl}/broadcasting/auth`, {
          socket_id: socketId,
          channel_name: channelName,
        });
        return data;
      },
    }),
  );

  const logoutDeps: LogoutDeps = {
    callLogout: () => api.post('/auth/logout'),
    cookies: deps.cookies,
    csrf,
    realtime,
    queryClient,
    persister,
    profileCache,
    store: sessionStore,
  };

  const sessionActions: SessionActions = {
    restore: () =>
      restoreSession({
        fetchCurrentUser: () => fetchCurrentUser(api),
        store: sessionStore,
        profileCache,
      }),
    signIn: (user) => {
      profileCache.save(user);
      sessionStore.getState().setAuthenticated(user);
      // Le cookie de session doit survivre à un arrêt forcé immédiat de l'application.
      deps.cookies.flush().catch((error: unknown) => {
        console.warn('[cookies] écriture sur disque impossible', error);
      });
    },
    logout: () => performLogout(logoutDeps),
  };

  // Le temps réel suit la session : démarrage à la connexion, arrêt dans performLogout.
  sessionStore.subscribe((state, previous) => {
    if (!isSignedIn(state.status) || isSignedIn(previous.status)) return;
    // Une défaillance du temps réel ne doit jamais faire échouer l'ouverture de session.
    try {
      realtime.start();
    } catch (error) {
      console.warn('[temps réel] démarrage impossible', error);
    }
  });

  return {
    env,
    api,
    csrf,
    queryClient,
    persister,
    persistOptions: createPersistOptions(persister, deps.appVersion),
    sessionStore,
    profileCache,
    sessionActions,
    realtime,
    i18n: createI18n(deps.translations ?? [], deps.language),
  };
}
