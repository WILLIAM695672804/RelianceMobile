import { normalizeError } from '@/core/errors';

import type { ProfileCache } from './profileCache';
import type { SessionStore } from './store';
import type { SessionUser } from './types';

/** Issue de la restauration : `offline` = pas de réseau et aucun profil en cache. */
export type RestoreOutcome = 'authenticated' | 'degraded' | 'unauthenticated' | 'offline';

export interface RestoreSessionDeps {
  fetchCurrentUser: () => Promise<SessionUser>;
  store: SessionStore;
  profileCache: ProfileCache;
}

const TRANSIENT_KINDS = new Set(['network', 'timeout', 'server']);

/** Restaure la session au lancement (E01) à partir de `GET /auth/me`. */
export async function restoreSession({
  fetchCurrentUser,
  store,
  profileCache,
}: RestoreSessionDeps): Promise<RestoreOutcome> {
  try {
    const user = await fetchCurrentUser();
    profileCache.save(user);
    store.getState().setAuthenticated(user);
    return 'authenticated';
  } catch (error) {
    if (TRANSIENT_KINDS.has(normalizeError(error).kind)) {
      const cached = profileCache.load();
      if (!cached) return 'offline';
      store.getState().setDegraded(cached);
      return 'degraded';
    }
    profileCache.clear();
    store.getState().setUnauthenticated();
    return 'unauthenticated';
  }
}
