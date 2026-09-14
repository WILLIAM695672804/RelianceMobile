import type { SessionState } from './types';

/** Gardes de `Stack.Protected` : exactement une est vraie à tout instant. */
export interface NavigationGuards {
  isBooting: boolean;
  isGuest: boolean;
  isClient: boolean;
  isTechnicien: boolean;
  isAgence: boolean;
  /** Administrateur (espace web) ou rôle non reconnu. */
  isWebOnly: boolean;
}

export function computeGuards({
  status,
  user,
}: Pick<SessionState, 'status' | 'user'>): NavigationGuards {
  const signedIn = (status === 'authenticated' || status === 'degraded') && user !== null;
  const role = signedIn ? user.role : null;
  return {
    isBooting: status === 'unknown' || (status !== 'unauthenticated' && !signedIn),
    isGuest: status === 'unauthenticated',
    isClient: role === 'client',
    isTechnicien: role === 'technicien',
    isAgence: role === 'agence',
    isWebOnly: role === 'admin' || role === 'unknown',
  };
}
