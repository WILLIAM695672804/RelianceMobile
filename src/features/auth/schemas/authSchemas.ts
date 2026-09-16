import { z } from 'zod';

import { apiUserSchema } from '@/core/session';

// --- Réponses -------------------------------------------------------------

/** `POST /auth/login` (200) et `POST /auth/register` (201). */
export const loginResponseSchema = z.object({ message: z.string(), user: apiUserSchema });
export const registerResponseSchema = loginResponseSchema;

/** Réponses réduites à un message (déconnexion, mot de passe, 2FA, vérification). */
export const messageResponseSchema = z.object({ message: z.string() });

/** `POST /auth/2fa/generate`. */
export const twoFactorSetupSchema = z.object({ secret: z.string(), qr_code_svg: z.string() });

// --- Formulaires (messages = clés de traduction du namespace `auth`) ------

const requiredText = z.string().trim().min(1, { error: 'auth:validation.required' });
const emailField = requiredText.pipe(z.email({ error: 'auth:validation.email' }));

export const loginFormSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: 'auth:validation.required' }),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const REGISTRABLE_ROLES = ['client', 'technicien', 'agence'] as const;
export type RegistrableRole = (typeof REGISTRABLE_ROLES)[number];

/** Règles alignées sur `RegisterRequest` du backend. */
export const registerFormSchema = z
  .object({
    role: z.enum(REGISTRABLE_ROLES),
    name: requiredText.max(255, { error: 'auth:validation.tooLong' }),
    email: emailField,
    phone: z.string().trim().max(50, { error: 'auth:validation.tooLong' }),
    password: z.string().min(8, { error: 'auth:validation.passwordLength' }),
    password_confirmation: z.string(),
    agency_name: z.string().trim().max(255, { error: 'auth:validation.tooLong' }),
    address: z.string().trim().max(500, { error: 'auth:validation.tooLong' }),
    description: z.string().trim(),
    bio: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.password_confirmation) {
      ctx.addIssue({
        code: 'custom',
        path: ['password_confirmation'],
        message: 'auth:validation.passwordMismatch',
      });
    }
    if (values.role === 'agence' && values.agency_name.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['agency_name'], message: 'auth:validation.required' });
    }
  });
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

/** Corps de `POST /auth/register`. */
export interface RegisterPayload {
  role: RegistrableRole;
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  agency_name?: string;
  address?: string;
  description?: string;
  bio?: string;
}

const optional = (value: string): string | undefined => (value.length > 0 ? value : undefined);
const withoutUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;

/** Construit le corps d'inscription : champs du rôle choisi uniquement, champs vides omis. */
export function toRegisterPayload(values: RegisterFormValues): RegisterPayload {
  return withoutUndefined({
    role: values.role,
    name: values.name,
    email: values.email,
    phone: optional(values.phone),
    password: values.password,
    password_confirmation: values.password_confirmation,
    ...(values.role === 'agence'
      ? {
          agency_name: values.agency_name,
          address: optional(values.address),
          description: optional(values.description),
        }
      : {}),
    ...(values.role === 'technicien' ? { bio: optional(values.bio) } : {}),
  });
}

export const forgotPasswordFormSchema = z.object({ email: emailField });
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export const twoFactorCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { error: 'auth:validation.twoFactorCode' }),
});
export type TwoFactorCodeValues = z.infer<typeof twoFactorCodeSchema>;
