import type { BadgeTone } from '@/shared/components';

/** Moyens de paiement acceptés par le serveur, du plus courant au moins courant. */
export const PAYMENT_METHODS = ['momo', 'om', 'card', 'bank_transfer'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Le mobile money exige un numéro de téléphone. */
export function isMobileMethod(method: string): boolean {
  return method === 'momo' || method === 'om';
}

const TRANSACTION_TONES: Record<string, BadgeTone> = {
  credit: 'success',
  debit: 'danger',
  hold: 'warning',
  release: 'neutral',
};

export function transactionToneOf(type: string): BadgeTone {
  return TRANSACTION_TONES[type] ?? 'neutral';
}
