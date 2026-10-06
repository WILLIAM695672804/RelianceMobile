/** Clés de cache de la feature `billing`. */
export const billingKeys = {
  all: ['billing'] as const,
  quotes: () => [...billingKeys.all, 'quotes'] as const,
  requestQuotes: (requestId: string) => [...billingKeys.quotes(), 'request', requestId] as const,
  quote: (quoteId: string) => [...billingKeys.quotes(), 'detail', quoteId] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  invoice: (invoiceId: string) => [...billingKeys.invoices(), 'detail', invoiceId] as const,
};
