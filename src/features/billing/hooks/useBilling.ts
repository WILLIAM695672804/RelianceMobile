import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '@/core/api';
import { channels, useChannelEvent } from '@/core/realtime';
import { useSession } from '@/core/session';
import { requestsKeys } from '@/features/requests';

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
} from '../api/billingApi';
import type { QuotePayload } from '../schemas/billingSchemas';
import { billingKeys } from './billingKeys';

/** Devis d'une demande. */
export function useRequestQuotes(requestId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: billingKeys.requestQuotes(requestId),
    queryFn: () => fetchRequestQuotes(api, requestId),
  });
}

export function useQuote(quoteId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: billingKeys.quote(quoteId),
    queryFn: () => fetchQuote(api, quoteId),
  });
}

export function useInvoices() {
  const api = useApiClient();
  return useQuery({ queryKey: billingKeys.invoices(), queryFn: () => fetchInvoices(api) });
}

export function useInvoice(invoiceId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: billingKeys.invoice(invoiceId),
    queryFn: () => fetchInvoice(api, invoiceId),
  });
}

/** Toute écriture recharge la facturation. */
function useBillingInvalidation() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: billingKeys.all });
}

export function useCreateQuote(requestId: string) {
  const api = useApiClient();
  const invalidate = useBillingInvalidation();
  return useMutation({
    mutationFn: (payload: QuotePayload) => createQuote(api, { ...payload, requestId }),
    onSuccess: invalidate,
  });
}

export function useSendQuote() {
  const api = useApiClient();
  const invalidate = useBillingInvalidation();
  return useMutation({
    mutationFn: (quoteId: string) => sendQuote(api, quoteId),
    onSuccess: invalidate,
  });
}

/** L'acceptation crée la facture et repasse la demande à « attribuée ». */
export function useAcceptQuote() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quoteId: string) => acceptQuote(api, quoteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: billingKeys.all });
      await queryClient.invalidateQueries({ queryKey: requestsKeys.all });
    },
  });
}

export function useRejectQuote() {
  const api = useApiClient();
  const invalidate = useBillingInvalidation();
  return useMutation({
    mutationFn: (quoteId: string) => rejectQuote(api, quoteId),
    onSuccess: invalidate,
  });
}

export function usePayInvoice() {
  const api = useApiClient();
  const invalidate = useBillingInvalidation();
  return useMutation({
    mutationFn: (invoiceId: string) => payInvoice(api, invoiceId),
    onSuccess: invalidate,
  });
}

/** Canal `quotes.{userId}` : devis reçu ou facture émise. */
export function useQuotesSync() {
  const userId = useSession((state) => state.user?.id ?? null);
  const queryClient = useQueryClient();
  const channel = userId ? channels.quotes(userId) : null;
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: billingKeys.all });
  };

  useChannelEvent(channel, 'QuoteSubmitted', invalidate);
  useChannelEvent(channel, 'InvoiceCreated', invalidate);
}
