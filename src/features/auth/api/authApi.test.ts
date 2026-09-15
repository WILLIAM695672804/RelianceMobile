import axios, { type AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import loginSuccess from '@/test/fixtures/auth/login-success.json';
import me from '@/test/fixtures/auth/me.json';

import {
  disableTwoFactor,
  enableTwoFactor,
  fetchAccount,
  forgotPassword,
  generateTwoFactor,
  login,
  register,
  resendVerification,
  resetPassword,
} from './authApi';

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(client);
  const lastBody = (method: 'post' | 'get') =>
    JSON.parse((mock.history[method].at(-1)?.data as string) ?? 'null');
  return { client, mock, lastBody };
}

describe('authApi', () => {
  it('login envoie les identifiants et renvoie l’utilisateur de session', async () => {
    const { client, mock, lastBody } = setup();
    mock.onPost('/auth/login').reply(200, loginSuccess);

    const user = await login(client, { email: 'technicien@example.test', password: 'secret' });

    expect(lastBody('post')).toEqual({ email: 'technicien@example.test', password: 'secret' });
    expect(user).toMatchObject({ role: 'technicien', email: 'technicien@example.test' });
  });

  it('login transmet le code 2FA lorsqu’il est fourni', async () => {
    const { client, mock, lastBody } = setup();
    mock.onPost('/auth/login').reply(200, loginSuccess);

    await login(client, { email: 'a@example.test', password: 'secret', code: '123456' });

    expect(lastBody('post')).toEqual({
      email: 'a@example.test',
      password: 'secret',
      code: '123456',
    });
  });

  it('login rejette une réponse non conforme en contract', async () => {
    const { client, mock } = setup();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mock.onPost('/auth/login').reply(200, { message: 'ok' });

    await expect(login(client, { email: 'a@example.test', password: 'x' })).rejects.toMatchObject({
      kind: 'contract',
    });
    jest.restoreAllMocks();
  });

  it('register envoie le corps d’inscription', async () => {
    const { client, mock, lastBody } = setup();
    mock.onPost('/auth/register').reply(201, { ...loginSuccess, message: 'Inscription réussie' });
    const payload = {
      role: 'client' as const,
      name: 'Awa',
      email: 'awa@example.test',
      password: 'motdepasse',
      password_confirmation: 'motdepasse',
    };

    const user = await register(client, payload);

    expect(lastBody('post')).toEqual(payload);
    expect(user.id).toBe(loginSuccess.user.id);
  });

  it('fetchAccount lit /auth/me', async () => {
    const { client, mock } = setup();
    mock.onGet('/auth/me').reply(200, me);

    await expect(fetchAccount(client)).resolves.toMatchObject({ email: 'technicien@example.test' });
  });

  type MessageCall = (client: AxiosInstance, ...args: unknown[]) => Promise<string>;
  const resetBody = {
    token: 't',
    email: 'awa@example.test',
    password: 'motdepasse',
    password_confirmation: 'motdepasse',
  };

  it.each<[string, MessageCall, unknown[], object]>([
    [
      '/auth/forgot-password',
      forgotPassword as MessageCall,
      ['awa@example.test'],
      { email: 'awa@example.test' },
    ],
    ['/auth/reset-password', resetPassword as MessageCall, [resetBody], resetBody],
    ['/auth/2fa/enable', enableTwoFactor as MessageCall, ['123456'], { code: '123456' }],
    ['/auth/2fa/disable', disableTwoFactor as MessageCall, ['123456'], { code: '123456' }],
  ])('POST %s transmet le corps et renvoie le message', async (url, call, args, body) => {
    const { client, mock, lastBody } = setup();
    mock.onPost(url).reply(200, { message: 'Fait.' });

    await expect(call(client, ...args)).resolves.toBe('Fait.');
    expect(lastBody('post')).toEqual(body);
  });

  it('resendVerification poste sur la route de notification', async () => {
    const { client, mock } = setup();
    mock
      .onPost('/auth/email/verification-notification')
      .reply(200, { message: 'Email de vérification renvoyé' });

    await expect(resendVerification(client)).resolves.toBe('Email de vérification renvoyé');
  });

  it('generateTwoFactor renvoie le secret et le QR code', async () => {
    const { client, mock } = setup();
    mock.onPost('/auth/2fa/generate').reply(200, { secret: 'ABC', qr_code_svg: '<svg/>' });

    await expect(generateTwoFactor(client)).resolves.toEqual({
      secret: 'ABC',
      qr_code_svg: '<svg/>',
    });
  });
});
