import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import stats from '@/test/fixtures/technician/stats.json';
import { renderWithProviders } from '@/test/render';

import { profileTranslations } from '../i18n';
import { TechnicianStatsScreen } from './TechnicianStatsScreen';

const NBSP = ' ';

const populated = {
  ...stats,
  available_balance: 42000,
  monthly_earnings: 18000,
  total_earnings: 125000,
  missions_total: 12,
  missions_completed: 9,
  completion_rate: 75,
  category_breakdown: [{ label: 'Dépannage électrique', value: 7 }],
  recent_missions: [
    {
      id: 'j1',
      title: 'Panne de courant',
      category: 'Dépannage électrique',
      city: 'Yaoundé',
      status: 'completed',
    },
  ],
};

async function setup(reply: [number, unknown] = [200, populated]) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/technician/stats').reply(...reply);
  await renderWithProviders(<TechnicianStatsScreen />, {
    api,
    translations: [profileTranslations],
  });
  return { mock, user: userEvent.setup() };
}

describe('TechnicianStatsScreen', () => {
  it('présente les indicateurs, la répartition et les missions récentes', async () => {
    await setup();

    expect(await screen.findByText(`42${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByText('Solde disponible')).toBeOnTheScreen();
    expect(screen.getByText(`18${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByText('9 terminées sur 12')).toBeOnTheScreen();
    expect(screen.getByText(`75${NBSP}%`)).toBeOnTheScreen();
    expect(screen.getByText('4,8 / 5 (32 avis)')).toBeOnTheScreen();
    expect(screen.getByText('Dépannage électrique')).toBeOnTheScreen();
    expect(screen.getByText('Panne de courant')).toBeOnTheScreen();
    expect(screen.getByText('Missions par mois')).toBeOnTheScreen();
  });

  it('signale une activité encore vide', async () => {
    await setup([200, stats]);

    expect(await screen.findByText('Aucune mission enregistrée pour le moment.')).toBeOnTheScreen();
  });

  it('propose de réessayer après un échec', async () => {
    const { mock, user } = await setup([500, {}]);

    expect(
      await screen.findByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
    mock.onGet('/technician/stats').reply(200, populated);
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText('Solde disponible')).toBeOnTheScreen();
  });
});
