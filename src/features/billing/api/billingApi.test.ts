import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import invoicePaid from '@/test/fixtures/billing/invoice-paid.json';
import invoice from '@/test/fixtures/billing/invoice.json';
import invoices from '@/test/fixtures/billing/invoices.json';
import quoteAccepted from '@/test/fixtures/billing/quote-accepted.json';
import quoteCreated from '@/test/fixtures/billing/quote-created.json';
import quoteRejected from '@/test/fixtures/billing/quote-rejected.json';
import quoteSent from '@/test/fixtures/billing/quote-sent.json';
import quote from '@/test/fixtures/billing/quote.json';
import quotes from '@/test/fixtures/billing/quotes.json';

import {
  acceptQuote,
  createQuote,
  fetchInvoice,
  fetchInvoices,
  fetchQuote,
  fetchRequestQuotes,
  payInvoice,
  rejectQuote,
  sendQuote,
} from './billingApi';

const QUOTE_ID = quoteCreated.data.id;
const INVOICE_ID = invoice.data.id;
const REQUEST_ID = quoteCreated.data.request_id;

function setup() {
  const client = axios.create({ baseURL: 'http://api.test/api/v1' });
  return { client, mock: new MockAdapter(client) };
}

describe('billingApi', () => {
  it('crée un devis au format du serveur', async () => {
    const { client, mock } = setup();
    mock.onPost('/quotes').reply(201, quoteCreated);

    await expect(
      createQuote(client, {
        requestId: REQUEST_ID,
        totalAmount: 18000,
        breakdown: [{ label: 'Main d’œuvre', amount: 12000 }],
        validUntil: '2026-10-13',
      }),
    ).resolves.toMatchObject({ id: QUOTE_ID, status: 'draft' });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: REQUEST_ID,
      total_amount: 18000,
      breakdown: [{ label: 'Main d’œuvre', amount: 12000 }],
      valid_until: '2026-10-13',
    });
  });

  it('omet le détail absent', async () => {
    const { client, mock } = setup();
    mock.onPost('/quotes').reply(201, quoteCreated);

    await createQuote(client, {
      requestId: REQUEST_ID,
      totalAmount: 25000,
      breakdown: null,
      validUntil: '2026-10-13',
    });

    expect(JSON.parse(mock.history.post[0]?.data as string)).toEqual({
      request_id: REQUEST_ID,
      total_amount: 25000,
      valid_until: '2026-10-13',
    });
  });

  it('lit les devis d’une demande et le détail d’un devis', async () => {
    const { client, mock } = setup();
    mock.onGet(`/requests/${REQUEST_ID}/quotes`).reply(200, quotes);
    mock.onGet(`/quotes/${QUOTE_ID}`).reply(200, quote);

    await expect(fetchRequestQuotes(client, REQUEST_ID)).resolves.toHaveLength(quotes.data.length);
    await expect(fetchQuote(client, QUOTE_ID)).resolves.toMatchObject({ id: QUOTE_ID });
  });

  it('envoie, accepte et refuse un devis', async () => {
    const { client, mock } = setup();
    mock.onPost(`/quotes/${QUOTE_ID}/send`).reply(200, quoteSent);
    mock.onPost(`/quotes/${QUOTE_ID}/accept`).reply(200, quoteAccepted);
    mock.onPost(`/quotes/${QUOTE_ID}/reject`).reply(200, quoteRejected);

    await expect(sendQuote(client, QUOTE_ID)).resolves.toMatchObject({ status: 'sent' });
    await expect(acceptQuote(client, QUOTE_ID)).resolves.toMatchObject({
      invoiceId: quoteAccepted.data.invoice_id,
      message: quoteAccepted.message,
    });
    await expect(rejectQuote(client, QUOTE_ID)).resolves.toMatchObject({ status: 'rejected' });
  });

  it('lit les factures, leur détail et déclare le paiement', async () => {
    const { client, mock } = setup();
    mock.onGet('/invoices').reply(200, invoices);
    mock.onGet(`/invoices/${INVOICE_ID}`).reply(200, invoice);
    mock.onPost(`/invoices/${INVOICE_ID}/pay`).reply(200, invoicePaid);

    await expect(fetchInvoices(client)).resolves.toMatchObject({ total: invoices.meta.total });
    await expect(fetchInvoice(client, INVOICE_ID)).resolves.toMatchObject({ id: INVOICE_ID });
    await expect(payInvoice(client, INVOICE_ID)).resolves.toMatchObject({ status: 'paid' });
  });
});
