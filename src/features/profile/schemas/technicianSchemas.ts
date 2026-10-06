import { z } from 'zod';

import { decimalSchema } from '@/core/api';
import type { FieldErrors } from '@/core/errors';
import type { Coordinates } from '@/shared/location';

const asList = <T>(items: T[] | null | undefined): T[] => items ?? [];
const optionalList = <T extends z.ZodTypeAny>(item: T) => z.array(item).nullish().transform(asList);

/** Compétence tarifée du technicien (`GET /technician/skills`). */
export const technicianSkillSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.string().nullish(),
  proficiency: z.number().nullish(),
  experience_years: z.number().nullish(),
  hourly_rate: decimalSchema.nullish(),
  travel_fee: decimalSchema.nullish(),
});
export type TechnicianSkill = z.infer<typeof technicianSkillSchema>;

export const technicianSkillListResponseSchema = z.object({
  data: z.array(technicianSkillSchema),
});

/** Zone d'intervention déclarée. */
export const servicePerimeterSchema = z.object({
  city: z.string().nullish(),
  address: z.string().nullish(),
  zones: optionalList(z.string()),
  latitude: decimalSchema.nullish(),
  longitude: decimalSchema.nullish(),
  radius: decimalSchema.nullish(),
});
export type ServicePerimeter = z.infer<typeof servicePerimeterSchema>;

/** Profil professionnel du technicien connecté (`IdentityHubResource`). */
export const technicianIdentitySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  avatar_url: z.string().nullish(),
  verified: z.boolean().nullish(),
  rating: decimalSchema.nullish(),
  num_reviews: z.number().nullish(),
  bio: z.string().nullish(),
  competences: optionalList(z.string()),
  kyc_approved: z.boolean().nullish(),
  skills: optionalList(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string().nullish(),
      category: z.string().nullish(),
      proficiency: z.number().nullish(),
      hourly_rate: decimalSchema.nullish(),
      travel_fee: decimalSchema.nullish(),
    }),
  ),
  service_perimeter: servicePerimeterSchema.nullish(),
  badges: optionalList(
    z.object({ code: z.string(), title: z.string(), awarded_at: z.string().nullish() }),
  ),
  recent_reviews: optionalList(
    z.object({
      id: z.union([z.string(), z.number()]),
      rating: decimalSchema,
      comment: z.string().nullish(),
      reviewer: z.object({ name: z.string() }).nullish(),
    }),
  ),
});
export type TechnicianIdentity = z.infer<typeof technicianIdentitySchema>;

export const technicianIdentityResponseSchema = z.object({ data: technicianIdentitySchema });

/** Statistiques d'activité (`GET /technician/stats`, sans enveloppe `data`). */
export const technicianStatsSchema = z.object({
  wallet_balance: decimalSchema.nullish(),
  available_balance: decimalSchema.nullish(),
  total_earnings: decimalSchema.nullish(),
  monthly_earnings: decimalSchema.nullish(),
  rating: decimalSchema.nullish(),
  num_reviews: z.number().nullish(),
  missions_total: z.number(),
  missions_completed: z.number(),
  completion_rate: decimalSchema.nullish(),
  category_breakdown: optionalList(z.object({ label: z.string(), value: z.number() })),
  monthly_missions: optionalList(z.object({ label: z.string(), count: z.number() })),
  recent_missions: optionalList(
    z.object({
      id: z.string(),
      title: z.string(),
      category: z.string().nullish(),
      city: z.string().nullish(),
      status: z.string(),
    }),
  ),
});
export type TechnicianStats = z.infer<typeof technicianStatsSchema>;

export const messageOnlyResponseSchema = z.object({ message: z.string() });

export const BIO_MAX_LENGTH = 1000;
export const COMPETENCE_MAX_LENGTH = 50;
export const COMPETENCES_MAX_LENGTH = 500;
export const RADIUS_MIN_KM = 1;
export const RADIUS_MAX_KM = 500;
export const PROFICIENCY_LEVELS = [1, 2, 3, 4, 5] as const;
export const EXPERIENCE_MAX_YEARS = 50;

