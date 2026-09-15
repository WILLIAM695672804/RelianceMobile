import { QueryClient } from '@tanstack/react-query';

import { createMemoryStore } from '@/core/storage';

import { performLogout, type LogoutDeps } from './performLogout';
import { createProfileCache } from './profileCache';
import { createSessionStore } from './store';

function setup(callLogout: () => Promise<unknown> = jest.fn(async () => undefined)) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(['wallet'], { balance: 1000 });
  const store = createSessionStore();
  store.getState().setAuthenticated({
    id: 'u1',
    name: 'Client',
    email: 'c@example.test',
    role: 'client',
    emailVerified: true,
    avatarUrl: null,
  });
  const profileCache = createProfileCache(createMemoryStore());
  profileCache.save(store.getState().user!);

  // Client concret conservé dans le type pour inspecter le cache après purge.
  const deps: LogoutDeps & { queryClient: QueryClient } = {
    callLogout,
    cookies: { clearAll: jest.fn(async () => undefined) },
    csrf: { invalidate: jest.fn() },
    realtime: { stop: jest.fn() },
    queryClient,
    persister: { removeClient: jest.fn(async () => undefined) },
    profileCache,
    store,
  };
  return deps;
}

describe('performLogout', () => {
  it('appelle le backend avant de purger cookies, cache, temps réel et profil', async () => {
    const deps = setup();

    await performLogout(deps);

    expect(deps.callLogout).toHaveBeenCalledTimes(1);
    const logoutOrder = (deps.callLogout as jest.Mock).mock.invocationCallOrder[0]!;
    const clearOrder = (deps.cookies.clearAll as jest.Mock).mock.invocationCallOrder[0]!;
    expect(logoutOrder).toBeLessThan(clearOrder);
    expect(deps.csrf.invalidate).toHaveBeenCalled();
    expect(deps.realtime.stop).toHaveBeenCalled();
    expect(deps.queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(deps.persister.removeClient).toHaveBeenCalled();
    expect(deps.profileCache.load()).toBeNull();
    expect(deps.store.getState()).toMatchObject({ status: 'unauthenticated', expired: false });
  });

  it('purge l’état local même si l’appel au backend échoue', async () => {
    const deps = setup(
      jest.fn(async () => {
        throw new Error('réseau');
      }),
    );

    await performLogout(deps);

    expect(deps.cookies.clearAll).toHaveBeenCalled();
    expect(deps.store.getState().status).toBe('unauthenticated');
  });

  it('en cas d’expiration, n’appelle pas le backend et signale l’expiration', async () => {
    const deps = setup();

    await performLogout(deps, { expired: true, remote: false });

    expect(deps.callLogout).not.toHaveBeenCalled();
    expect(deps.store.getState()).toMatchObject({ status: 'unauthenticated', expired: true });
  });
});
