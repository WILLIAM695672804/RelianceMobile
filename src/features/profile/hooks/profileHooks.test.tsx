import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { apiUserSchema, createSessionStore } from '@/core/session';
import { authKeys } from '@/features/auth';
import avatarUpdated from '@/test/fixtures/profile/avatar-updated.json';
import locations from '@/test/fixtures/profile/locations.json';
import profileUpdated from '@/test/fixtures/profile/profile-updated.json';
import { buildApiUser, buildSessionUser } from '@/test/fixtures/users';
import { createTestProviders } from '@/test/render';

import { profileKeys } from './profileKeys';
import { applyProfileToSession } from './sessionSync';
import { useDeleteLocation, useLocations } from './useLocations';
import { useChangePassword, useUpdateProfile, useUploadAvatar } from './useProfileMutations';

function setup() {
  const sessionStore = createSessionStore();
  sessionStore.getState().setAuthenticated(buildSessionUser('technicien', { avatarUrl: null }));
  const providers = createTestProviders({ sessionStore });
  const mock = new MockAdapter(providers.api);
  return { ...providers, mock, wrapper: providers.TestProviders };
}

describe('applyProfileToSession', () => {
  it('reporte nom, courriel, vérification et avatar sans toucher au rôle', () => {
    const current = buildSessionUser('technicien', { avatarUrl: 'http://api.test/storage/a.png' });
    const user = apiUserSchema.parse(
      buildApiUser('client', {
        name: 'Awa Diallo',
        email: 'awa@example.test',
        email_verified_at: null,
        avatar_url: null,
        roles: undefined,
      }),
    );

    expect(applyProfileToSession(current, user)).toEqual({
      ...current,
      name: 'Awa Diallo',
      email: 'awa@example.test',
      emailVerified: false,
    });
  });
});

describe('hooks du profil', () => {
  it('profileKeys hiérarchise les clés sous « profile »', () => {
    expect(profileKeys.locations()).toEqual(['profile', 'locations']);
  });

  it('useUpdateProfile met à jour la session et invalide le compte', async () => {
    const { mock, wrapper, sessionActions, queryClient } = setup();
    mock.onPut('/auth/profile').reply(200, profileUpdated);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useUpdateProfile(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ name: 'Technicien Démo' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sessionActions.signIn).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'technicien', name: 'Technicien Démo' }),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: authKeys.account() });
  });

  it('useUploadAvatar reporte la nouvelle URL dans la session', async () => {
    const { mock, wrapper, sessionActions } = setup();
    mock.onPost('/auth/profile/avatar').reply(200, avatarUpdated);

    const { result } = await renderHook(() => useUploadAvatar(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({ uri: 'file:///a.png', name: 'a.png', type: 'image/png' });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sessionActions.signIn).toHaveBeenCalledWith(
      expect.objectContaining({ avatarUrl: avatarUpdated.avatar_url }),
    );
  });

  it('useChangePassword ne modifie pas la session', async () => {
    const { mock, wrapper, sessionActions } = setup();
    mock
      .onPut('/auth/profile/password')
      .reply(200, { message: 'Mot de passe modifié avec succès.' });

    const { result } = await renderHook(() => useChangePassword(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync({
        current_password: 'ancien-mdp',
        new_password: 'nouveau-mdp',
        new_password_confirmation: 'nouveau-mdp',
      });
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sessionActions.signIn).not.toHaveBeenCalled();
  });

  it('useLocations lit les adresses', async () => {
    const { mock, wrapper } = setup();
    mock.onGet('/locations').reply(200, locations);

    const { result } = await renderHook(() => useLocations(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(locations.length);
  });

  it('useDeleteLocation invalide la liste des adresses', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onDelete('/locations/l1').reply(200, { message: 'Adresse supprimée' });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = await renderHook(() => useDeleteLocation(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync('l1');
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: profileKeys.locations() });
  });
});
