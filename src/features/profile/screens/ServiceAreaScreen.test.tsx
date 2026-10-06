import { fireEvent, screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import identity from '@/test/fixtures/technician/identity.json';
import locationUpdated from '@/test/fixtures/technician/location-updated.json';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { ServiceAreaScreen } from './ServiceAreaScreen';

const NBSP = ' ';

/** Profil sans position enregistrée : le formulaire doit exiger une localisation. */
const withoutPosition = {
  ...identity,
  data: {
    ...identity.data,
    service_perimeter: { ...identity.data.service_perimeter, latitude: null, longitude: null },
  },
};

async function setup(profile: unknown = identity) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/technician/profile').reply(200, profile);
  await renderWithProviders(<ServiceAreaScreen />, { api, translations: [profileTranslations] });
  return { mock, user: userEvent.setup() };
}

describe('ServiceAreaScreen', () => {
  it('préremplit la zone enregistrée', async () => {
    await setup();

    expect(await screen.findByText(`Zone actuelle : Yaounde — 50${NBSP}km`)).toBeOnTheScreen();
    expect(screen.getByLabelText('Rayon d’intervention (km)')).toHaveDisplayValue('50');
    expect(screen.getByLabelText('Ville')).toHaveDisplayValue('Yaounde');
  });

  it('enregistre la zone avec la position et les quartiers saisis', async () => {
    const { mock, user } = await setup();
    mock.onPut('/technician/location').reply(200, locationUpdated);
    await screen.findByLabelText('Ville');

    await fireEvent.changeText(screen.getByLabelText('Rayon d’intervention (km)'), '25');
    await fireEvent.changeText(
      screen.getByLabelText('Quartiers desservis (séparés par des virgules)'),
      'Bastos, Nlongkak',
    );
    await user.press(screen.getByRole('button', { name: 'Enregistrer la zone' }));

    expect(await screen.findByText('Zone d’intervention enregistrée.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.put[0]?.data as string)).toMatchObject({
      latitude: identity.data.service_perimeter.latitude,
      longitude: identity.data.service_perimeter.longitude,
      radius: 25,
      zones: ['Bastos', 'Nlongkak'],
    });
  });

  it('relève la position de l’appareil', async () => {
    const { user } = await setup(withoutPosition);
    await screen.findByLabelText('Ville');

    await user.press(screen.getByRole('button', { name: 'Utiliser ma position' }));

    expect(
      await screen.findByText('Position retenue : Rue de la démonstration, Yaoundé'),
    ).toBeOnTheScreen();
  });

  it('exige une position avant l’enregistrement', async () => {
    const { mock, user } = await setup(withoutPosition);
    await screen.findByLabelText('Ville');

    await user.press(screen.getByRole('button', { name: 'Enregistrer la zone' }));

    expect(
      await screen.findByText('Indiquez votre position avant d’enregistrer.'),
    ).toBeOnTheScreen();
    expect(mock.history.put).toHaveLength(0);
  });

  it('affiche l’erreur de rayon renvoyée par le serveur', async () => {
    const { mock, user } = await setup();
    mock.onPut('/technician/location').reply(422, {
      message: 'Invalide',
      errors: { radius: ['Rayon refusé par le serveur.'] },
    });
    await screen.findByLabelText('Ville');

    await user.press(screen.getByRole('button', { name: 'Enregistrer la zone' }));

    expect(await screen.findByText('Rayon refusé par le serveur.')).toBeOnTheScreen();
  });
});
