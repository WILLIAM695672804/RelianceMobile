import { AppError } from '@/core/errors';
import { createMemoryStore } from '@/core/storage';

import { createProfileCache } from './profileCache';
import { restoreSession } from './restoreSession';
import { createSessionStore } from './store';
import type { SessionUser } from './types';

const user: SessionUser = {
  id: 'u1',
  name: 'Client Test',
  email: 'client@example.test',
  role: 'client',
  emailVerified: true,
  avatarUrl: null,
};

function setup(fetchCurrentUser: () => Promise<SessionUser>, cached: SessionUser | null = null) {
  const store = createSessionStore();
  const profileCache = createProfileCache(createMemoryStore());
  if (cached) profileCache.save(cached);
  return {
    store,
    profileCache,
    run: () => restoreSession({ fetchCurrentUser, store, profileCache }),
  };
}

describe('restoreSession', () => {
  it('authentifie et met le profil en cache sur une 200', async () => {
    const { store, profileCache, run } = setup(async () => user);

    await expect(run()).resolves.toBe('authenticated');
    expect(store.getState()).toMatchObject({ status: 'authenticated', user });
    expect(profileCache.load()).toEqual(user);
  });

  it('déconnecte et purge le cache sur une 401', async () => {
    const { store, profileCache, run } = setup(async () => {
      throw new AppError({ kind: 'unauthenticated', status: 401 });
    }, user);

    await expect(run()).resolves.toBe('unauthenticated');
    expect(store.getState()).toMatchObject({ status: 'unauthenticated', expired: false });
    expect(profileCache.load()).toBeNull();
  });

  it.each(['network', 'timeout', 'server'] as const)(
    'bascule en mode dégradé sur %s si un profil est en cache',
    async (kind) => {
      const { store, run } = setup(async () => {
        throw new AppError({ kind });
      }, user);

      await expect(run()).resolves.toBe('degraded');
      expect(store.getState()).toMatchObject({ status: 'degraded', user });
    },
  );

  it('signale offline sans modifier le statut si aucun profil n’est en cache', async () => {
    const { store, run } = setup(async () => {
      throw new AppError({ kind: 'network' });
    });

    await expect(run()).resolves.toBe('offline');
    expect(store.getState().status).toBe('unknown');
  });

  it('traite un écart de contrat comme une absence de session', async () => {
    const { store, run } = setup(async () => {
      throw new AppError({ kind: 'contract' });
    }, user);

    await expect(run()).resolves.toBe('unauthenticated');
    expect(store.getState().status).toBe('unauthenticated');
  });
});
