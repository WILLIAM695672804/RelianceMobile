import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import clientMission from '@/test/fixtures/missions/client-mission.json';
import clientTracking from '@/test/fixtures/missions/client-tracking.json';
import { renderWithProviders } from '@/test/render';

import { missionsTranslations } from '../i18n';
import { ClientTrackingContainer, shortReference, trackingPhases } from './ClientTrackingContainer';

const JOB_ID = clientMission.data.job_id;
const t = (key: string) => key;

describe('trackingPhases', () => {
  it('marque les étapes franchies, la courante et celles à venir', () => {
    expect(trackingPhases('arrived', t).map((phase) => phase.state)).toEqual([
      'done',
      'done',
      'active',
      'todo',
      'todo',
    ]);
  });

  it('place une mission sans travail à sa première étape et clôt une mission terminée', () => {
    expect(trackingPhases(null, t)[0]!.state).toBe('active');
    expect(trackingPhases('completed', t).every((phase) => phase.state === 'done')).toBe(true);
  });
});

it('shortReference abrège l’identifiant de la demande', () => {
  expect(shortReference('d9416da5-609a-44df')).toBe('#D9416DA5');
});

function props() {
  return {
    onBack: jest.fn(),
    onChat: jest.fn(),
    onOpenQuotes: jest.fn(),
    onOpenQuality: jest.fn(),
  };
}

async function setup(mission: unknown, tracking: unknown = clientTracking) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/mission/active').reply(200, mission);
  mock.onGet(`/jobs/${JOB_ID}/tracking`).reply(200, tracking);
  const handlers = props();
  await renderWithProviders(<ClientTrackingContainer {...handlers} />, {
    api,
    translations: [missionsTranslations],
  });
  return { handlers, user: userEvent.setup() };
}

describe('ClientTrackingContainer', () => {
  it('propose le contrôle qualité d’une mission terminée et la messagerie', async () => {
    const { handlers, user } = await setup(clientMission);

    await user.press(
      await screen.findByRole('button', { name: 'Contrôler et libérer le paiement' }),
    );
    expect(handlers.onOpenQuality).toHaveBeenCalledWith(
      clientMission.data.request.id,
      clientMission.data.technician.id,
    );
    expect(screen.getByText('12 000 FCFA gelés en séquestre')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Écrire à Technicien Démo' }));
    expect(handlers.onChat).toHaveBeenCalledWith(
      clientMission.data.technician.id,
      clientMission.data.request.title,
    );
  });

  it('annonce l’absence d’intervention en cours', async () => {
    await setup({ data: null });
    expect(await screen.findByText('Aucune intervention en cours.')).toBeOnTheScreen();
  });
});
