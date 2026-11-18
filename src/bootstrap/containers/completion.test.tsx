import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { interventionsTranslations } from '@/features/interventions';
import { missionsTranslations } from '@/features/missions';
import { requestsTranslations } from '@/features/requests';
import intervention from '@/test/fixtures/interventions/intervention.json';
import interventions from '@/test/fixtures/interventions/interventions.json';
import request from '@/test/fixtures/requests/request-detail.json';
import captured from '@/test/fixtures/wallet/hold-captured.json';
import holds from '@/test/fixtures/wallet/holds.json';
import { renderWithProviders } from '@/test/render';

import { ClientReportContainer, toDiagnosticReport } from './ClientReportContainer';
import { beforeAfter, QualityContainer } from './QualityContainer';

const REPORT = interventions.data.data[0]!;
const REQUEST_ID = REPORT.request_id!;
const TECHNICIAN_ID = intervention.data.technician_id!;
const HOLD = holds.data[0]!;
const translations = [missionsTranslations, interventionsTranslations, requestsTranslations];

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  const mock = new MockAdapter(api);
  mock.onGet(`/requests/${REQUEST_ID}`).reply(200, request);
  mock.onGet('/interventions').reply(200, interventions);
  mock.onGet('/holds').reply(200, holds);
  return { api, mock };
}

describe('toDiagnosticReport', () => {
  it('reprend les travaux, les notes et le matériel du rapport', () => {
    const report = toDiagnosticReport(
      {
        id: 'i1',
        status: 'completed',
        work_performed: 'Disjoncteur remplacé',
        notes: 'Prévoir une révision\nCâblage ancien',
        materials_used: ['Disjoncteur 20 A'],
      },
      'd9416da5-609a',
      (key, options) => (options ? `${key}:${JSON.stringify(options)}` : key),
    );
    expect(report.findings).toBe('Disjoncteur remplacé');
    expect(report.reference).toBe('#D9416DA5');
    expect(report.recommendations).toEqual([
      'Prévoir une révision',
      'Câblage ancien',
      'interventions:report.materialsLine:{"list":"Disjoncteur 20 A"}',
    ]);
    expect(report.lines).toEqual([]);
  });
});

it('beforeAfter n’oppose que deux photos distinctes au moins', () => {
  expect(beforeAfter(['a'])).toBeNull();
  expect(beforeAfter(['a', 'b', 'c'])).toEqual({ before: 'a', after: 'c' });
});

describe('ClientReportContainer', () => {
  it('présente le rapport et mène aux devis', async () => {
    const { api } = setupApi();
    const onAskQuote = jest.fn();
    await renderWithProviders(
      <ClientReportContainer requestId={REQUEST_ID} onBack={jest.fn()} onAskQuote={onAskQuote} />,
      { api, translations },
    );

    expect(await screen.findByText(REPORT.work_performed!)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Refuser' })).toBeNull();
    await userEvent.setup().press(screen.getByRole('button', { name: /devis/i }));
    expect(onAskQuote).toHaveBeenCalled();
  });

  it('annonce l’absence de rapport', async () => {
    const { api } = setupApi();
    await renderWithProviders(
      <ClientReportContainer requestId="inconnue" onBack={jest.fn()} onAskQuote={jest.fn()} />,
      { api, translations },
    );
    expect(
      await screen.findByText('Le technicien n’a pas encore déposé son rapport.'),
    ).toBeOnTheScreen();
  });
});

describe('QualityContainer', () => {
  function handlers() {
    return {
      onBack: jest.fn(),
      onDispute: jest.fn(),
      onRate: jest.fn(),
      onInvoices: jest.fn(),
      onHome: jest.fn(),
    };
  }

  it('libère le séquestre puis propose la notation', async () => {
    const { api, mock } = setupApi();
    mock.onPost(`/holds/${HOLD.id}/capture`).reply(200, captured);
    const props = handlers();
    await renderWithProviders(
      <QualityContainer requestId={REQUEST_ID} technicianId={TECHNICIAN_ID} {...props} />,
      { api, translations },
    );
    const user = userEvent.setup();

    await user.press(await screen.findByRole('button', { name: 'Valider et libérer' }));

    await waitFor(() => expect(mock.history.post).toHaveLength(1));
    expect(JSON.parse(mock.history.post[0]!.data as string)).toEqual({
      payee_id: TECHNICIAN_ID,
      method: 'momo',
    });
    await user.press(await screen.findByRole('button', { name: 'Noter le technicien' }));
    expect(props.onRate).toHaveBeenCalledWith(REQUEST_ID);
  });

  it('ouvre un litige contre le technicien', async () => {
    const { api } = setupApi();
    const props = handlers();
    await renderWithProviders(
      <QualityContainer requestId={REQUEST_ID} technicianId={TECHNICIAN_ID} {...props} />,
      { api, translations },
    );

    await userEvent.setup().press(await screen.findByRole('button', { name: 'Contester' }));
    expect(props.onDispute).toHaveBeenCalledWith(REQUEST_ID, TECHNICIAN_ID);
  });
});
