export { apiUserSchema, fetchCurrentUser, toSessionUser, type ApiUser } from './apiUser';
export { computeGuards, type NavigationGuards } from './guards';
export { performLogout, type LogoutDeps, type LogoutOptions } from './performLogout';
export { createProfileCache, PROFILE_CACHE_KEY, type ProfileCache } from './profileCache';
export { restoreSession, type RestoreOutcome, type RestoreSessionDeps } from './restoreSession';
export { resolveRole } from './roles';
export {
  SessionProvider,
  useSession,
  useSessionActions,
  type SessionActions,
} from './SessionProvider';
export {
  createSessionStore,
  type SessionStore,
  type SessionStoreActions,
  type SessionStoreState,
} from './store';
export type { Role, SessionState, SessionStatus, SessionUser } from './types';
