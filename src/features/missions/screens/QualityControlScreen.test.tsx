import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import intervention from '@/test/fixtures/interventions/intervention.json';
import interventions from '@/test/fixtures/interventions/interventions.json';
import request from '@/test/fixtures/requests/request-detail.json';
import captured from '@/test/fixtures/wallet/hold-captured.json';
import holds from '@/test/fixtures/wallet/holds.json';
import { renderWithProviders } from '@/test/render';

import { missionsTranslations } from '../i18n';
import { QualityControlScreen } from './QualityControlScreen';

const REQUEST_ID = interventions.data.data[0]!.request_id!;
const TECHNICIAN_ID = intervention.data.technician_id!;
const HOLD = holds.data[0]!;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet(`/requests/${REQUEST_ID}`).reply(200, request);
  mock.onGet('/interventions').reply(200, interventions);
  mock.onGet('/holds').reply(200, holds);
  return { api, mock };
}

async function mount(api: ReturnType<typeof setupApi>['api']) {
  const handlers = { onRate: jest.fn(), onOpenDispute: jest.fn(), onDone: jest.fn() };
  await renderWithProviders(
    <QualityControlScreen
      requestId={REQUEST_ID}
      technicianId={TECHNICIAN_ID}
      onRate={handlers.onRate}
      onOpenDispute={handlers.onOpenDispute}
      onDone={handlers.onDone}
    />,
    { api, translations: [missionsTranslations] },
  );
  return { ...handlers, user: userEvent.setup() };
}

describe('QualityControlScreen', () => {
  it('présente le rapport et le montant sous séquestre', async () => {
    const { api } = setupApi();
    await mount(api);

    expect(await screen.findByText(interventions.data.data[0]!.work_performed!)).toBeOnTheScreen();
    expect(screen.getByText(`15 000 FCFA sous séquestre`)).toBeOnTheScreen();
  });

  it('libère le séquestre au profit du technicien', async () => {
    const { api, mock } = setupApi();
    mock.onPost(`/holds/${HOLD.id}/capture`).reply(200, captured);
    const { onRate, user } = await mount(api);

    await user.press(await screen.findByRole('button', { name: 'Valider et libérer le paiement' }));

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      payee_id: TECHNICIAN_ID,
      method: 'momo',
    });
    expect(await screen.findByText('Paiement libéré')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Noter le technicien' }));
    expect(onRate).toHaveBeenCalledWith(REQUEST_ID);
  });

  it('mène au litige plutôt qu’à la validation', async () => {
    const { api, mock } = setupApi();
    const { onOpenDispute, user } = await mount(api);

    await user.press(await screen.findByRole('button', { name: 'Signaler un problème' }));

    expect(onOpenDispute).toHaveBeenCalledWith(REQUEST_ID, TECHNICIAN_ID);
    expect(mock.history.post).toHaveLength(0);
  });

  it('interdit la validation sans séquestre', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/holds').reply(200, { data: [] });
    await mount(api);

    expect(
      await screen.findByText('Aucun montant sous séquestre pour cette demande.'),
    ).toBeOnTheScreen();
    const validate = screen.getByRole('button', { name: 'Valider et libérer le paiement' });
    expect(validate.props.accessibilityState?.disabled).toBe(true);
  });
});
