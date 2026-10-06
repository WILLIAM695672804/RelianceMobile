import { z } from 'zod';

import { decimalSchema } from '@/core/api';

export const followCheckSchema = z.object({ following: z.boolean() });

export const followCountsSchema = z.object({
  followers_count: z.number(),
  following_count: z.number(),
});
export type FollowCounts = z.infer<typeof followCountsSchema>;

/** Réponse d'un abonnement ou d'un désabonnement. */
export const followResultSchema = z.object({
  following: z.boolean(),
  followers_count: z.number().nullish(),
  message: z.string().nullish(),
});

/** Compte suggéré ; le serveur ne filtre pas par rôle. */
export const suggestionSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullish(),
  rating: decimalSchema.nullish(),
  verified: z.boolean().nullish(),
});
export type FollowSuggestion = z.infer<typeof suggestionSchema>;

export const suggestionsResponseSchema = z.object({ data: z.array(suggestionSchema) });
