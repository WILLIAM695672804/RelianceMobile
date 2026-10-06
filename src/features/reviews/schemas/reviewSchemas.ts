import { z } from 'zod';

import { decimalSchema } from '@/core/api';

const asList = <T>(items: T[] | null | undefined): T[] => items ?? [];

/** Avis déposé par un client sur un technicien. */
export const reviewSchema = z.object({
  id: z.string(),
  reviewer_id: z.string().nullish(),
  target_id: z.string().nullish(),
  request_id: z.string().nullish(),
  rating: decimalSchema,
  comment: z.string().nullish(),
  created_at: z.string().nullish(),
  reviewer: z.object({ name: z.string(), avatar_url: z.string().nullish() }).nullish(),
  request: z.object({ id: z.string(), title: z.string() }).nullish(),
});
export type Review = z.infer<typeof reviewSchema>;

export const badgeSchema = z.object({
  code: z.string(),
  title: z.string(),
  icon_ref: z.string().nullish(),
  awarded_at: z.string().nullish(),
});
export type Badge = z.infer<typeof badgeSchema>;

/** `POST /reviews` : le technicien brut (`data.target`) est écarté par le schéma. */
export const reviewCreatedResponseSchema = z.object({
  message: z.string(),
  data: reviewSchema,
  new_badges: z.array(badgeSchema).nullish().transform(asList),
});

/** Pagination imbriquée des avis : `{ data: { data: [...], total } }`. */
export const reviewPageResponseSchema = z.object({
  data: z.object({
    data: z.array(reviewSchema),
    current_page: z.number().nullish(),
    last_page: z.number().nullish(),
    total: z.number().nullish(),
  }),
});

export const badgeListResponseSchema = z.object({ data: z.array(badgeSchema) });

export const reputationResponseSchema = z.object({
  data: z.object({
    data: z.array(
      z.object({
        id: z.string(),
        change: z.number(),
        reason: z.string().nullish(),
        created_at: z.string().nullish(),
      }),
    ),
    total: z.number().nullish(),
  }),
  total: z.number(),
});
export type Reputation = z.infer<typeof reputationResponseSchema>;

export const COMMENT_MAX_LENGTH = 2000;
export const RATING_VALUES = [1, 2, 3, 4, 5] as const;

/** Formulaire d'avis : note obligatoire, commentaire facultatif. */
export const reviewFormSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'reviews:form.errors.ratingRequired')
    .max(5, 'reviews:form.errors.ratingRequired'),
  comment: z.string().trim().max(COMMENT_MAX_LENGTH, 'reviews:form.errors.commentTooLong'),
});
export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

/** Corps de `POST /reviews`. */
export interface ReviewPayload {
  requestId: string;
  rating: number;
  comment: string | null;
}

export function toReviewPayload(requestId: string, values: ReviewFormValues): ReviewPayload {
  return { requestId, rating: values.rating, comment: values.comment.trim() || null };
}
