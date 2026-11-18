import axios, { AxiosHeaders } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import type { CookieReader } from '@/core/api';
import type { RealtimeClientDeps } from '@/core/realtime';
import { createMemoryStore } from '@/core/storage';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import { testEnv } from '@/test/fixtures/env';
import { buildApiUser, buildSessionUser } from '@/test/fixtures/users';

import { createServices } from './createServices';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function setup() {
  const fake = createFakeRealtimeClient();
  let realtimeDeps: RealtimeClientDeps | undefined;
  const realtimeFactory = jest.fn((deps: RealtimeClientDeps) => {
    realtimeDeps = deps;
    return fake.client;
  });
  const cookies: CookieReader = {
    get: jest.fn(async () => 'jeton%3D'),
    flush: jest.fn(async () => undefined),
    clearAll: jest.fn(async () => undefined),
  };
  const csrfHttp = axios.create();
  new MockAdapter(csrfHttp).onGet('http://api.test/sanctum/csrf-cookie').reply(204);

  const services = createServices({
    env: testEnv,
    cookies,
    sessionStorage: createMemoryStore(),
    cacheStorage: createMemoryStore(),
    appVersion: '0.1.0',
    language: 'fr',
    realtimeFactory,
    csrfHttp,
  });
  const api = new MockAdapter(services.api);
  return { services, api, cookies, fake, realtimeFactory, getRealtimeDeps: () => realtimeDeps };
}

describe('createServices', () => {
  it('restaure la session et démarre le temps réel', async () => {
    const { services, api, realtimeFactory } = setup();
    api.onGet('/auth/me').reply(200, { user: buildApiUser('technicien') });

    await expect(services.sessionActions.restore()).resolves.toBe('authenticated');

    expect(services.sessionStore.getState().user?.role).toBe('technicien');
    expect(realtimeFactory).toHaveBeenCalledTimes(1);
  });

  it('signIn enregistre le profil et démarre le temps réel', () => {
    const { services, realtimeFactory } = setup();

    services.sessionActions.signIn(buildSessionUser('client'));

    expect(services.profileCache.load()?.role).toBe('client');
    expect(services.sessionStore.getState().status).toBe('authenticated');
    expect(realtimeFactory).toHaveBeenCalledTimes(1);
  });

  it('signIn écrit sans délai les cookies de session sur disque', () => {
    const { services, cookies } = setup();

    services.sessionActions.signIn(buildSessionUser('client'));

    expect(cookies.flush).toHaveBeenCalledTimes(1);
  });

  it('ouvre la session même si le temps réel ne démarre pas', () => {
    const { services, realtimeFactory } = setup();
    realtimeFactory.mockImplementationOnce(() => {
      throw new TypeError('Object cannot be used as a constructor.');
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(() => services.sessionActions.signIn(buildSessionUser('technicien'))).not.toThrow();

    expect(services.sessionStore.getState().status).toBe('authenticated');
    expect(warn).toHaveBeenCalledWith('[temps réel] démarrage impossible', expect.any(TypeError));
    warn.mockRestore();
  });

  it('expire la session une seule fois sur des 401 concurrentes', async () => {
    const { services, api, cookies, fake } = setup();
    services.sessionActions.signIn(buildSessionUser('client'));
    api.onGet('/jobs').reply(401);

    await Promise.allSettled([services.api.get('/jobs'), services.api.get('/jobs')]);
    await flush();

    expect(services.sessionStore.getState()).toMatchObject({
      status: 'unauthenticated',
      expired: true,
    });
    expect(cookies.clearAll).toHaveBeenCalledTimes(1);
    expect(fake.client.connection.disconnect).toHaveBeenCalledTimes(1);
  });

  it('logout appelle le backend avec le jeton CSRF puis purge la session', async () => {
    const { services, api, cookies } = setup();
    services.sessionActions.signIn(buildSessionUser('agence'));
    api.onPost('/auth/logout').reply(200, { message: 'Déconnexion réussie' });

    await services.sessionActions.logout();

    expect(
      AxiosHeaders.from(api.history.post[0]?.headers as AxiosHeaders).get('X-XSRF-TOKEN'),
    ).toBe('jeton=');
    expect(cookies.clearAll).toHaveBeenCalled();
    expect(services.sessionStore.getState()).toMatchObject({
      status: 'unauthenticated',
      expired: false,
    });
  });

  it('autorise les canaux privés via /broadcasting/auth', async () => {
    const { services, api, getRealtimeDeps } = setup();
    services.sessionActions.signIn(buildSessionUser('client'));
    api.onPost('http://api.test/broadcasting/auth').reply(200, { auth: 'reliance-key:signature' });

    await expect(getRealtimeDeps()?.authorize('1.2', 'private-user.user-client')).resolves.toEqual({
      auth: 'reliance-key:signature',
    });
    expect(JSON.parse(api.history.post[0]?.data as string)).toEqual({
      socket_id: '1.2',
      channel_name: 'private-user.user-client',
    });
  });
});
