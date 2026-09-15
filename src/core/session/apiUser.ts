import type { AxiosInstance } from 'axios';
import { z } from 'zod';

import { parseResponse } from '@/core/api/parseResponse';

import { resolveRole } from './roles';
import type { SessionUser } from './types';

/**
 * Utilisateur tel que renvoyé par `/auth/me`, `/auth/login` et `/auth/register`.
 * Schéma non « loose » : les champs non déclarés (dont `two_factor_secret`) sont écartés.
 */
export const apiUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullish(),
  avatar_url: z.string().nullish(),
  email_verified_at: z.string().nullish(),
  is_active: z.boolean().optional(),
  verified: z.boolean().optional(),
  two_factor_enabled: z.boolean().optional(),
  rating: z.union([z.string(), z.number()]).nullish(),
  roles: z.array(z.object({ name: z.string() })).default([]),
});

export type ApiUser = z.infer<typeof apiUserSchema>;

const currentUserResponseSchema = z.object({ user: apiUserSchema });

/** Profil minimal de session dérivé de l'utilisateur d'API. */
export function toSessionUser(user: ApiUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: resolveRole(user.roles.map((role) => role.name)),
    emailVerified: Boolean(user.email_verified_at),
    avatarUrl: user.avatar_url ?? null,
  };
}

/** `GET /auth/me` : utilisateur courant, validé. */
export async function fetchCurrentUser(client: AxiosInstance): Promise<SessionUser> {
  const { data } = await client.get('/auth/me');
  return toSessionUser(parseResponse(currentUserResponseSchema, data).user);
}
