import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as ImagePicker from 'expo-image-picker';

import kycMine from '@/test/fixtures/kyc/kyc-mine.json';
import kycUploaded from '@/test/fixtures/kyc/kyc-uploaded.json';
import { renderWithProviders } from '@/test/render';

import { kycTranslations } from '../i18n';
import type { KycItem } from '../model/kycOverview';
import { KycContainer, remainingShots } from './KycContainer';

const item = (type: KycItem['type'], status: KycItem['status']): KycItem => ({
  type,
  status,
  rejectionReason: null,
  document: null,
});

describe('remainingShots', () => {
  it('enchaîne recto, verso, selfie puis justificatifs manquants', () => {
    const all = (['cni', 'casier', 'cert', 'photo'] as const).map((type) => item(type, 'missing'));
    expect(remainingShots(all, 2)).toEqual(['front', 'back', 'selfie', 'casier', 'cert']);
    expect(remainingShots(all, 1)).toEqual(['front', 'selfie', 'casier', 'cert']);
  });

  it('ne redemande que les pièces refusées ou absentes', () => {
    expect(
      remainingShots(
        [
          item('cni', 'approved'),
          item('photo', 'rejected'),
          item('casier', 'pending'),
          item('cert', 'pending'),
        ],
        2,
      ),
    ).toEqual(['selfie']);
  });
});

function picked(uri: string) {
  return {
    canceled: false,
    assets: [{ uri, width: 1, height: 1 }],
  } as ImagePicker.ImagePickerResult;
}

describe('KycContainer', () => {
  it('dépose le passeport, puis présente le suivi des pièces', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock.onGet('/auth/kyc/mine').reply(200, []);
    mock.onPost('/auth/kyc/upload').reply(200, kycUploaded);
    await renderWithProviders(<KycContainer onBack={jest.fn()} onDone={jest.fn()} />, {
      api,
      translations: [kycTranslations],
    });
    const user = userEvent.setup();
    jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValue(picked('file:///cache/doc.jpg'));
    jest
      .mocked(ImagePicker.launchImageLibraryAsync)
      .mockResolvedValue(picked('file:///cache/scan.jpg'));

    await user.press(await screen.findByRole('button', { name: 'Passeport' }));
    for (let index = 0; index < 4; index += 1) {
      await user.press(await screen.findByRole('button', { name: /Prendre/ }));
      await user.press(await screen.findByRole('button', { name: 'Utiliser' }));
      await waitFor(() => expect(mock.history.post).toHaveLength(index + 1));
    }

    // Recto du passeport, selfie, casier, certificat.
    expect(mock.history.post).toHaveLength(4);
  });

  it('présente le suivi lorsque des pièces sont déjà déposées', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    new MockAdapter(api).onGet('/auth/kyc/mine').reply(200, kycMine);
    await renderWithProviders(<KycContainer onBack={jest.fn()} onDone={jest.fn()} />, {
      api,
      translations: [kycTranslations],
    });
    expect(await screen.findByText('Carte nationale d’identité')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Continuer en mode limité' })).toBeOnTheScreen();
  });
});
