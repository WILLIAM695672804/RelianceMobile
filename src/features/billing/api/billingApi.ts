import type { AxiosInstance } from 'axios';

import { parseResponse } from '@/core/api';

import {
  invoicePageSchema,
  invoiceResponseSchema,
  quoteAcceptedResponseSchema,
  quoteListResponseSchema,
  quoteResponseSchema,
  type Invoice,
  type Quote,
  type QuotePayload,
} from '../schemas/billingSchemas';

const segment = encodeURIComponent;
const quote = (data: unknown): Quote => parseResponse(quoteResponseSchema, data).data;
const invoice = (data: unknown): Invoice => parseResponse(invoiceResponseSchema, data).data;

export interface InvoicesResult {
  invoices: Invoice[];
  total: number | null;
}

/** Résultat de l'acceptation d'un devis : devis mis à jour et facture produite. */
export interface QuoteAcceptance {
  quote: Quote;
  invoiceId: string;
  message: string;
}

/** `POST /quotes` : devis enregistré en brouillon. */
export async function createQuote(client: AxiosInstance, payload: QuotePayload): Promise<Quote> {
  const body: Record<string, unknown> = {
    request_id: payload.requestId,
    total_amount: payload.totalAmount,
    valid_until: payload.validUntil,
  };
  if (payload.breakdown) body.breakdown = payload.breakdown;
  const { data } = await client.post('/quotes', body);
  return quote(data);
}

/** `GET /requests/{id}/quotes` : devis d'une demande, les plus récents d'abord. */
export async function fetchRequestQuotes(
  client: AxiosInstance,
  requestId: string,
): Promise<Quote[]> {
  const { data } = await client.get(`/requests/${segment(requestId)}/quotes`);
  return parseResponse(quoteListResponseSchema, data).data;
}

/** `GET /quotes/{id}`. */
export async function fetchQuote(client: AxiosInstance, quoteId: string): Promise<Quote> {
  const { data } = await client.get(`/quotes/${segment(quoteId)}`);
  return quote(data);
}

/** `POST /quotes/{id}/send` : diffuse `QuoteSubmitted` au client. */
export async function sendQuote(client: AxiosInstance, quoteId: string): Promise<Quote> {
  const { data } = await client.post(`/quotes/${segment(quoteId)}/send`);
  return quote(data);
}

/** `POST /quotes/{id}/accept` : crée la facture et diffuse `InvoiceCreated`. */
export async function acceptQuote(
  client: AxiosInstance,
  quoteId: string,
): Promise<QuoteAcceptance> {
  const { data } = await client.post(`/quotes/${segment(quoteId)}/accept`);
  const parsed = parseResponse(quoteAcceptedResponseSchema, data);
  return { quote: parsed.data.quote, invoiceId: parsed.data.invoice_id, message: parsed.message };
}

/** `POST /quotes/{id}/reject`. */
export async function rejectQuote(client: AxiosInstance, quoteId: string): Promise<Quote> {
  const { data } = await client.post(`/quotes/${segment(quoteId)}/reject`);
  return quote(data);
}

/** `GET /invoices` : première page des factures reçues et émises. */
export async function fetchInvoices(client: AxiosInstance): Promise<InvoicesResult> {
  const { data } = await client.get('/invoices');
  const page = parseResponse(invoicePageSchema, data);
  return { invoices: page.data, total: page.meta?.total ?? null };
}

/** `GET /invoices/{id}`. */
export async function fetchInvoice(client: AxiosInstance, invoiceId: string): Promise<Invoice> {
  const { data } = await client.get(`/invoices/${segment(invoiceId)}`);
  return invoice(data);
}

/** `POST /invoices/{id}/pay` : règle la facture depuis le portefeuille (séquestre puis capture ; 402 si solde insuffisant). */
export async function payInvoice(client: AxiosInstance, invoiceId: string): Promise<Invoice> {
  const { data } = await client.post(`/invoices/${segment(invoiceId)}/pay`);
  return invoice(data);
}
