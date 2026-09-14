import { createStore, type StoreApi } from 'zustand/vanilla';

import type { SessionState, SessionUser } from './types';

export interface SessionStoreActions {
  setAuthenticated(user: SessionUser): void;
  setDegraded(user: SessionUser): void;
  setUnauthenticated(options?: { expired?: boolean }): void;
  acknowledgeExpiry(): void;
}

export type SessionStoreState = SessionState & SessionStoreActions;
export type SessionStore = StoreApi<SessionStoreState>;

/** Crée le store de session (une instance par application, une par test). */
export function createSessionStore(): SessionStore {
  return createStore<SessionStoreState>()((set) => ({
    status: 'unknown',
    user: null,
    expired: false,
    setAuthenticated: (user) => set({ status: 'authenticated', user, expired: false }),
    setDegraded: (user) => set({ status: 'degraded', user, expired: false }),
    setUnauthenticated: ({ expired = false } = {}) =>
      set({ status: 'unauthenticated', user: null, expired }),
    acknowledgeExpiry: () => set({ expired: false }),
  }));
}
