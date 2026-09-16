import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { renderWithProviders } from '@/test/render';

import { matchingTranslations } from '../i18n';
import { MatchingScreen } from './MatchingScreen';

const NBSP = ' ';

function buildTechnician(overrides: Record<string, unknown> = {}) {
  return {
    id: 't1',
    name: 'Technicien Démo',
    avatar_url: null,
    rating: 4.8,
    num_reviews: 32,
    verified: true,
    distance_km: 2.54,
    match_score: 64,
    scores: { total: 0.64 },
    skills: [
      { name: 'Dépannage électrique', proficiency: 3, hourly_rate: '9000.00' },
      { name: 'Éclairage / LED', proficiency: 5, hourly_rate: '5000.00' },
    ],
    badges: [],
    ...overrides,
  };
}

async function setup(reply: [number, unknown]) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onPost('/requests/r1/match').reply(...reply);
  const onSelect = jest.fn();
  await renderWithProviders(<MatchingScreen requestId="r1" onSelect={onSelect} />, {
    api,
    translations: [matchingTranslations],
  });
  return { mock, onSelect, user: userEvent.setup() };
}

const results = (technicians: unknown[]) => ({
  status: 'success',
  data: { technicians, scoring_details: { radius_km: 50 } },
});

describe('MatchingScreen (E11)', () => {
  it('présente chaque technicien et transmet le choix', async () => {
    const { onSelect, user } = await setup([200, results([buildTechnician()])]);

    expect(await screen.findByText('Technicien Démo')).toBeOnTheScreen();
    expect(screen.getByText('Vérifié')).toBeOnTheScreen();
    expect(screen.getByText(`Compatibilité : 64${NBSP}%`)).toBeOnTheScreen();
    expect(screen.getByText('Note : 4,8 / 5 (32 avis)')).toBeOnTheScreen();
    expect(screen.getByText(`Distance : 2,5${NBSP}km`)).toBeOnTheScreen();
    expect(
      screen.getByText('Compétences : Dépannage électrique, Éclairage / LED'),
    ).toBeOnTheScreen();
    expect(screen.getByText(`À partir de 5${NBSP}000${NBSP}FCFA de l’heure`)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Choisir : Technicien Démo' }));
    expect(onSelect).toHaveBeenCalledWith('t1');
  });

  it('classe par score décroissant et limite à cinq techniciens', async () => {
    await setup([
      200,
      results(
        [30, 95, 60, 10, 80, 70].map((score, index) =>
          buildTechnician({ id: `t${index}`, name: `Technicien ${score}`, match_score: score }),
        ),
      ),
    ]);

    const buttons = await screen.findAllByRole('button', { name: /^Choisir : / });
    expect(buttons.map((button) => button.props.accessibilityLabel)).toEqual([
      'Choisir : Technicien 95',
      'Choisir : Technicien 80',
      'Choisir : Technicien 70',
      'Choisir : Technicien 60',
      'Choisir : Technicien 30',
    ]);
  });

  it('annonce l’absence de technicien disponible', async () => {
    await setup([200, results([])]);

    expect(
      await screen.findByText(
        'Aucun technicien vérifié n’est disponible près de votre demande pour le moment.',
      ),
    ).toBeOnTheScreen();
  });

  it('propose de réessayer après un échec', async () => {
    const { mock, user } = await setup([500, {}]);

    expect(
      await screen.findByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
    mock.onPost('/requests/r1/match').reply(200, results([buildTechnician()]));
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));

    expect(await screen.findByText('Technicien Démo')).toBeOnTheScreen();
  });
});
