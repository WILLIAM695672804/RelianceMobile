import type { Role } from './types';

/** Ordre de priorité lorsqu'un utilisateur cumule plusieurs rôles. */
const ROLE_PRIORITY = ['admin', 'agence', 'technicien', 'client'] as const;

/** Rôle applicatif déduit des noms de rôles Spatie (`user.roles[].name`). */
export function resolveRole(names: readonly string[]): Role {
  return ROLE_PRIORITY.find((role) => names.includes(role)) ?? 'unknown';
}
