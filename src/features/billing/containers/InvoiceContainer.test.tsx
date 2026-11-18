import { screen, userEvent, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { createSessionStore } from '@/core/session';
import invoiceFixture from '@/test/fixtures/billing/invoice.json';
import invoicePaid from '@/test/fixtures/billing/invoice-paid.json';
import quoteFixture from '@/test/fixtures/billing/quote.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { renderWithProviders } from '@/test/render';

import { billingTranslations } from '../i18n';
import { invoiceResponseSchema, quoteResponseSchema } from '../schemas/billingSchemas';
import { InvoiceContainer, toInvoiceDocument } from './InvoiceContainer';

const INVOICE = invoiceResponseSchema.parse(invoiceFixture).data;
const QUOTE = quoteResponseSchema.parse(quoteFixture).data;
const t = (key: string) => key;

describe('toInvoiceDocument', () => {
  it('reprend la ventilation du devis d’origine', () => {
    const document = toInvoiceDocument(
      INVOICE,
      {
        ...QUOTE,
        breakdown: [
          { label: 'Main d’œuvre', amount: 12000 },
          { label: 'Pièces', amount: 6000 },
        ],
      },
      t,
    );
    expect(document.number).toBe('INV-WN2PKKQG');
    expect(document.status).toBe('pending');
    expect(document.lines.map((line) => line.unitPrice)).toEqual([12000, 6000]);
    expect(document.footer).toEqual([]);
  });

  it('se replie sur une prestation unique et rappelle la taxe incluse', () => {
    const document = toInvoiceDocument({ ...INVOICE, tax_amount: 1000 }, null, t);
    expect(document.lines).toEqual([
      { label: 'billing:invoiceView.service', quantity: 1, unitPrice: 18000 },
    ]);
    expect(document.footer).toHaveLength(1);
  });
});

describe('InvoiceContainer', () => {
  it('permet au client de déclarer le paiement d’une facture à régler', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock.onGet(`/invoices/${INVOICE.id}`).reply(200, invoiceFixture);
    mock.onGet(`/quotes/${INVOICE.quote_id}`).reply(200, quoteFixture);
    mock.onPost(`/invoices/${INVOICE.id}/pay`).reply(200, invoicePaid);
    const store = createSessionStore();
    store.getState().setAuthenticated(buildSessionUser('client'));
    await renderWithProviders(<InvoiceContainer invoiceId={INVOICE.id} onBack={jest.fn()} />, {
      api,
      sessionStore: store,
      translations: [billingTranslations],
    });

    await userEvent
      .setup()
      .press(await screen.findByRole('button', { name: 'Déclarer le paiement' }));

    await waitFor(() =>
      expect(mock.history.post.some((r) => r.url === `/invoices/${INVOICE.id}/pay`)).toBe(true),
    );
  });

  it('ne propose pas le paiement au technicien', async () => {
    const api = axios.create({ baseURL: 'http://api.test/api/v1' });
    const mock = new MockAdapter(api);
    mock.onGet(`/invoices/${INVOICE.id}`).reply(200, invoiceFixture);
    mock.onGet(`/quotes/${INVOICE.quote_id}`).reply(200, quoteFixture);
    const store = createSessionStore();
    store.getState().setAuthenticated(buildSessionUser('technicien'));
    await renderWithProviders(<InvoiceContainer invoiceId={INVOICE.id} onBack={jest.fn()} />, {
      api,
      sessionStore: store,
      translations: [billingTranslations],
    });

    expect(await screen.findByText('INV-WN2PKKQG')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Déclarer le paiement' })).toBeNull();
  });
});
