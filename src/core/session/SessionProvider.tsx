import { createContext, useContext, type ReactNode } from 'react';
import { useStore } from 'zustand';

import type { RestoreOutcome } from './restoreSession';
import type { SessionStore, SessionStoreState } from './store';
import type { SessionUser } from './types';

/** Opérations de session exposées aux écrans et aux features. */
export interface SessionActions {
  restore(): Promise<RestoreOutcome>;
  /** Enregistre l'utilisateur authentifié (connexion, inscription). */
  signIn(user: SessionUser): void;
  logout(): Promise<void>;
}

interface SessionContextValue {
  store: SessionStore;
  actions: SessionActions;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  store,
  actions,
  children,
}: SessionContextValue & { children: ReactNode }) {
  return <SessionContext.Provider value={{ store, actions }}>{children}</SessionContext.Provider>;
}

function useSessionContext(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('Les hooks de session doivent être utilisés sous <SessionProvider>.');
  return value;
}

/** Sélection réactive dans l'état de session ; le sélecteur doit renvoyer une valeur stable. */
export function useSession<T>(selector: (state: SessionStoreState) => T): T {
  return useStore(useSessionContext().store, selector);
}

export function useSessionActions(): SessionActions {
  return useSessionContext().actions;
}
