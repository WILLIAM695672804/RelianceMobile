/**
 * Feature `billing` — devis (E16, E17) et factures (E22).
 *
 * Dépend de l'API publique de `@/features/requests` (clés de cache des demandes).
 * @packageDocumentation
 */

export { billingKeys } from './hooks/billingKeys';
export {
  useAcceptQuote,
  useCreateQuote,
  useInvoice,
  useInvoices,
  usePayInvoice,
  useQuote,
  useQuotesSync,
  useRejectQuote,
  useRequestQuotes,
  useSendQuote,
} from './hooks/useBilling';
export { billingTranslations } from './i18n';
export {
  invoiceToneOf,
  isQuoteDecidable,
  isQuoteSendable,
  QUOTE_STATUSES,
  quoteToneOf,
  sumLines,
  type InvoiceStatus,
  type QuoteStatus,
} from './model/quoteStatus';
export { InvoiceDetailScreen, type InvoiceDetailScreenProps } from './screens/InvoiceDetailScreen';
export { InvoicesScreen, type InvoicesScreenProps } from './screens/InvoicesScreen';
export { RequestQuotesScreen, type RequestQuotesScreenProps } from './screens/RequestQuotesScreen';
export type { Invoice, Quote, QuoteLine, QuotePayload } from './schemas/billingSchemas';
export { InvoiceView, type InvoiceDocument, type InvoiceViewProps } from './ui/InvoiceView';
export { QuoteView, type QuoteDocument, type QuoteViewProps } from './ui/QuoteView';
