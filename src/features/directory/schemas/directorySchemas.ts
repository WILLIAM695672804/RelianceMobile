import { z } from 'zod';

import { decimalSchema } from '@/core/api';
import type { Coordinates } from '@/shared/location';

const asList = <T>(items: T[] | null | undefined): T[] => items ?? [];

/** Technicien de l'annuaire public (`TechnicianCardResource`). */
export const technicianCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullish(),
  verified: z.boolean().nullish(),
  rating: decimalSchema.nullish(),
  num_reviews: z.number().nullish(),
  bio: z.string().nullish(),
  kyc_approved: z.boolean().nullish(),
  skills: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string().nullish(),
        category: z.string().nullish(),
        proficiency: z.number().nullish(),
        hourly_rate: decimalSchema.nullish(),
      }),
    )
    .nullish()
    .transform(asList),
  location: z
    .object({
      city: z.string().nullish(),
      latitude: decimalSchema.nullish(),
      longitude: decimalSchema.nullish(),
      radius: decimalSchema.nullish(),
    })
    .nullish(),
  distance_km: decimalSchema.nullish(),
});
export type TechnicianCard = z.infer<typeof technicianCardSchema>;

export const technicianPageSchema = z.object({
  data: z.array(technicianCardSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }).nullish(),
});

/** Filtres de l'annuaire ; tous facultatifs. */
export interface TechnicianFilters {
  search?: string;
  skill?: string;
  coordinates?: Coordinates | null;
  radiusKm?: number;
}

/** Filtres normalisés, sérialisables : socle des clés de cache. */
export interface NormalizedFilters {
  search: string | null;
  skill: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number | null;
}

export function normalizeFilters(filters: TechnicianFilters): NormalizedFilters {
  const search = filters.search?.trim();
  return {
    search: search ? search : null,
    skill: filters.skill ?? null,
    latitude: filters.coordinates?.latitude ?? null,
    longitude: filters.coordinates?.longitude ?? null,
    radiusKm: filters.coordinates ? (filters.radiusKm ?? null) : null,
  };
}
