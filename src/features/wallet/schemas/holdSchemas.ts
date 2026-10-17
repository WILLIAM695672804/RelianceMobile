import { z } from 'zod';

import { decimalSchema } from '@/core/api';

/** États renvoyés par le serveur : « held » tant que les fonds sont gelés. */
export const HOLD_STATUSES = ['held', 'captured', 'released'] as const;
export type HoldStatus = (typeof HOLD_STATUSES)[number];

export const holdSchema = z.object({
  id: z.string(),
  wallet_id: z.string().nullish(),
  amount: decimalSchema,
  reason: z.string().nullish(),
  status: z.enum(HOLD_STATUSES).catch('held'),
  released_at: z.string().nullish(),
  related_payment: z.string().nullish(),
  created_at: z.string().nullish(),
});
export type Hold = z.infer<typeof holdSchema>;

export const holdListResponseSchema = z.object({ data: z.array(holdSchema) });

export const holdResponseSchema = z.object({
  message: z.string().nullish(),
  data: holdSchema.nullish(),
});

/** `POST /holds/{id}/capture` ne renvoie que l'identifiant du paiement émis. */
export const holdCaptureResponseSchema = z.object({
  message: z.string().nullish(),
  payment_id: z.string(),
});

export interface CapturePayload {
  payeeId: string;
  method: string;
}

/** Montant minimal accepté par le serveur. */
export const HOLD_MIN_AMOUNT = 100;

/** Seuls les gels encore actifs peuvent être capturés ou libérés. */
export function isHoldActive(status: HoldStatus): boolean {
  return status === 'held';
}
