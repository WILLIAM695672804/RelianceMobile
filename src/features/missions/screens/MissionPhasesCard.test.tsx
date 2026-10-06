import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import jobPhases from '@/test/fixtures/missions/job-phases.json';
import { renderWithProviders } from '@/test/render';

import { missionsTranslations } from '../i18n';
import type { JobPhase } from '../schemas/missionSchemas';
import { MissionPhasesCard } from './MissionPhasesCard';

const JOB_ID = jobPhases.data.id;

async function setup(phases: JobPhase[]) {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  await renderWithProviders(<MissionPhasesCard jobId={JOB_ID} phases={phases} />, {
    api,
    translations: [missionsTranslations],
  });
  return { mock, user: userEvent.setup() };
}

const phase = (title: string, status: string): JobPhase => ({ title, status, notes: null });

describe('MissionPhasesCard', () => {
  it('liste les phases et leur statut', async () => {
    await setup([phase('Diagnostic', 'completed'), phase('Remplacement', 'in_progress')]);

    expect(screen.getByText('Diagnostic')).toBeOnTheScreen();
    expect(screen.getByText('Terminée')).toBeOnTheScreen();
    expect(screen.getByText('En cours')).toBeOnTheScreen();
  });

  it('signale l’absence de phase', async () => {
    await setup([]);

    expect(screen.getByText('Aucune phase enregistrée.')).toBeOnTheScreen();
  });

  it('ajoute une phase, fait cycler son statut puis enregistre', async () => {
    const { mock, user } = await setup([]);
    mock.onPut(`/jobs/${JOB_ID}/phases`).reply(200, jobPhases);

    await fireEvent.changeText(screen.getByLabelText('Intitulé de la phase'), 'Diagnostic');
    await user.press(screen.getByRole('button', { name: 'Ajouter une phase' }));
    expect(screen.getByText('À faire')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Changer le statut : Diagnostic' }));
    expect(screen.getByText('En cours')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Enregistrer les phases' }));

    expect(await screen.findByText('Phases enregistrées.')).toBeOnTheScreen();
    expect(JSON.parse(mock.history.put[0]?.data as string)).toEqual({
      phases: [{ title: 'Diagnostic', status: 'in_progress', notes: null }],
    });
  });

  it('refuse une phase sans intitulé', async () => {
    const { user } = await setup([]);

    await user.press(screen.getByRole('button', { name: 'Ajouter une phase' }));

    expect(await screen.findByText('Indiquez l’intitulé de la phase.')).toBeOnTheScreen();
  });

  it('retire une phase et signale un échec du serveur', async () => {
    const { mock, user } = await setup([phase('Diagnostic', 'pending')]);
    mock.onPut(`/jobs/${JOB_ID}/phases`).reply(422, { message: 'Invalide', errors: {} });

    await user.press(screen.getByRole('button', { name: 'Retirer : Diagnostic' }));
    expect(screen.getByText('Aucune phase enregistrée.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Intitulé de la phase'), 'Contrôle');
    await user.press(screen.getByRole('button', { name: 'Ajouter une phase' }));
    await user.press(screen.getByRole('button', { name: 'Enregistrer les phases' }));

    expect(
      await screen.findByText('L’enregistrement a échoué. Veuillez réessayer.'),
    ).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.put).toHaveLength(1));
  });
});
