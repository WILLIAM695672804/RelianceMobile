import type { ApiUser, SessionUser } from '@/core/session';

/**
 * Reporte un profil modifié dans l'utilisateur de session.
 * Le rôle est conservé : `PUT /auth/profile` renvoie le modèle sans ses rôles.
 */
export function applyProfileToSession(current: SessionUser, user: ApiUser): SessionUser {
  return {
    ...current,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.email_verified_at),
    avatarUrl: user.avatar_url ?? current.avatarUrl,
  };
}
