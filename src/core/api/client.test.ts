import axios, { AxiosHeaders, type AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { testEnv } from '@/test/fixtures/env';

import { createApiClient, createCsrfCookieFetcher } from './client';

const header = (config: AxiosRequestConfig | undefined, name: string) =>
  AxiosHeaders.from(config?.headers as AxiosHeaders).get(name);

function setup() {
  const csrf = { getToken: jest.fn(async () => 'jeton-csrf'), invalidate: jest.fn() };
  const onUnauthenticated = jest.fn();
  const client = createApiClient({ env: testEnv, csrf, onUnauthenticated });
  const mock = new MockAdapter(client);
  return { client, mock, csrf, onUnauthenticated };
}

describe('createApiClient', () => {
  it('configure la base, les cookies et les en-têtes stateful sans jeton CSRF en lecture', async () => {
    const { client, mock, csrf } = setup();
    let captured: AxiosRequestConfig | undefined;
    mock.onGet('/jobs').reply((config) => {
      captured = config;
      return [200, { data: [] }];
    });

    await client.get('/jobs');

    expect(captured?.baseURL).toBe('http://api.test/api/v1');
    expect(captured?.withCredentials).toBe(true);
    expect(header(captured, 'Accept')).toBe('application/json');
    expect(header(captured, 'Origin')).toBe('http://mobile.reliance.local');
    expect(header(captured, 'Referer')).toBe('http://mobile.reliance.local/');
    expect(header(captured, 'X-XSRF-TOKEN')).toBeUndefined();
    expect(csrf.getToken).not.toHaveBeenCalled();
  });

  it.each(['post', 'put', 'patch', 'delete'] as const)(
    'ajoute X-XSRF-TOKEN aux requêtes %s',
    async (method) => {
      const { client, mock } = setup();
      let captured: AxiosRequestConfig | undefined;
      mock.onAny('/requests').reply((config) => {
        captured = config;
        return [200, {}];
      });

      await client.request({ method, url: '/requests' });

      expect(header(captured, 'X-XSRF-TOKEN')).toBe('jeton-csrf');
    },
  );

  it('rejoue une seule fois une requête rejetée en 419 après invalidation du CSRF', async () => {
    const { client, mock, csrf } = setup();
    mock.onPost('/requests').replyOnce(419).onPost('/requests').replyOnce(201, { id: 'r1' });

    const response = await client.post('/requests', { title: 'Fuite' });

    expect(response.data).toEqual({ id: 'r1' });
    expect(csrf.invalidate).toHaveBeenCalledTimes(1);
    expect(csrf.getToken).toHaveBeenCalledTimes(2);
    expect(mock.history.post).toHaveLength(2);
  });

  it('rejette en csrf si le rejeu échoue encore en 419', async () => {
    const { client, mock, csrf } = setup();
    mock.onPost('/requests').reply(419);

    await expect(client.post('/requests')).rejects.toMatchObject({ kind: 'csrf', status: 419 });
    expect(csrf.invalidate).toHaveBeenCalledTimes(1);
    expect(mock.history.post).toHaveLength(2);
  });

  it('signale l’expiration de session sur une 401 ordinaire', async () => {
    const { client, mock, onUnauthenticated } = setup();
    mock.onGet('/jobs').reply(401, { message: 'Unauthenticated.' });

    await expect(client.get('/jobs')).rejects.toMatchObject({ kind: 'unauthenticated' });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['get', '/auth/me'],
    ['post', '/auth/login'],
  ] as const)('ne signale pas d’expiration sur une 401 de %s %s', async (method, url) => {
    const { client, mock, onUnauthenticated } = setup();
    mock.onAny(url).reply(401, { message: 'Identifiants invalides' });

    await expect(client.request({ method, url })).rejects.toMatchObject({
      kind: 'unauthenticated',
    });
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it('rejette une 422 en validation avec ses erreurs de champ', async () => {
    const { client, mock } = setup();
    mock.onPost('/auth/register').reply(422, { errors: { email: ['pris'] } });

    await expect(client.post('/auth/register')).rejects.toMatchObject({
      kind: 'validation',
      fieldErrors: { email: ['pris'] },
    });
  });

  it('rejette une coupure réseau en network et un dépassement de délai en timeout', async () => {
    const { client, mock } = setup();
    mock.onGet('/reseau').networkError().onGet('/lent').timeout();

    await expect(client.get('/reseau')).rejects.toMatchObject({ kind: 'network' });
    await expect(client.get('/lent')).rejects.toMatchObject({ kind: 'timeout' });
  });
});

describe('createCsrfCookieFetcher', () => {
  it('appelle /sanctum/csrf-cookie avec les en-têtes stateful', async () => {
    const http = axios.create();
    const mock = new MockAdapter(http);
    let captured: AxiosRequestConfig | undefined;
    mock.onGet('http://api.test/sanctum/csrf-cookie').reply((config) => {
      captured = config;
      return [204];
    });

    await createCsrfCookieFetcher(testEnv, http)();

    expect(captured?.withCredentials).toBe(true);
    expect(header(captured, 'Origin')).toBe('http://mobile.reliance.local');
    expect(header(captured, 'Accept')).toBe('application/json');
  });
});
