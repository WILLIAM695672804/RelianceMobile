import { z } from 'zod';

import { apiUserSchema } from '@/core/session';

// --- Réponses -------------------------------------------------------------

export const messageResponseSchema = z.object({ message: z.string() });

/** `PUT /auth/profile` : modèle brut ; les rôles, non garantis, valent `[]` à défaut. */
export const profileUpdateResponseSchema = z.object({ message: z.string(), user: apiUserSchema });

/** `POST /auth/profile/avatar` : URL absolue construite sur `APP_URL`. */
export const avatarResponseSchema = z.object({ message: z.string(), avatar_url: z.string() });

/** Adresse de l'utilisateur (`locations`) ; `geom` et `meta` sont écartés. */
export const locationSchema = z.object({
  id: z.string(),
  label: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  is_default: z.boolean().default(false),
});
export type Location = z.infer<typeof locationSchema>;

export const locationListSchema = z.array(locationSchema);
export const locationCreatedResponseSchema = z.object({
  message: z.string(),
  location: locationSchema,
});

// --- Formulaires (messages = clés de traduction du namespace `profile`) ---

const requiredText = z.string().trim().min(1, { error: 'profile:validation.required' });

/** Règles alignées sur `ProfileController::update`. */
export const profileFormSchema = z.object({
  name: requiredText.max(255, { error: 'profile:validation.tooLong' }),
  email: requiredText.pipe(z.email({ error: 'profile:validation.email' })),
  phone: z.string().trim().max(50, { error: 'profile:validation.tooLong' }),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/** Corps de `PUT /auth/profile` : toutes les clés sont facultatives (`sometimes`). */
export interface ProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
}

/**
 * Seuls les champs modifiés sont envoyés : un courriel inchangé ne relance pas la vérification.
 * Un téléphone vide n'est jamais envoyé (Laravel le convertit en `null`, que la règle `string` refuse).
 */
export function toProfilePayload(
  values: ProfileFormValues,
  initial: ProfileFormValues,
): ProfilePayload {
  const payload: ProfilePayload = {};
  if (values.name !== initial.name) payload.name = values.name;
  if (values.email !== initial.email) payload.email = values.email;
  if (values.phone !== initial.phone && values.phone.length > 0) payload.phone = values.phone;
  return payload;
}

/** Règles alignées sur `ProfileController::changePassword` ; le formulaire est le corps envoyé. */
export const passwordFormSchema = z
  .object({
    current_password: z.string().min(1, { error: 'profile:validation.required' }),
    new_password: z.string().min(8, { error: 'profile:validation.passwordLength' }),
    new_password_confirmation: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.new_password !== values.new_password_confirmation) {
      ctx.addIssue({
        code: 'custom',
        path: ['new_password_confirmation'],
        message: 'profile:validation.passwordMismatch',
      });
    }
  });
export type PasswordFormValues = z.infer<typeof passwordFormSchema>;

/** Règles alignées sur `UserLocationController::store`. */
export const locationFormSchema = z.object({
  label: requiredText.max(50, { error: 'profile:validation.tooLong' }),
  address: requiredText,
  city: z.string().trim(),
  is_default: z.boolean(),
});
export type LocationFormValues = z.infer<typeof locationFormSchema>;

export interface LocationPayload {
  label: string;
  address: string;
  city?: string;
  is_default: boolean;
}

export function toLocationPayload(values: LocationFormValues): LocationPayload {
  return {
    label: values.label,
    address: values.address,
    ...(values.city.length > 0 ? { city: values.city } : {}),
    is_default: values.is_default,
  };
}

/** Règles alignées sur `RoleUpgradeController::requestUpgrade` (compétences : Plan 3). */
export const upgradeFormSchema = z.object({
  motivation: z.string().trim().min(20, { error: 'profile:validation.motivationLength' }),
  bio: z.string().trim(),
});
export type UpgradeFormValues = z.infer<typeof upgradeFormSchema>;

export interface UpgradePayload {
  motivation: string;
  bio?: string;
}

export function toUpgradePayload(values: UpgradeFormValues): UpgradePayload {
  return values.bio.length > 0
    ? { motivation: values.motivation, bio: values.bio }
    : { motivation: values.motivation };
}

/** Code TOTP de l'écran Paramètres. */
export const twoFactorFormSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: 'profile:validation.twoFactorCode' }),
});
export type TwoFactorFormValues = z.infer<typeof twoFactorFormSchema>;
