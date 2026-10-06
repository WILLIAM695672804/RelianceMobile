import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { matchingTranslations } from '@/features/matching';
import activeMission from '@/test/fixtures/missions/active-mission.json';
import jobCreated from '@/test/fixtures/missions/job-created.json';
import jobInProgress from '@/test/fixtures/missions/job-in-progress.json';
import positionUpdated from '@/test/fixtures/missions/position-updated.json';
import { renderWithProviders } from '@/test/render';

import { missionsTranslations } from '../i18n';
import { MissionCockpitScreen } from './MissionCockpitScreen';

const NBSP = ' ';
const JOB_ID = jobCreated.data.id;

/** Mission acceptée, avec ou sans suivi démarré. */
function missionWith(job: unknown) {
  return { status: 'success', data: { ...activeMission.data, job } };
}

async function setup(reply: [number, unknown] = [200, missionWith(null)]) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet('/proposals/active-mission').reply(...reply);
  const onOpenHistory = jest.fn();
  await renderWithProviders(<MissionCockpitScreen onOpenHistory={onOpenHistory} />, {
    api,
    translations: [missionsTranslations, matchingTranslations],
  });
  return { mock, onOpenHistory, user: userEvent.setup() };
}

describe('MissionCockpitScreen (E13, E14)', () => {
  it('annonce l’absence de mission acceptée', async () => {
    await setup([200, { status: 'success', data: null }]);

    expect(await screen.findByText('Aucune mission acceptée pour le moment.')).toBeOnTheScreen();
  });

  it('présente la mission et démarre le suivi', async () => {
    const { mock, user } = await setup();
    mock.onPost('/jobs').reply(201, jobCreated);

    expect(await screen.findByText(activeMission.data.request.title)).toBeOnTheScreen();
    expect(screen.getByText('Client : Client Démo')).toBeOnTheScreen();
    expect(screen.getByText(`Montant : 12${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByText('Lieu : Yaoundé')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Démarrer l’intervention' }));

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: activeMission.data.request.id,
    });
  });

  it('fait avancer le statut d’un cran', async () => {
    const { mock, user } = await setup([
      200,
      missionWith({ id: JOB_ID, status: 'en_route', phases: null, started_at: null }),
    ]);
    mock.onPatch(`/jobs/${JOB_ID}/status`).reply(200, jobCreated);

    await user.press(await screen.findByRole('button', { name: 'Je suis arrivé' }));

    await waitFor(() => expect(mock.history.patch).toHaveLength(1));
    expect(JSON.parse(mock.history.patch[0]?.data as string)).toEqual({ status: 'arrived' });
  });

  it('termine la mission avec un compte rendu', async () => {
    const { mock, user } = await setup([
      200,
      missionWith({ id: JOB_ID, status: 'in_progress', phases: null, started_at: null }),
    ]);
    mock.onPatch(`/jobs/${JOB_ID}/status`).reply(200, jobInProgress);

    await user.press(await screen.findByRole('button', { name: 'Terminer la mission' }));
    expect(
      screen.getByText(`Confirmez l’achèvement de « ${activeMission.data.request.title} ».`),
    ).toBeOnTheScreen();
    await fireEvent.changeText(
      screen.getByLabelText('Compte rendu (facultatif)'),
      'Prise remplacée.',
    );
    await user.press(screen.getByRole('button', { name: 'Terminer' }));

    await waitFor(() => expect(mock.history.patch).toHaveLength(1));
    expect(JSON.parse(mock.history.patch[0]?.data as string)).toEqual({
      status: 'completed',
      completion_notes: 'Prise remplacée.',
    });
  });

  it('partage la position du technicien', async () => {
    const { mock, user } = await setup([
      200,
      missionWith({ id: JOB_ID, status: 'en_route', phases: null, started_at: null }),
    ]);
    mock.onPost('/position/update').reply(200, positionUpdated);

    await user.press(await screen.findByRole('button', { name: 'Partager ma position' }));

    expect(await screen.findByText('Position transmise au client.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      latitude: 3.848,
      longitude: 11.5021,
    });
  });

  it('propose les phases pendant les travaux et l’historique', async () => {
    const { onOpenHistory, user } = await setup([
      200,
      missionWith({
        id: JOB_ID,
        status: 'in_progress',
        phases: [{ title: 'Diagnostic', status: 'completed', notes: null }],
        started_at: null,
      }),
    ]);

    expect(await screen.findByText('Phases de travail')).toBeOnTheScreen();
    expect(screen.getByText('Diagnostic')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Historique des missions' }));
    expect(onOpenHistory).toHaveBeenCalledTimes(1);
  });

  it('clôt le cockpit lorsque la mission est terminée', async () => {
    await setup([
      200,
      missionWith({ id: JOB_ID, status: 'completed', phases: null, started_at: null }),
    ]);

    expect(await screen.findByText('Mission terminée.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Terminer la mission' })).not.toBeOnTheScreen();
  });
});
