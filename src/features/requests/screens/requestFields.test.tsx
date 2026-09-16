import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import type { ReactElement } from 'react';
import { Linking } from 'react-native';

import skills from '@/test/fixtures/profile/skills.json';
import { renderWithProviders } from '@/test/render';

import { requestsTranslations } from '../i18n';
import { CategoryField } from './CategoryField';
import { PhotoField } from './PhotoField';
import { PlaceField } from './PlaceField';

const photo = { uri: 'file:///cache/fuite.jpg', name: 'fuite.jpg', type: 'image/jpeg' };
const otherPhoto = { uri: 'file:///cache/evier.jpg', name: 'evier.jpg', type: 'image/jpeg' };

async function renderField(ui: ReactElement) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  new MockAdapter(api).onGet('/skills').reply(200, skills);
  await renderWithProviders(ui, { api, translations: [requestsTranslations] });
  return userEvent.setup();
}

describe('CategoryField', () => {
  it('déroule le catalogue groupé et retient la compétence choisie', async () => {
    const onChange = jest.fn();
    const user = await renderField(<CategoryField value="" onChange={onChange} />);

    await user.press(screen.getByRole('button', { name: 'Choisir une catégorie' }));
    expect(await screen.findByText('Électricité')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Dépannage électrique' }));

    expect(onChange).toHaveBeenCalledWith('depannage-electrique');
    expect(screen.queryByText('Électricité')).not.toBeOnTheScreen();
  });

  it('affiche la compétence retenue et l’erreur du champ', async () => {
    await renderField(
      <CategoryField
        value="depannage-electrique"
        onChange={jest.fn()}
        error="Choisissez une catégorie."
      />,
    );

    expect(await screen.findByRole('button', { name: 'Dépannage électrique' })).toBeOnTheScreen();
    expect(screen.getByText('Choisissez une catégorie.')).toBeOnTheScreen();
  });
});

describe('PhotoField', () => {
  it('ajoute une photo de la galerie', async () => {
    const onChange = jest.fn();
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file:///cache/fuite.jpg', width: 1, height: 1 }],
    } as ImagePicker.ImagePickerResult);
    const user = await renderField(<PhotoField value={[otherPhoto]} onChange={onChange} />);

    await user.press(screen.getByRole('button', { name: 'Ajouter depuis la galerie' }));

    expect(onChange).toHaveBeenCalledWith([otherPhoto, photo]);
  });

  it('retire une photo', async () => {
    const onChange = jest.fn();
    const user = await renderField(<PhotoField value={[photo, otherPhoto]} onChange={onChange} />);

    await user.press(screen.getByRole('button', { name: 'Retirer la photo 1' }));

    expect(onChange).toHaveBeenCalledWith([otherPhoto]);
  });

  it('désactive l’ajout à cinq photos', async () => {
    await renderField(
      <PhotoField value={Array.from({ length: 5 }, () => photo)} onChange={jest.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Prendre une photo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Ajouter depuis la galerie' })).toBeDisabled();
  });

  it('explique le refus de l’appareil photo et ouvre les réglages', async () => {
    jest
      .mocked(ImagePicker.requestCameraPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as ImagePicker.CameraPermissionResponse);
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    const user = await renderField(
      <PhotoField value={[]} onChange={jest.fn()} error="Ajoutez au moins une photo." />,
    );

    await user.press(screen.getByRole('button', { name: 'Prendre une photo' }));
    expect(
      await screen.findByText(
        'L’accès à l’appareil photo a été refusé. Autorisez-le dans les réglages pour photographier le problème.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText('Ajoutez au moins une photo.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Ouvrir les réglages' }));

    expect(openSettings).toHaveBeenCalledTimes(1);
    openSettings.mockRestore();
  });
});

describe('PlaceField', () => {
  it('retient la position de l’appareil', async () => {
    const onChange = jest.fn();
    const user = await renderField(<PlaceField value={null} onChange={onChange} />);

    await user.press(screen.getByRole('button', { name: 'Utiliser ma position' }));

    expect(onChange).toHaveBeenCalledWith({
      latitude: 3.848,
      longitude: 11.5021,
      label: 'Rue de la démonstration, Yaoundé',
      city: 'Yaoundé',
    });
  });

  it('affiche le lieu retenu', async () => {
    await renderField(
      <PlaceField
        value={{ latitude: 1, longitude: 2, label: 'Akwa, Douala', city: null }}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Position retenue : Akwa, Douala')).toBeOnTheScreen();
  });

  it('localise une adresse saisie ou signale qu’elle est introuvable', async () => {
    const onChange = jest.fn();
    const user = await renderField(<PlaceField value={null} onChange={onChange} />);

    await fireEvent.changeText(screen.getByLabelText('Adresse'), 'Akwa, Douala');
    await user.press(screen.getByRole('button', { name: 'Localiser cette adresse' }));
    expect(onChange).toHaveBeenCalledWith({
      latitude: 4.0511,
      longitude: 9.7679,
      label: 'Akwa, Douala',
      city: null,
    });

    jest.mocked(Location.geocodeAsync).mockResolvedValueOnce([]);
    await user.press(screen.getByRole('button', { name: 'Localiser cette adresse' }));
    expect(
      await screen.findByText('Adresse introuvable. Précisez-la ou utilisez votre position.'),
    ).toBeOnTheScreen();
  });

  it('explique le refus d’accès à la position', async () => {
    jest
      .mocked(Location.requestForegroundPermissionsAsync)
      .mockResolvedValueOnce({ granted: false } as Location.LocationPermissionResponse);
    const user = await renderField(<PlaceField value={null} onChange={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Utiliser ma position' }));

    expect(
      await screen.findByText(
        'L’accès à la position a été refusé. Autorisez-le dans les réglages ou saisissez une adresse.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ouvrir les réglages' })).toBeOnTheScreen();
  });

  it('signale une position indisponible', async () => {
    jest.mocked(Location.getCurrentPositionAsync).mockRejectedValueOnce(new Error('désactivée'));
    const user = await renderField(<PlaceField value={null} onChange={jest.fn()} />);

    await user.press(screen.getByRole('button', { name: 'Utiliser ma position' }));

    expect(
      await screen.findByText('Position indisponible. Vérifiez que la localisation est activée.'),
    ).toBeOnTheScreen();
  });
});
