import { z } from 'zod';

import { decimalSchema } from '@/core/api';

const asList = <T>(items: T[] | null | undefined): T[] => items ?? [];

/** Technicien proposé par `POST /requests/{id}/match`. */
export const matchedTechnicianSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullish(),
  rating: decimalSchema.nullish(),
  num_reviews: z.number().nullish(),
  verified: z.boolean().nullish(),
  distance_km: decimalSchema.nullish(),
  match_score: z.number(),
  skills: z
    .array(
      z.object({
        name: z.string(),
        proficiency: z.number().nullish(),
        hourly_rate: decimalSchema.nullish(),
      }),
    )
    .nullish()
    .transform(asList),
});
export type MatchedTechnician = z.infer<typeof matchedTechnicianSchema>;

export const matchResponseSchema = z.object({
  data: z.object({ technicians: z.array(matchedTechnicianSchema) }),
});

/** Profil public d'un technicien ; courriel et téléphone, exposés par le serveur, sont écartés. */
export const technicianProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullish(),
  verified: z.boolean().nullish(),
  rating: decimalSchema.nullish(),
  num_reviews: z.number().nullish(),
  bio: z.string().nullish(),
  skills: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        category: z.string().nullish(),
        hourly_rate: decimalSchema.nullish(),
      }),
    )
    .nullish()
    .transform(asList),
  service_perimeter: z.object({ city: z.string().nullish() }).nullish(),
  recent_reviews: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]),
        rating: decimalSchema,
        comment: z.string().nullish(),
        reviewer: z.object({ name: z.string() }).nullish(),
      }),
    )
    .nullish()
    .transform(asList),
});
export type TechnicianProfile = z.infer<typeof technicianProfileSchema>;

export const technicianProfileResponseSchema = z.object({ data: technicianProfileSchema });

export const PROPOSAL_STATUSES = ['pending', 'accepted', 'refused', 'rejected', 'expired'] as const;
const proposalStatusSchema = z.enum(PROPOSAL_STATUSES).or(z.string());

/** Proposition créée par le client (`select-technician`) ; la demande et le technicien bruts sont écartés. */
export const proposalSentResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    id: z.string(),
    status: proposalStatusSchema,
    price: decimalSchema,
    expires_at: z.string().nullish(),
  }),
});
export type SentProposal = z.infer<typeof proposalSentResponseSchema>['data'];

/** Proposition reçue par le technicien (`GET /proposals/my`) ; le client brut est écarté. */
export const receivedProposalSchema = z.object({
  id: z.string(),
  request_id: z.string(),
  status: proposalStatusSchema,
  price: decimalSchema,
  message: z.string().nullish(),
  expires_at: z.string().nullish(),
  request: z
    .object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullish(),
      category: z.object({ name: z.string() }).nullish(),
      address: z.object({ address: z.string().nullish(), city: z.string().nullish() }).nullish(),
    })
    .nullish(),
});
export type ReceivedProposal = z.infer<typeof receivedProposalSchema>;

export const receivedProposalsResponseSchema = z.object({
  data: z.object({ data: z.array(receivedProposalSchema) }),
});

/** Mission acceptée par le technicien (`GET /proposals/active-mission`). */
export const activeMissionSchema = z.object({
  proposal_id: z.string(),
  price: decimalSchema,
  request: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullish(),
    category: z.string().nullish(),
  }),
  client: z.object({ id: z.string(), name: z.string() }).nullish(),
  address: z.object({ address: z.string().nullish(), city: z.string().nullish() }).nullish(),
});
export type ActiveMission = z.infer<typeof activeMissionSchema>;

export const activeMissionResponseSchema = z.object({ data: activeMissionSchema.nullable() });

export const messageResponseSchema = z.object({ message: z.string() });

export const OFFER_MESSAGE_MAX_LENGTH = 1000;

/** Formulaire d'offre (E12) ; les messages sont des clés de traduction. */
export const offerFormSchema = z.object({
  price: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, 'matching:offer.errors.priceInvalid'),
  message: z.string().max(OFFER_MESSAGE_MAX_LENGTH, 'matching:offer.errors.messageTooLong'),
});
export type OfferFormValues = z.infer<typeof offerFormSchema>;

/** Corps métier de `POST /requests/{id}/select-technician`. */
export interface OfferPayload {
  technicianId: string;
  price: number;
  message: string | null;
}

export function toOfferPayload(technicianId: string, values: OfferFormValues): OfferPayload {
  const message = values.message.trim();
  return { technicianId, price: Number(values.price), message: message || null };
}
