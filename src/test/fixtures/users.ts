import type { Role, SessionUser } from '@/core/session';

/** Utilisateur au format de l'API (`/auth/me`), sans donnée personnelle réelle. */
export function buildApiUser(role: string = 'client', overrides: Record<string, unknown> = {}) {
  return {
    id: `user-${role}`,
    name: `Utilisateur ${role}`,
    email: `${role}@example.test`,
    phone: null,
    avatar_url: null,
    email_verified_at: '2026-01-10T08:00:00.000000Z',
    is_active: true,
    verified: true,
    two_factor_enabled: false,
    rating: '0.00',
    roles: [{ id: 1, name: role, guard_name: 'web' }],
    ...overrides,
  };
}

export function buildSessionUser(
  role: Role = 'client',
  overrides: Partial<SessionUser> = {},
): SessionUser {
  return {
    id: `user-${role}`,
    name: `Utilisateur ${role}`,
    email: `${role}@example.test`,
    role,
    emailVerified: true,
    avatarUrl: null,
    ...overrides,
  };
}
