import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import clientMission from '@/test/fixtures/missions/client-mission.json';
import clientTracking from '@/test/fixtures/missions/client-tracking.json';
import technicianPosition from '@/test/fixtures/missions/technician-position.json';
import { renderWithProviders } from '@/test/render';

import { missionsTranslations } from '../i18n';
import { MissionTrackingScreen } from './MissionTrackingScreen';

const NBSP = ' ';
const JOB_ID = clientMission.data.job_id;

async function setup(mission: unknown = clientMission, position: unknown = technicianPosition) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/mission/active').reply(200, mission);
  mock.onGet(`/jobs/${JOB_ID}/tracking`).reply(200, clientTracking);
  mock.onGet('/position/technician').reply(200, position);
  await renderWithProviders(<MissionTrackingScreen />, {
    api,
    translations: [missionsTranslations],
  });
  return { mock, user: userEvent.setup() };
}

describe('MissionTrackingScreen (E15)', () => {
  it('présente la mission, le technicien et l’avancement', async () => {
    await setup();

    expect(await screen.findByText(clientMission.data.request.title)).toBeOnTheScreen();
    expect(screen.getByText('Technicien : Technicien Démo')).toBeOnTheScreen();
    expect(screen.getByText('Note : 4,8 / 5 (32 avis)')).toBeOnTheScreen();
    expect(screen.getByText(`Montant convenu : 12${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByText('Lieu : Yaoundé')).toBeOnTheScreen();
    expect(await screen.findByText('Travaux en cours')).toBeOnTheScreen();
    expect(screen.getByText('Diagnostic')).toBeOnTheScreen();
  });

  it('situe la position relevée du technicien', async () => {
    await setup();

    expect(await screen.findByText(/^Position relevée à \d{2}:\d{2}$/)).toBeOnTheScreen();
    expect(screen.getByText(/^À \d+ m de votre adresse$/)).toBeOnTheScreen();
  });

  it('signale une position non communiquée', async () => {
    await setup(clientMission, { status: 'success', data: null });

    expect(await screen.findByText('Position du technicien non communiquée.')).toBeOnTheScreen();
  });

  it('signale une intervention pas encore démarrée', async () => {
    await setup({ status: 'success', data: { ...clientMission.data, job_id: null } });

    expect(
      await screen.findByText('Le technicien n’a pas encore démarré l’intervention.'),
    ).toBeOnTheScreen();
  });

  it('annonce l’absence d’intervention en cours', async () => {
    await setup({ status: 'success', data: null });

    expect(await screen.findByText('Aucune intervention en cours.')).toBeOnTheScreen();
  });

  it('recharge le suivi quand l’utilisateur tire l’écran', async () => {
    const { mock } = await setup();
    await screen.findByText(clientMission.data.request.title);
    const before = mock.history.get.length;

    await screen.getByTestId('screen-scroll').props.refreshControl.props.onRefresh();

    await waitFor(() => expect(mock.history.get.length).toBeGreaterThan(before));
  });
});
