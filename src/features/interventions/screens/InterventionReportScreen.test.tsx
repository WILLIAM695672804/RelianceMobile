import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import completed from '@/test/fixtures/interventions/intervention-completed.json';
import created from '@/test/fixtures/interventions/intervention-created.json';
import intervention from '@/test/fixtures/interventions/intervention.json';
import { formatHours } from '@/shared/format';
import { renderWithProviders } from '@/test/render';

import { interventionsTranslations } from '../i18n';
import { InterventionReportScreen } from './InterventionReportScreen';

const ID = intervention.data.id;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

async function mount(mode: 'read' | 'edit', api: ReturnType<typeof setupApi>['api']) {
  const onDone = jest.fn();
  await renderWithProviders(
    <InterventionReportScreen interventionId={ID} mode={mode} onDone={onDone} />,
    { api, translations: [interventionsTranslations] },
  );
  return { onDone, user: userEvent.setup() };
}

describe('InterventionReportScreen', () => {
  it('présente le rapport au client', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/interventions/${ID}`).reply(200, intervention);
    await mount('read', api);

    expect(await screen.findByText(intervention.data.work_performed)).toBeOnTheScreen();
    expect(screen.getByText(intervention.data.materials_used[0]!)).toBeOnTheScreen();
    expect(screen.getByText(formatHours(1.5))).toBeOnTheScreen();
    expect(screen.getByText(intervention.data.notes)).toBeOnTheScreen();
    expect(screen.getByText('Terminée')).toBeOnTheScreen();
  });

  it('n’offre aucun formulaire au client', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/interventions/${ID}`).reply(200, intervention);
    await mount('read', api);

    await screen.findByText(intervention.data.work_performed);
    expect(screen.queryByRole('button', { name: 'Clôturer l’intervention' })).toBeNull();
  });

  it('annonce l’absence de rapport', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/interventions/${ID}`).reply(200, created);
    await mount('read', api);

    expect(
      await screen.findByText('Le technicien n’a pas encore déposé son rapport.'),
    ).toBeOnTheScreen();
  });

  it('envoie le rapport du technicien', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/interventions/${ID}`).reply(200, created);
    mock.onPost(`/interventions/${ID}/complete`).reply(200, completed);
    const { onDone, user } = await mount('edit', api);

    await screen.findByText('Travail effectué');
    await user.type(
      screen.getByLabelText('Travail effectué'),
      'Remplacement du disjoncteur principal.',
    );
    await user.type(
      screen.getByLabelText('Matériels employés (une ligne par pièce)'),
      'Disjoncteur 16 A',
    );
    await user.type(screen.getByLabelText('Durée en heures'), '1.5');
    await user.press(screen.getByRole('button', { name: 'Clôturer l’intervention' }));

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      work_performed: 'Remplacement du disjoncteur principal.',
      materials_used: ['Disjoncteur 16 A'],
      duration_hours: 1.5,
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('refuse un rapport sans description du travail', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/interventions/${ID}`).reply(200, created);
    const { user } = await mount('edit', api);

    await screen.findByText('Travail effectué');
    await user.press(screen.getByRole('button', { name: 'Clôturer l’intervention' }));

    expect(await screen.findByText('Décrivez le travail effectué.')).toBeOnTheScreen();
    expect(mock.history.post).toHaveLength(0);
  });
});
