import type { Persister } from '@tanstack/react-query-persist-client';
import type { QueryClient } from '@tanstack/react-query';

import type { CookieReader, CsrfManager } from '@/core/api/csrf';

import type { ProfileCache } from './profileCache';
import type { SessionStore } from './store';

export interface LogoutDeps {
  /** `POST /auth/logout` ; échec toléré. */
  callLogout: () => Promise<unknown>;
  cookies: Pick<CookieReader, 'clearAll'>;
  csrf: Pick<CsrfManager, 'invalidate'>;
  realtime: { stop(): void };
  queryClient: Pick<QueryClient, 'clear'>;
  persister: Pick<Persister, 'removeClient'>;
  profileCache: ProfileCache;
  store: SessionStore;
}

export interface LogoutOptions {
  /** Signale « Votre session a expiré » sur l'écran de connexion. */
  expired?: boolean;
  /** Appeler le backend (faux lorsque la session est déjà invalide côté serveur). */
  remote?: boolean;
}

/** Ferme la session et purge tout l'état local lié à l'utilisateur. */
export async function performLogout(
  deps: LogoutDeps,
  { expired = false, remote = true }: LogoutOptions = {},
): Promise<void> {
  if (remote) {
    try {
      await deps.callLogout();
    } catch {
      // Déconnexion au mieux : la purge locale prévaut.
    }
  }
  await deps.cookies.clearAll().catch(() => undefined);
  deps.csrf.invalidate();
  deps.realtime.stop();
  deps.queryClient.clear();
  await deps.persister.removeClient();
  deps.profileCache.clear();
  deps.store.getState().setUnauthenticated({ expired });
}
