import { act, renderHook, waitFor } from '@testing-library/react-native';
import MockAdapter from 'axios-mock-adapter';

import { createRealtimeService } from '@/core/realtime';
import { createSessionStore } from '@/core/session';
import { requestsKeys } from '@/features/requests';
import { createFakeRealtimeClient } from '@/test/fakeRealtime';
import invoice from '@/test/fixtures/billing/invoice.json';
import invoicePaid from '@/test/fixtures/billing/invoice-paid.json';
import invoices from '@/test/fixtures/billing/invoices.json';
import quoteAccepted from '@/test/fixtures/billing/quote-accepted.json';
import quoteCreated from '@/test/fixtures/billing/quote-created.json';
import quoteRejected from '@/test/fixtures/billing/quote-rejected.json';
import quoteSent from '@/test/fixtures/billing/quote-sent.json';
import quotes from '@/test/fixtures/billing/quotes.json';
import { buildSessionUser } from '@/test/fixtures/users';
import { createTestProviders } from '@/test/render';

import { billingKeys } from './billingKeys';
import {
  useAcceptQuote,
  useCreateQuote,
  useInvoice,
  useInvoices,
  usePayInvoice,
  useQuotesSync,
  useRejectQuote,
  useRequestQuotes,
  useSendQuote,
} from './useBilling';

const QUOTE_ID = quoteCreated.data.id;
const REQUEST_ID = quoteCreated.data.request_id;
const INVOICE_ID = invoice.data.id;

function setup() {
  const fake = createFakeRealtimeClient();
  const realtime = createRealtimeService(() => fake.client);
  const sessionStore = createSessionStore();
  sessionStore.getState().setAuthenticated(buildSessionUser('client', { id: 'u1' }));
  realtime.start();
  const providers = createTestProviders({ realtime, sessionStore });
  return {
    ...providers,
    fake,
    mock: new MockAdapter(providers.api),
    wrapper: providers.TestProviders,
  };
}

describe('hooks de facturation', () => {
  it('hiérarchise les clés sous « billing »', () => {
    expect(billingKeys.requestQuotes('r1')).toEqual(['billing', 'quotes', 'request', 'r1']);
    expect(billingKeys.quote('q1')).toEqual(['billing', 'quotes', 'detail', 'q1']);
    expect(billingKeys.invoices()).toEqual(['billing', 'invoices']);
    expect(billingKeys.invoice('i1')).toEqual(['billing', 'invoices', 'detail', 'i1']);
  });

  it('lit les devis d’une demande, les factures et une facture', async () => {
    const { mock, wrapper } = setup();
    mock.onGet(`/requests/${REQUEST_ID}/quotes`).reply(200, quotes);
    mock.onGet('/invoices').reply(200, invoices);
    mock.onGet(`/invoices/${INVOICE_ID}`).reply(200, invoice);

    const hooks = [
      await renderHook(() => useRequestQuotes(REQUEST_ID), { wrapper }),
      await renderHook(() => useInvoices(), { wrapper }),
      await renderHook(() => useInvoice(INVOICE_ID), { wrapper }),
    ];

    for (const { result } of hooks) {
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    }
  });

  it('les écritures rechargent la facturation ; l’acceptation recharge aussi les demandes', async () => {
    const { mock, wrapper, queryClient } = setup();
    mock.onPost('/quotes').reply(201, quoteCreated);
    mock.onPost(`/quotes/${QUOTE_ID}/send`).reply(200, quoteSent);
    mock.onPost(`/quotes/${QUOTE_ID}/accept`).reply(200, quoteAccepted);
    mock.onPost(`/quotes/${QUOTE_ID}/reject`).reply(200, quoteRejected);
    mock.onPost(`/invoices/${INVOICE_ID}/pay`).reply(200, invoicePaid);
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const create = await renderHook(() => useCreateQuote(REQUEST_ID), { wrapper });
    const send = await renderHook(() => useSendQuote(), { wrapper });
    const accept = await renderHook(() => useAcceptQuote(), { wrapper });
    const reject = await renderHook(() => useRejectQuote(), { wrapper });
    const pay = await renderHook(() => usePayInvoice(), { wrapper });

    await act(async () => {
      await create.result.current.mutateAsync({
        requestId: REQUEST_ID,
        totalAmount: 18000,
        breakdown: null,
        validUntil: '2026-10-13',
      });
      await send.result.current.mutateAsync(QUOTE_ID);
      await accept.result.current.mutateAsync(QUOTE_ID);
      await reject.result.current.mutateAsync(QUOTE_ID);
      await pay.result.current.mutateAsync(INVOICE_ID);
    });
    await waitFor(() => expect(pay.result.current.isSuccess).toBe(true));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: billingKeys.all });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: requestsKeys.all });
  });

  it('useQuotesSync recharge la facturation aux événements du canal', async () => {
    const { wrapper, queryClient, fake } = setup();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    await renderHook(() => useQuotesSync(), { wrapper });

    await act(async () => {
      fake.channels.get('quotes.u1')?.emit('QuoteSubmitted', { quote_id: 'q1' });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: billingKeys.all });

    invalidate.mockClear();
    await act(async () => {
      fake.channels.get('quotes.u1')?.emit('InvoiceCreated', { invoice_id: 'i1' });
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: billingKeys.all });
  });
});
