import type { BadgeTone } from '@/shared/components';

/** Statuts d'un devis (`quotes.status`). */
export const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

/** Statuts d'une facture (`invoices.status`). */
export const INVOICE_STATUSES = ['unpaid', 'paid', 'cancelled'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

const QUOTE_TONES: Record<QuoteStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'warning',
  accepted: 'success',
  rejected: 'danger',
  expired: 'neutral',
};

const INVOICE_TONES: Record<InvoiceStatus, BadgeTone> = {
  unpaid: 'warning',
  paid: 'success',
  cancelled: 'neutral',
};

export function quoteToneOf(status: string): BadgeTone {
  return (QUOTE_TONES as Record<string, BadgeTone>)[status] ?? 'neutral';
}

export function invoiceToneOf(status: string): BadgeTone {
  return (INVOICE_TONES as Record<string, BadgeTone>)[status] ?? 'neutral';
}

/** Seul un brouillon s'envoie au client. */
export function isQuoteSendable(status: string): boolean {
  return status === 'draft';
}

/**
 * Le mobile ne laisse décider que les devis envoyés, bien que le serveur
 * accepte aussi les brouillons (`Quote::isAcceptable`).
 */
export function isQuoteDecidable(status: string): boolean {
  return status === 'sent';
}

export function sumLines<T extends { amount: number }>(lines: T[]): number {
  return lines.reduce((total, line) => total + line.amount, 0);
}
