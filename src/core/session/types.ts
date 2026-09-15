/** Rôle applicatif ; `admin` est redirigé vers le web, `unknown` vers un écran d'erreur. */
export type Role = 'client' | 'technicien' | 'agence' | 'admin' | 'unknown';

/** Profil minimal de l'utilisateur connecté, persistable hors ligne. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  avatarUrl: string | null;
}

/**
 * - `unknown` : restauration en cours ou impossible faute de réseau ;
 * - `authenticated` : session confirmée par le serveur ;
 * - `degraded` : hors ligne, profil relu depuis le cache ;
 * - `unauthenticated` : aucune session.
 */
export type SessionStatus = 'unknown' | 'authenticated' | 'degraded' | 'unauthenticated';

export interface SessionState {
  status: SessionStatus;
  user: SessionUser | null;
  /** Vrai lorsque la session vient d'expirer (message affiché sur l'écran de connexion). */
  expired: boolean;
}
