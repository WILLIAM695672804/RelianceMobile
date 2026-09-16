import type { SessionState } from './types';

/**
 * Gardes de `Stack.Protected`.
 * Les six premières sont exclusives : exactement une est vraie à tout instant.
 * `isMember` s'y superpose pour les écrans communs aux rôles mobiles (groupe `(profil)`).
 */
export interface NavigationGuards {
  isBooting: boolean;
  isGuest: boolean;
  isClient: boolean;
  isTechnicien: boolean;
  isAgence: boolean;
  /** Administrateur (espace web) ou rôle non reconnu. */
  isWebOnly: boolean;
  /** Client, technicien ou agence. */
  isMember: boolean;
}

export function computeGuards({
  status,
  user,
}: Pick<SessionState, 'status' | 'user'>): NavigationGuards {
  const signedIn = (status === 'authenticated' || status === 'degraded') && user !== null;
  const role = signedIn ? user.role : null;
  const isClient = role === 'client';
  const isTechnicien = role === 'technicien';
  const isAgence = role === 'agence';
  return {
    isBooting: status === 'unknown' || (status !== 'unauthenticated' && !signedIn),
    isGuest: status === 'unauthenticated',
    isClient,
    isTechnicien,
    isAgence,
    isWebOnly: role === 'admin' || role === 'unknown',
    isMember: isClient || isTechnicien || isAgence,
  };
}
