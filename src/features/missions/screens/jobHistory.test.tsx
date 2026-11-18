import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import jobCompleted from '@/test/fixtures/missions/job-completed.json';
import jobs from '@/test/fixtures/missions/jobs.json';
import { renderWithProviders } from '@/test/render';

import { missionsTranslations } from '../i18n';
import { JobDetailScreen } from './JobDetailScreen';
import { TechnicianJobsScreen } from './TechnicianJobsScreen';

const JOB = jobs.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('TechnicianJobsScreen', () => {
  it('liste les missions et ouvre le détail', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/jobs').reply(200, jobs);
    const onOpen = jest.fn();
    await renderWithProviders(<TechnicianJobsScreen onOpen={onOpen} />, {
      api,
      translations: [missionsTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText(JOB.request.title)).toBeOnTheScreen();
    expect(screen.getByText('Travaux en cours')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: `Voir le détail : ${JOB.request.title}` }));
    expect(onOpen).toHaveBeenCalledWith(JOB.id);
  });

  it('signale un historique vide', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/jobs').reply(200, { data: [] });
    await renderWithProviders(<TechnicianJobsScreen onOpen={jest.fn()} />, {
      api,
      translations: [missionsTranslations],
    });

    expect(await screen.findByText('Aucune mission enregistrée.')).toBeOnTheScreen();
  });
});

describe('JobDetailScreen', () => {
  it('présente le statut, les phases et le compte rendu', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/jobs/${jobCompleted.data.id}`).reply(200, jobCompleted);
    await renderWithProviders(<JobDetailScreen jobId={jobCompleted.data.id} />, {
      api,
      translations: [missionsTranslations],
    });

    expect((await screen.findAllByText('Terminée')).length).toBeGreaterThan(0);
    expect(screen.getByText('Phases de travail')).toBeOnTheScreen();
    expect(screen.getByText('Diagnostic')).toBeOnTheScreen();
    expect(
      screen.getByText(`Compte rendu : ${jobCompleted.data.completion_notes}`),
    ).toBeOnTheScreen();
  });

  it('propose de réessayer après un échec', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/jobs/j1').reply(500, {});
    await renderWithProviders(<JobDetailScreen jobId="j1" />, {
      api,
      translations: [missionsTranslations],
    });
    const user = userEvent.setup();

    expect(
      await screen.findByText('Une erreur est survenue. Veuillez réessayer ultérieurement.'),
    ).toBeOnTheScreen();
    mock.onGet('/jobs/j1').reply(200, jobCompleted);
    await user.press(screen.getByRole('button', { name: 'Réessayer' }));

    expect((await screen.findAllByText('Terminée')).length).toBeGreaterThan(0);
  });
});
