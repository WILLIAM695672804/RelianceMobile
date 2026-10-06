import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import empty from '@/test/fixtures/directory/technicians-empty.json';
import technicians from '@/test/fixtures/directory/technicians.json';
import technicianProfile from '@/test/fixtures/matching/technician-profile.json';
import { socialTranslations } from '@/features/social';
import { renderWithProviders } from '@/test/render';

import { directoryTranslations } from '../i18n';
import { TechnicianDirectoryScreen } from './TechnicianDirectoryScreen';
import { TechnicianPublicProfileScreen } from './TechnicianPublicProfileScreen';

const NBSP = ' ';
const first = technicians.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('TechnicianDirectoryScreen', () => {
  it('liste les techniciens et ouvre un profil', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians').reply(200, technicians);
    const onOpen = jest.fn();
    await renderWithProviders(<TechnicianDirectoryScreen onOpen={onOpen} />, {
      api,
      translations: [directoryTranslations],
    });
    const user = userEvent.setup();

    expect(
      await screen.findByText(`${technicians.meta.total} technicien(s) trouvé(s)`),
    ).toBeOnTheScreen();
    expect(screen.getAllByText('Vérifié').length).toBeGreaterThan(0);
    expect(screen.getByText(`Note : 4,9 / 5 (45 avis)`)).toBeOnTheScreen();
    expect(screen.getAllByText('Ville : Yaounde').length).toBeGreaterThan(0);
    expect(screen.getByText(`À partir de 6${NBSP}000${NBSP}FCFA de l’heure`)).toBeOnTheScreen();

    await user.press(screen.getAllByRole('button', { name: 'Voir le profil' })[0]!);
    expect(onOpen).toHaveBeenCalledWith(first.id);
  });

  it('transmet la recherche saisie au serveur', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians').reply(200, technicians);
    await renderWithProviders(<TechnicianDirectoryScreen onOpen={jest.fn()} />, {
      api,
      translations: [directoryTranslations],
    });
    const user = userEvent.setup();
    await screen.findByText('Annuaire des techniciens');

    await fireEvent.changeText(screen.getByLabelText('Rechercher un technicien'), 'Awa');
    await user.press(screen.getByRole('button', { name: 'Rechercher' }));

    await waitFor(() =>
      expect(mock.history.get.some((request) => request.params?.search === 'Awa')).toBe(true),
    );
  });

  it('filtre autour de la position de l’appareil', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians').reply(200, technicians);
    await renderWithProviders(<TechnicianDirectoryScreen onOpen={jest.fn()} />, {
      api,
      translations: [directoryTranslations],
    });
    const user = userEvent.setup();
    await screen.findByText('Annuaire des techniciens');

    await user.press(screen.getByRole('button', { name: 'Autour de moi' }));

    expect(await screen.findByText('Autour de moi : activé')).toBeOnTheScreen();
    await waitFor(() =>
      expect(mock.history.get.some((request) => request.params?.latitude === 3.848)).toBe(true),
    );
  });

  it('annonce une recherche sans résultat', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians').reply(200, empty);
    await renderWithProviders(<TechnicianDirectoryScreen onOpen={jest.fn()} />, {
      api,
      translations: [directoryTranslations],
    });

    expect(
      await screen.findByText('Aucun technicien ne correspond à votre recherche.'),
    ).toBeOnTheScreen();
  });
});

describe('TechnicianPublicProfileScreen', () => {
  it('présente le profil public du technicien', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians/t1/profile').reply(200, technicianProfile);
    await renderWithProviders(<TechnicianPublicProfileScreen technicianId="t1" />, {
      api,
      translations: [directoryTranslations],
    });

    expect(await screen.findByText(technicianProfile.data.name)).toBeOnTheScreen();
    expect(screen.queryByText(technicianProfile.data.email)).not.toBeOnTheScreen();
  });

  it('signale un technicien introuvable', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians/t1/profile').reply(404, { message: 'Not found' });
    await renderWithProviders(<TechnicianPublicProfileScreen technicianId="t1" />, {
      api,
      translations: [directoryTranslations],
    });

    expect(await screen.findByText('Élément introuvable.')).toBeOnTheScreen();
  });

  it('permet de suivre le technicien depuis son profil public', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/technicians/t1/profile').reply(200, technicianProfile);
    mock.onGet('/follows/t1/check').reply(200, { following: false });
    mock.onGet('/users/t1/follow-counts').reply(200, { followers_count: 0, following_count: 0 });
    mock
      .onPost('/follows/t1')
      .reply(201, { status: 'success', message: 'Suivi', following: true, followers_count: 1 });
    await renderWithProviders(<TechnicianPublicProfileScreen technicianId="t1" />, {
      api,
      translations: [directoryTranslations, socialTranslations],
    });
    const user = userEvent.setup();

    await user.press(
      await screen.findByRole('button', {
        name: `Suivre ${technicianProfile.data.name}`,
      }),
    );

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
  });
});
