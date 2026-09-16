import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as ImagePicker from 'expo-image-picker';

import kycUploaded from '@/test/fixtures/kyc/kyc-uploaded.json';
import { renderWithProviders } from '@/test/render';

import { kycTranslations } from '../i18n';
import { KycScreen } from './KycScreen';

const documents = [
  {
    id: 'k1',
    type: 'cni',
    status: 'rejected',
    rejection_reason: 'Document illisible',
    url: 'http://api.test/storage/kyc/cni.png',
    created_at: '2026-09-16T10:00:00.000000Z',
  },
  {
    id: 'k2',
    type: 'photo',
    status: 'approved',
    rejection_reason: null,
    url: 'http://api.test/storage/kyc/photo.png',
    created_at: '2026-09-16T10:00:00.000000Z',
  },
];

async function setup() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/auth/kyc/mine').reply(200, documents);
  const rendered = await renderWithProviders(<KycScreen />, {
    api,
    translations: [kycTranslations],
  });
  await screen.findByText('Carte nationale d’identité');
  return { ...rendered, mock, user: userEvent.setup() };
}

describe('KycScreen', () => {
  it('présente l’état de chaque justificatif', async () => {
    await setup();

    expect(screen.getByText('Refusé')).toBeOnTheScreen();
    expect(screen.getByText('Motif : Document illisible')).toBeOnTheScreen();
    expect(screen.getByText('Validé')).toBeOnTheScreen();
    expect(screen.getAllByText('À fournir')).toHaveLength(2);
    expect(
      screen.queryByRole('button', { name: 'Photographier : Photo portrait' }),
    ).not.toBeOnTheScreen();
  });

  it('envoie un justificatif choisi dans la galerie', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/kyc/upload').reply(200, kycUploaded);
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///cache/casier.jpg', width: 1, height: 1 }],
    } as ImagePicker.ImagePickerResult);

    await user.press(
      screen.getByRole('button', { name: 'Choisir une image : Extrait de casier judiciaire' }),
    );

    expect(await screen.findByText('Justificatif envoyé.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(1);
    await waitFor(() => expect(mock.history.get.length).toBeGreaterThanOrEqual(2));
  });

  it('signale le refus d’accès à l’appareil photo', async () => {
    const { mock, user } = await setup();
    jest
      .mocked(ImagePicker.requestCameraPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as ImagePicker.CameraPermissionResponse);

    await user.press(
      screen.getByRole('button', { name: 'Photographier : Carte nationale d’identité' }),
    );

    expect(
      await screen.findByText('Autorisation refusée : activez-la dans les réglages de l’appareil.'),
    ).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });

  it('affiche l’erreur de fichier renvoyée par le serveur', async () => {
    const { mock, user } = await setup();
    mock.onPost('/auth/kyc/upload').reply(422, {
      message: 'The document field must not be greater than 5120 kilobytes.',
      errors: { document: ['The document field must not be greater than 5120 kilobytes.'] },
    });
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///cache/cert.jpg', width: 1, height: 1 }],
    } as ImagePicker.ImagePickerResult);

    await user.press(
      screen.getByRole('button', { name: 'Photographier : Certificats professionnels' }),
    );

    expect(
      await screen.findByText('The document field must not be greater than 5120 kilobytes.'),
    ).toBeOnTheScreen();
  });
});
