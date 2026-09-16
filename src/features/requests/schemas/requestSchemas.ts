import { z } from 'zod';

import { decimalSchema, type UploadFile } from '@/core/api';
import type { FieldErrors } from '@/core/errors';

/** Statuts réellement produits par le backend (voir `docs/contrat-api.md`). */
export const REQUEST_STATUSES = [
  'new',
  'analyzed',
  'quoted',
  'assigned',
  'completed',
  'cancelled',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const TITLE_MAX_LENGTH = 255;
export const DESCRIPTION_MIN_LENGTH = 20;
export const DESCRIPTION_MAX_LENGTH = 1000;
export const MIN_PHOTOS = 1;
export const MAX_PHOTOS = 5;

/** Statut connu, ou valeur inconnue tolérée si le backend enrichit l'énumération. */
const statusSchema = z.enum(REQUEST_STATUSES).or(z.string());

/** Demande d'intervention (`ClientRequestResource`) ; les champs non affichés sont écartés. */
export const requestSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: statusSchema,
  category: z.object({ id: z.string(), name: z.string(), slug: z.string() }).nullish(),
  address: z
    .object({ id: z.string(), city: z.string().nullish(), address: z.string().nullish() })
    .nullish(),
  /** Chemins relatifs du disque public (`requests/photos/…`). */
  photos: z
    .array(z.string())
    .nullish()
    .transform((photos) => photos ?? []),
  analysis: z
    .object({
      estimated_difficulty: z.string().nullish(),
      suggested_price: decimalSchema.nullish(),
    })
    .nullish(),
  proposals_count: z.number().nullish(),
  counterpart: z.object({ id: z.string(), name: z.string() }).nullish(),
  created_at: z.string(),
});
export type ServiceRequest = z.infer<typeof requestSchema>;

export const requestPageSchema = z.object({
  data: z.array(requestSchema),
  meta: z.object({ current_page: z.number(), last_page: z.number(), total: z.number() }),
});
export type RequestPage = z.infer<typeof requestPageSchema>;

export const requestEnvelopeSchema = z.object({ data: requestSchema });

const uploadFileSchema = z.object({ uri: z.string(), name: z.string(), type: z.string() });

const placeSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  label: z.string().nullable(),
  city: z.string().nullable(),
});

/** Formulaire E10 ; les messages sont des clés de traduction. */
export const requestFormSchema = z.object({
  categorySlug: z.string().min(1, 'requests:form.errors.categoryRequired'),
  title: z
    .string()
    .trim()
    .min(1, 'requests:form.errors.titleRequired')
    .max(TITLE_MAX_LENGTH, 'requests:form.errors.titleTooLong'),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN_LENGTH, 'requests:form.errors.descriptionTooShort')
    .max(DESCRIPTION_MAX_LENGTH, 'requests:form.errors.descriptionTooLong'),
  photos: z
    .array(uploadFileSchema)
    .min(MIN_PHOTOS, 'requests:form.errors.photosRequired')
    .max(MAX_PHOTOS, 'requests:form.errors.photosTooMany'),
  place: placeSchema
    .nullable()
    // Retour booléen explicite : un prédicat de type inféré restreindrait le type de sortie à non nul.
    .refine((value): boolean => value !== null, 'requests:form.errors.placeRequired'),
});
export type RequestFormValues = z.infer<typeof requestFormSchema>;
export type RequestFormField = keyof RequestFormValues;

/** Charge utile de `POST /requests`. */
export interface CreateRequestPayload {
  title: string;
  description: string;
  categorySlug: string;
  latitude: number;
  longitude: number;
  addressLabel: string | null;
  city: string | null;
  photos: UploadFile[];
}

export function toCreateRequestPayload(values: RequestFormValues): CreateRequestPayload {
  const { place } = values;
  if (!place) throw new Error('Localisation de la demande manquante.');
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    categorySlug: values.categorySlug,
    latitude: place.latitude,
    longitude: place.longitude,
    addressLabel: place.label,
    city: place.city,
    photos: values.photos,
  };
}

const FORM_FIELD_BY_SERVER_FIELD: Record<string, RequestFormField> = {
  title: 'title',
  description: 'description',
  category_slug: 'categorySlug',
  photos: 'photos',
  latitude: 'place',
  longitude: 'place',
  address_id: 'place',
  address_label: 'place',
  city: 'place',
};

/** Premier message d'erreur du serveur par champ du formulaire (`photos.0` → `photos`). */
export function mapRequestFieldErrors(
  errors: FieldErrors,
): Partial<Record<RequestFormField, string>> {
  const result: Partial<Record<RequestFormField, string>> = {};
  for (const [serverField, messages] of Object.entries(errors)) {
    const field = FORM_FIELD_BY_SERVER_FIELD[serverField.split('.')[0] ?? serverField];
    const message = messages[0];
    if (field && message && result[field] === undefined) result[field] = message;
  }
  return result;
}
