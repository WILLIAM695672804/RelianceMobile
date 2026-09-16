import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';
import * as ImagePicker from 'expo-image-picker';

import { createSessionStore } from '@/core/session';
import me from '@/test/fixtures/auth/me.json';
import avatarUpdated from '@/test/fixtures/profile/avatar-updated.json';
import profileUpdated from '@/test/fixtures/profile/profile-updated.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { createTestProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { EditProfileScreen } from './EditProfileScreen';

async function setup() {
  const sessionStore = createSessionStore();
  sessionStore
    .getState()
    .setAuthenticated(
      buildSessionUser('technicien', { name: 'Technicien Démo', email: 'technicien@example.test' }),
    );
  const providers = createTestProviders({ sessionStore, translations: [profileTranslations] });
  const mock = new MockAdapter(providers.api);
  mock.onGet('/auth/me').reply(200, me);
  const onDone = jest.fn();
  await render(<EditProfileScreen onDone={onDone} />, { wrapper: providers.TestProviders });
  await screen.findByDisplayValue('Technicien Démo');
  return { ...providers, mock, onDone, user: userEvent.setup() };
}

const save = () => screen.getByRole('button', { name: 'Enregistrer' });

describe('EditProfileScreen (E09)', () => {
  it('n’envoie que les champs modifiés puis revient au profil', async () => {
    const { mock, onDone, sessionActions, user } = await setup();
    mock.onPut('/auth/profile').reply(200, profileUpdated);

    await fireEvent.changeText(screen.getByLabelText('Téléphone'), '690000000');
    await user.press(save());

    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    expect(JSON.parse(mock.history.put[0]?.data as string)).toEqual({ phone: '690000000' });
    expect(sessionActions.signIn).toHaveBeenCalledTimes(1);
  });

  it('n’appelle pas le serveur sans modification', async () => {
    const { mock, user } = await setup();

    await user.press(save());

    expect(await screen.findByText('Aucune modification à enregistrer.')).toBeOnTheScreen();
    expect(mock.history.put).toHaveLength(0);
  });

  it('affiche l’erreur de champ renvoyée par le serveur', async () => {
    const { mock, onDone, user } = await setup();
    mock.onPut('/auth/profile').reply(422, {
      message: 'The email has already been taken.',
      errors: { email: ['The email has already been taken.'] },
    });

    await fireEvent.changeText(screen.getByLabelText('Adresse électronique'), 'pris@example.test');
    await user.press(save());

    expect(await screen.findByText('The email has already been taken.')).toBeOnTheScreen();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('envoie la photo choisie dans la galerie', async () => {
    const { mock, sessionActions, user } = await setup();
    mock.onPost('/auth/profile/avatar').reply(200, avatarUpdated);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [
        {
          uri: 'file:///cache/a.png',
          fileName: 'a.png',
          mimeType: 'image/png',
          width: 1,
          height: 1,
        },
      ],
    } as ImagePicker.ImagePickerResult);

    await user.press(screen.getByRole('button', { name: 'Choisir une photo' }));

    expect(await screen.findByText('Photo de profil mise à jour.')).toBeOnTheScreen();
    expect(sessionActions.signIn).toHaveBeenCalledWith(
      expect.objectContaining({ avatarUrl: avatarUpdated.avatar_url }),
    );
  });

  it('signale le refus d’accès à l’appareil photo', async () => {
    const { mock, user } = await setup();
    jest
      .mocked(ImagePicker.requestCameraPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as ImagePicker.CameraPermissionResponse);

    await user.press(screen.getByRole('button', { name: 'Prendre une photo' }));

    expect(
      await screen.findByText('Autorisation refusée : activez-la dans les réglages de l’appareil.'),
    ).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });
});
