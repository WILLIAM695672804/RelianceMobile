import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import job from '@/test/fixtures/missions/job.json';
import { renderWithProviders } from '@/test/render';

import { missionsTranslations } from '../i18n';
import { CancelMissionContainer } from './CancelMissionContainer';

const JOB_ID = job.data.id;

describe('CancelMissionContainer', () => {
  it('annule la mission avec le motif choisi, après confirmation', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock.onGet(`/jobs/${JOB_ID}`).reply(200, job);
    mock.onPatch(`/jobs/${JOB_ID}/status`).reply(200, {
      data: { ...job.data, status: 'cancelled' },
    });
    const onDone = jest.fn();
    await renderWithProviders(
      <CancelMissionContainer jobId={JOB_ID} onBack={jest.fn()} onDone={onDone} />,
      { api, translations: [missionsTranslations] },
    );
    const user = userEvent.setup();

    expect(await screen.findAllByText('Annuler la mission')).not.toHaveLength(0);
    await user.press(screen.getByRole('radio', { name: /Délai intenable/ }));
    await user.press(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByText(/la demande du client sera close/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Confirmer l’annulation' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(JSON.parse(mock.history.patch[0]!.data as string)).toEqual({
      status: 'cancelled',
      completion_notes: 'Délai intenable',
    });
  });
});
