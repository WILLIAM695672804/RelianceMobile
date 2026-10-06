import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore, type Role } from '@/core/session';
import invoice from '@/test/fixtures/billing/invoice.json';
import invoicePaid from '@/test/fixtures/billing/invoice-paid.json';
import invoices from '@/test/fixtures/billing/invoices.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { billingTranslations } from '../i18n';
import { InvoiceDetailScreen } from './InvoiceDetailScreen';
import { InvoicesScreen } from './InvoicesScreen';

const NBSP = ' ';
const INVOICE_ID = invoice.data.id;

function setupApi() {
  const api = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { api, mock: new MockAdapter(api) };
}

function storeWith(role: Role) {
  const store = createSessionStore();
  store.getState().setAuthenticated(buildSessionUser(role));
  return store;
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
    expect(screen.getByText(`Montant : 18${NBSP}000${NBSP}FCFA`)).toBeOnTheScreen();
    expect(screen.getByText('À payer')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Voir la facture' }));
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

describe('InvoiceDetailScreen', () => {
  it('laisse le client déclarer le paiement', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/invoices/${INVOICE_ID}`).reply(200, invoice);
    mock.onPost(`/invoices/${INVOICE_ID}/pay`).reply(200, invoicePaid);
    await renderWithProviders(<InvoiceDetailScreen invoiceId={INVOICE_ID} />, {
      api,
      sessionStore: storeWith('client'),
      translations: [billingTranslations],
    });
    const user = userEvent.setup();

    expect(await screen.findByText('Émetteur : Technicien Démo')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Déclarer le paiement' }));
    expect(
      screen.getByText(`Vous confirmez avoir réglé 18${NBSP}000${NBSP}FCFA au technicien.`),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Confirmer' }));

    expect(await screen.findByText('Paiement enregistré.')).toBeOnTheScreen();
    await waitFor(() => expect(mock.history.post).toHaveLength(1));
  });

  it('n’offre pas le paiement au technicien', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/invoices/${INVOICE_ID}`).reply(200, invoice);
    await renderWithProviders(<InvoiceDetailScreen invoiceId={INVOICE_ID} />, {
      api,
      sessionStore: storeWith('technicien'),
      translations: [billingTranslations],
    });

    expect(await screen.findByText('Client : Client Démo')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Déclarer le paiement' })).not.toBeOnTheScreen();
  });

  it('affiche le message du serveur si la facture ne peut être payée', async () => {
    const { api, mock } = setupApi();
    mock.onGet(`/invoices/${INVOICE_ID}`).reply(200, invoice);
    mock
      .onPost(`/invoices/${INVOICE_ID}/pay`)
      .reply(422, { message: 'Cette facture ne peut pas être payée' });
    await renderWithProviders(<InvoiceDetailScreen invoiceId={INVOICE_ID} />, {
      api,
      sessionStore: storeWith('client'),
      translations: [billingTranslations],
    });
    const user = userEvent.setup();

    await user.press(await screen.findByRole('button', { name: 'Déclarer le paiement' }));
    await user.press(screen.getByRole('button', { name: 'Confirmer' }));

    expect(await screen.findByText('Cette facture ne peut pas être payée')).toBeOnTheScreen();
  });
});
