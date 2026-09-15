import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import loginSuccess from '@/test/fixtures/auth/login-success.json';
import me from '@/test/fixtures/auth/me.json';
import { createTestProviders } from '@/test/render';

import { authKeys } from './authKeys';
import { useAccount } from './useAccount';
import {
  useDisableTwoFactor,
  useEnableTwoFactor,
  useForgotPassword,
  useLogin,
  useLogout,
  useRegister,
} from './useAuthMutations';

function setup() {
  const providers = createTestProviders();
  const mock = new MockAdapter(providers.api);
  return { ...providers, mock, wrapper: providers.TestProviders };
}

describe('hooks auth', () => {
  it('authKeys hiérarchise les clés sous « auth »', () => {
    expect(authKeys.account()).toEqual(['auth', 'account']);
  });

  it('useAccount lit le compte courant', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/auth/me').reply(200, me);

    const { result } = await renderHook(() => useAccount(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.email).toBe('technicien@example.test');
  });

  it('useLogin enregistre l’utilisateur dans la session', async () => {
    const { mock, wrapper, sessionActions } = setup();
    mock.onPost('/auth/login').reply(200, loginSuccess);

    const { result } = await renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ email: 'technicien@example.test', password: 'secret' });
    });

    expect(sessionActions.signIn).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'technicien' }),
    );
  });

  it('useLogin n’ouvre pas de session en cas d’échec', async () => {
    const { mock, wrapper, sessionActions } = setup();
    mock.onPost('/auth/login').reply(401, { message: 'Identifiants invalides' });

    const { result } = await renderHook(() => useLogin(), { wrapper });
    await act(async () => {
      await result.current
        .mutateAsync({ email: 'a@example.test', password: 'x' })
        .catch(() => undefined);
    });

    expect(sessionActions.signIn).not.toHaveBeenCalled();
  });

  it('useRegister enregistre l’utilisateur inscrit', async () => {
    const { mock, wrapper, sessionActions } = setup();
    mock.onPost('/auth/register').reply(201, { ...loginSuccess, message: 'Inscription réussie' });

    const { result } = await renderHook(() => useRegister(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        role: 'client',
        name: 'Awa',
        email: 'awa@example.test',
        password: 'motdepasse',
        password_confirmation: 'motdepasse',
      });
    });

    expect(sessionActions.signIn).toHaveBeenCalledTimes(1);
  });

  it('useLogout délègue à la session', async () => {
    const { wrapper, sessionActions } = setup();

    const { result } = await renderHook(() => useLogout(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(sessionActions.logout).toHaveBeenCalledTimes(1);
  });

  it('useForgotPassword renvoie le message du serveur', async () => {
    const { mock, wrapper } = setup();
    mock
      .onPost('/auth/forgot-password')
      .reply(200, { message: 'Lien de réinitialisation envoyé par email.' });

    const { result } = await renderHook(() => useForgotPassword(), { wrapper });
    let message = '';
    await act(async () => {
      message = await result.current.mutateAsync('awa@example.test');
    });

    expect(message).toBe('Lien de réinitialisation envoyé par email.');
  });

  it.each([
    ['/auth/2fa/enable', useEnableTwoFactor],
    ['/auth/2fa/disable', useDisableTwoFactor],
  ] as const)('invalide le compte après POST %s', async (url, useHook) => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost(url).reply(200, { message: 'Fait.' });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useHook(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('123456');
    });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: authKeys.account() });
  });
});
