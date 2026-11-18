import { screen, userEvent } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import invoice from '@/test/fixtures/billing/invoice.json';
import invoices from '@/test/fixtures/billing/invoices.json';
import { renderWithProviders } from '@/test/render';

import { billingTranslations } from '../i18n';
import { InvoicesScreen } from './InvoicesScreen';

const NBSP = ' ';
const INVOICE_ID = invoice.data.id;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

describe('InvoicesScreen', () => {
  it('liste les factures et ouvre le détail', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/invoices').reply(200, invoices);
    const onOpen = jest.fn();
    await renderWithProviders(<InvoicesScreen onOpen={onOpen} />, {
      api,
      translations: [billingTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText(`Référence : ${invoices.data[0]!.reference}`)).toBeOnTheScreen();
    expect(
      screen.getByText(`Montant : 18${NBSP}000${NBSP}FCFA`, { exact: false }),
    ).toBeOnTheScreen();
    expect(screen.getByText('À payer')).toBeOnTheScreen();

    await user.press(
      screen.getByRole('button', {
        name: `Voir la facture : Référence : ${invoices.data[0]!.reference}`,
      }),
    );
    expect(onOpen).toHaveBeenCalledWith(INVOICE_ID);
  });

  it('signale l’absence de facture', async () => {
    const { api, mock } = setupApi();
    mock.onGet('/invoices').reply(200, { data: [] });
    await renderWithProviders(<InvoicesScreen onOpen={jest.fn()} />, {
      api,
      translations: [billingTranslations],
    });

    expect(await screen.findByText('Aucune facture.')).toBeOnTheScreen();
  });
});
