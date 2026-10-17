import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import job from '@/test/fixtures/missions/job.json';
import { renderWithProviders } from '@/test/render';

import { missionsTranslations } from '../i18n';
import { CancelMissionScreen } from './CancelMissionScreen';

const JOB_ID = job.data.id;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

async function mount(api: ReturnType<typeof setupApi>['api']) {
  const onDone = jest.fn();
  await renderWithProviders(<CancelMissionScreen jobId={JOB_ID} onDone={onDone} />, {
    api,
    translations: [missionsTranslations],
  });
  return { onDone, user: userEvent.setup() };
}

describe('CancelMissionScreen', () => {
  it('propose les motifs sans rien envoyer', async () => {
    const { api, mock } = setupApi();
    await mount(api);

    expect(screen.getByText('Pourquoi souhaitez-vous annuler cette mission ?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Je ne suis plus disponible' })).toBeOnTheScreen();
    expect(mock.history.patch).toHaveLength(0);
  });

  it('avertit du caractère irréversible avant de confirmer', async () => {
    const { api, mock } = setupApi();
    const { user } = await mount(api);

    await user.press(screen.getByRole('button', { name: 'Continuer' }));

    expect(screen.getByText('Confirmer l’annulation ?')).toBeOnTheScreen();
    expect(screen.getByTestId('cancel-steps').props.accessibilityValue).toEqual({
      min: 1,
      max: 2,
      now: 2,
    });
    expect(mock.history.patch).toHaveLength(0);
  });

  it('annule la mission avec le motif retenu', async () => {
    const { api, mock } = setupApi();
    mock.onPatch(`/jobs/${JOB_ID}/status`).reply(200, job);
    const { onDone, user } = await mount(api);

    await user.press(screen.getByRole('button', { name: 'Délai intenable' }));
    await user.press(screen.getByRole('button', { name: 'Continuer' }));
    await user.press(screen.getByRole('button', { name: 'Confirmer l’annulation' }));

    await waitFor(() => expect(mock.history.patch).toHaveLength(1));
    expect(JSON.parse(mock.history.patch[0]?.data as string)).toEqual({
      status: 'cancelled',
      completion_notes: 'Délai intenable',
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
