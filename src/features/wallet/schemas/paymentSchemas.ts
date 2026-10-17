import { z } from 'zod';

import { decimalSchema } from '@/core/api';

export const PAYMENT_STATUSES = ['pending', 'settled', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const paymentSchema = z.object({
  id: z.string(),
  method: z.string().nullish(),
  amount: decimalSchema,
  currency: z.string().nullish(),
  status: z.enum(PAYMENT_STATUSES).catch('pending'),
  /** Référence de la passerelle, à rappeler à l'opérateur. */
  external_ref: z.string().nullish(),
  settled_at: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type Payment = z.infer<typeof paymentSchema>;

export const paymentResponseSchema = z.object({ data: paymentSchema });

/** `POST /wallet/recharge` et `/wallet/withdraw` : paiement initié, à confirmer. */
export const paymentInitiatedResponseSchema = z.object({
  message: z.string().nullish(),
  payment_id: z.string(),
  external_ref: z.string().nullish(),
  status: z.string().nullish(),
});

/** Un paiement réglé ou échoué ne se confirme plus. */
export function isPaymentPending(status: PaymentStatus): boolean {
  return status === 'pending';
}