/** Savoir-faire saisis en une ligne : « Normes, Tableaux » → `['Normes', 'Tableaux']`. */
export function parseCompetences(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function formatCompetences(items: string[]): string {
  return items.join(', ');
}

/** Formulaire du profil professionnel (nom et téléphone restent à E09). */
export const technicianProfileFormSchema = z.object({
  bio: z.string().trim().max(BIO_MAX_LENGTH, 'profile:technician.errors.bioTooLong'),
  competences: z
    .string()
    .max(COMPETENCES_MAX_LENGTH, 'profile:technician.errors.competencesTooLong')
    .refine(
      (value): boolean =>
        parseCompetences(value).every((item) => item.length <= COMPETENCE_MAX_LENGTH),
      'profile:technician.errors.competenceTooLong',
    ),
});
export type TechnicianProfileFormValues = z.infer<typeof technicianProfileFormSchema>;

/** Corps de `PUT /technician/profile`. */
export interface TechnicianProfilePayload {
  bio: string;
  competences: string[];
}

export function toTechnicianProfilePayload(
  values: TechnicianProfileFormValues,
): TechnicianProfilePayload {
  return { bio: values.bio.trim(), competences: parseCompetences(values.competences) };
}

/** Formulaire de la zone d'intervention ; la position est fournie séparément. */
export const serviceAreaFormSchema = z.object({
  address: z.string().trim().max(255, 'profile:zone.errors.addressTooLong'),
  city: z.string().trim().max(100, 'profile:zone.errors.cityTooLong'),
  radiusKm: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, 'profile:zone.errors.radiusInvalid')
    .refine(
      (value): boolean => Number(value) <= RADIUS_MAX_KM,
      'profile:zone.errors.radiusTooLarge',
    ),
  zones: z.string().max(COMPETENCES_MAX_LENGTH, 'profile:zone.errors.zonesTooLong'),
});
export type ServiceAreaFormValues = z.infer<typeof serviceAreaFormSchema>;

/** Corps de `PUT /technician/location`. */
export interface ServiceAreaPayload {
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  radius: number;
  zones: string[];
}

export function toServiceAreaPayload(
  values: ServiceAreaFormValues,
  coordinates: Coordinates,
): ServiceAreaPayload {
  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    address: values.address.trim() || null,
    city: values.city.trim() || null,
    radius: Number(values.radiusKm),
    zones: parseCompetences(values.zones),
  };
}

const wholeNumber = (message: string) => z.string().trim().regex(/^\d+$/, message);

/** Formulaire d'ajout d'une compétence tarifée. */
export const technicianSkillFormSchema = z.object({
  skillId: z.string().min(1, 'profile:skills.errors.skillRequired'),
  proficiency: z
    .number()
    .int()
    .min(1, 'profile:skills.errors.proficiencyInvalid')
    .max(5, 'profile:skills.errors.proficiencyInvalid'),
  experienceYears: wholeNumber('profile:skills.errors.experienceInvalid').refine(
    (value): boolean => Number(value) <= EXPERIENCE_MAX_YEARS,
    'profile:skills.errors.experienceTooLong',
  ),
  hourlyRate: wholeNumber('profile:skills.errors.rateInvalid'),
  travelFee: wholeNumber('profile:skills.errors.feeInvalid'),
});
export type TechnicianSkillFormValues = z.infer<typeof technicianSkillFormSchema>;
export type TechnicianSkillFormField = keyof TechnicianSkillFormValues;

/** Corps de `POST /technician/skills`. */
export interface TechnicianSkillPayload {
  skillId: string;
  proficiency: number;
  experienceYears: number;
  hourlyRate: number;
  travelFee: number;
}

export function toTechnicianSkillPayload(
  values: TechnicianSkillFormValues,
): TechnicianSkillPayload {
  return {
    skillId: values.skillId,
    proficiency: values.proficiency,
    experienceYears: Number(values.experienceYears),
    hourlyRate: Number(values.hourlyRate),
    travelFee: Number(values.travelFee),
  };
}

/** Traduit les champs du serveur en champs de formulaire ; les champs inconnus sont ignorés. */
function mapFieldErrors(errors: FieldErrors, mapping: Record<string, string>): FieldErrors {
  const mapped: FieldErrors = {};
  for (const [field, messages] of Object.entries(errors)) {
    const target = mapping[field];
    if (target) mapped[target] = messages;
  }
  return mapped;
}

const SKILL_FIELDS: Record<string, TechnicianSkillFormField> = {
  skill_id: 'skillId',
  proficiency: 'proficiency',
  experience_years: 'experienceYears',
  hourly_rate: 'hourlyRate',
  travel_fee: 'travelFee',
};

export const mapTechnicianSkillFieldErrors = (errors: FieldErrors): FieldErrors =>
  mapFieldErrors(errors, SKILL_FIELDS);

const SERVICE_AREA_FIELDS: Record<string, keyof ServiceAreaFormValues> = {
  address: 'address',
  city: 'city',
  radius: 'radiusKm',
  zones: 'zones',
};

export const mapServiceAreaFieldErrors = (errors: FieldErrors): FieldErrors =>
  mapFieldErrors(errors, SERVICE_AREA_FIELDS);
