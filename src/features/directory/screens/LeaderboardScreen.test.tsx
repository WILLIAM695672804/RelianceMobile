import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import technicians from '@/test/fixtures/directory/technicians.json';
import { renderWithProviders } from '@/test/render';

import { directoryTranslations } from '../i18n';
import { LeaderboardScreen } from './LeaderboardScreen';

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('LeaderboardScreen', () => {
  it('annonce la base du classement', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians').reply(200, technicians);
    await renderWithProviders(<LeaderboardScreen onOpen={jest.fn()} />, {
      api,
      translations: [directoryTranslations],
    });

    expect(
      screen.getByText('Classement établi sur les notes reçues et le nombre d’avis.'),
    ).toBeOnTheScreen();
  });

  it('classe les techniciens par note', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians').reply(200, technicians);
    await renderWithProviders(<LeaderboardScreen onOpen={jest.fn()} />, {
      api,
      translations: [directoryTranslations],
    });

    // Les fixtures anonymisées portent toutes le même nom : le rang et la note distinguent.
    const sorted = [...technicians.data].sort((left, right) => right.rating - left.rating);
    expect(await screen.findByText('1')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', {
        name: `Ouvrir le profil de ${sorted[0]!.name}, rang 1`,
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(
        `${String(sorted[0]!.rating).replace('.', ',')} / 5 (${sorted[0]!.num_reviews})`,
      ),
    ).toBeOnTheScreen();
  });

  it('ouvre le profil du technicien pressé', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians').reply(200, technicians);
    const onOpen = jest.fn();
    await renderWithProviders(<LeaderboardScreen onOpen={onOpen} />, {
      api,
      translations: [directoryTranslations],
    });
    const user = userEvent.setup();

    const first = technicians.data[0]!;
    await user.press(
      await screen.findByRole('button', {
        name: `Ouvrir le profil de ${first.name}, rang 1`,
      }),
    );

    expect(onOpen).toHaveBeenCalledWith(first.id);
  });

  it('annonce un classement vide', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians').reply(200, { data: [] });
    await renderWithProviders(<LeaderboardScreen onOpen={jest.fn()} />, {
      api,
      translations: [directoryTranslations],
    });

    expect(await screen.findByText('Aucun technicien classé.')).toBeOnTheScreen();
  });
});
