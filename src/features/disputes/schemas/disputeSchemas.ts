import { z } from 'zod';

export const DISPUTE_STATUSES = ['open', 'in_review', 'resolved', 'closed'] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

/** Partie au litige ; seuls les champs affichés sont retenus. */
const party = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullish(),
});

export const disputeMessageSchema = z.object({
  id: z.string(),
  dispute_id: z.string().nullish(),
  sender_id: z.string().nullish(),
  message: z.string(),
  created_at: z.string().nullish(),
  sender: party.nullish(),
});
export type DisputeMessage = z.infer<typeof disputeMessageSchema>;

export const disputeSchema = z.object({
  id: z.string(),
  request_id: z.string().nullish(),
  opened_by: z.string().nullish(),
  against: z.string().nullish(),
  reason: z.string(),
  description: z.string().nullish(),
  status: z.enum(DISPUTE_STATUSES).catch('open'),
  resolution: z.string().nullish(),
  resolved_at: z.string().nullish(),
  created_at: z.string().nullish(),
  opener: party.nullish(),
  defendant: party.nullish(),
  messages: z.array(disputeMessageSchema).nullish(),
});
export type Dispute = z.infer<typeof disputeSchema>;

/** `GET /disputes` : paginateur Laravel renvoyé tel quel, sans enveloppe `data` externe. */
export const disputePageResponseSchema = z.object({
  data: z.array(disputeSchema),
  current_page: z.number().nullish(),
  last_page: z.number().nullish(),
  total: z.number().nullish(),
});

export const disputeResponseSchema = z.object({
  message: z.string().nullish(),
  data: disputeSchema,
});

export const disputeMessageResponseSchema = z.object({
  message: z.string().nullish(),
  data: disputeMessageSchema,
});

export const DESCRIPTION_MAX_LENGTH = 4000;
export const MESSAGE_MAX_LENGTH = 2000;

/** Motifs proposés, repris de `CancelScreen` et `DisputeScreen` des maquettes. */
export const DISPUTE_REASONS = [
  'work_not_done',
  'quality',
  'delay',
  'amount',
  'behaviour',
  'other',
] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export const disputeFormSchema = z.object({
  reason: z.enum(DISPUTE_REASONS, { message: 'disputes:form.errors.reasonRequired' }),
  description: z
    .string()
    .trim()
    .min(1, 'disputes:form.errors.descriptionRequired')
    .max(DESCRIPTION_MAX_LENGTH, 'disputes:form.errors.descriptionTooLong'),
});
export type DisputeFormValues = z.infer<typeof disputeFormSchema>;

export const messageFormSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'disputes:thread.errors.messageRequired')
    .max(MESSAGE_MAX_LENGTH, 'disputes:thread.errors.messageTooLong'),
});
export type MessageFormValues = z.infer<typeof messageFormSchema>;

export interface DisputePayload {
  requestId: string;
  against: string;
  reason: DisputeReason;
  description: string;
}

/** Un litige clos n'accepte plus de message : le serveur renvoie 422. */
export function isDisputeClosed(status: DisputeStatus): boolean {
  return status === 'resolved' || status === 'closed';
}
