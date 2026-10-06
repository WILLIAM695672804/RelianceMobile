import { z } from 'zod';

const asList = <T>(items: T[] | null | undefined): T[] => items ?? [];

/**
 * Membre de l'agence tel qu'exposé par `GET /my-agency` : le serveur renvoie le modèle
 * `User` complet ; seule l'identité utile est retenue.
 */
export const agencyMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z
    .string()
    .nullish()
    .transform((value) => value ?? null),
  verified: z
    .boolean()
    .nullish()
    .transform((value) => value ?? false),
});
export type AgencyMember = z.infer<typeof agencyMemberSchema>;

export const agencySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullish(),
  address: z.string().nullish(),
  contact_email: z.string().nullish(),
  contact_phone: z.string().nullish(),
  members: z.array(agencyMemberSchema).nullish().transform(asList),
  members_count: z.number().nullish(),
  created_at: z.string().nullish(),
});
export type Agency = z.infer<typeof agencySchema>;

export const myAgencyResponseSchema = z.object({ data: agencySchema.nullable() });
export const agencyResponseSchema = z.object({ data: agencySchema });
export const writtenAgencyResponseSchema = z.object({ message: z.string(), data: agencySchema });

/** Adhésion d'un technicien (`GET /agencies/{id}/members`). */
export const membershipSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  role: z.string(),
  joined_at: z.string().nullish(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      avatar_url: z.string().nullish(),
      verified: z.boolean().nullish(),
    })
    .nullish(),
});
export type AgencyMembership = z.infer<typeof membershipSchema>;

export const membersResponseSchema = z.object({ data: z.array(membershipSchema) });

export const messageResponseSchema = z.object({ message: z.string() });

export const MEMBER_ROLES = ['member', 'admin'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

/** Formulaire de la fiche d'agence, partagé par la création et la mise à jour. */
export const agencyFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'agency:form.errors.nameRequired')
    .max(255, 'agency:form.errors.nameTooLong'),
  description: z.string().trim().max(2000, 'agency:form.errors.descriptionTooLong'),
  address: z.string().trim().max(500, 'agency:form.errors.addressTooLong'),
  phone: z.string().trim().max(20, 'agency:form.errors.phoneTooLong'),
  email: z
    .string()
    .trim()
    .refine(
      (value): boolean => value.length === 0 || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
      'agency:form.errors.emailInvalid',
    ),
});
export type AgencyFormValues = z.infer<typeof agencyFormSchema>;

/** Corps de `POST /agencies` et `PUT /agencies/{id}`. */
export interface AgencyPayload {
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export function toAgencyPayload(values: AgencyFormValues): AgencyPayload {
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    address: values.address.trim() || null,
    phone: values.phone.trim() || null,
    email: values.email.trim() || null,
  };
}

/** Formulaire d'ajout d'un membre. */
export const memberFormSchema = z.object({
  userId: z.string().min(1, 'agency:team.errors.technicianRequired'),
  role: z.enum(MEMBER_ROLES),
});
export type MemberFormValues = z.infer<typeof memberFormSchema>;

/** Corps de `POST /agencies/{id}/members`. */
export interface MemberPayload {
  userId: string;
  role: MemberRole;
}
