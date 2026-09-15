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

describe('createSessionStore', () => {
  it('démarre en statut unknown', () => {
    expect(createSessionStore().getState()).toMatchObject({
      status: 'unknown',
      user: null,
      expired: false,
    });
  });

  it('passe en authenticated et efface le signalement d’expiration', () => {
    const store = createSessionStore();
    store.getState().setUnauthenticated({ expired: true });
    store.getState().setAuthenticated(user);
    expect(store.getState()).toMatchObject({ status: 'authenticated', user, expired: false });
  });

  it('passe en degraded avec le profil en cache', () => {
    const store = createSessionStore();
    store.getState().setDegraded(user);
    expect(store.getState()).toMatchObject({ status: 'degraded', user });
  });

  it('passe en unauthenticated en signalant ou non l’expiration', () => {
    const store = createSessionStore();
    store.getState().setAuthenticated(user);
    store.getState().setUnauthenticated({ expired: true });
    expect(store.getState()).toMatchObject({
      status: 'unauthenticated',
      user: null,
      expired: true,
    });

    store.getState().setUnauthenticated();
    expect(store.getState().expired).toBe(false);
  });

  it('acquitte le signalement d’expiration', () => {
    const store = createSessionStore();
    store.getState().setUnauthenticated({ expired: true });
    store.getState().acknowledgeExpiry();
    expect(store.getState().expired).toBe(false);
  });
});
